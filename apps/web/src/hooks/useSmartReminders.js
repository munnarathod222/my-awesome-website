import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { differenceInDays, addMonths, setDate, startOfDay, isBefore, format, addDays } from 'date-fns';

export const useSmartReminders = (currentUser) => {
  const [isChecking, setIsChecking] = useState(false);

  const checkAndCreateReminders = useCallback(async () => {
    if (!currentUser) return { newRemindersCreated: 0, totalReminders: 0 };
    
    setIsChecking(true);
    let newCount = 0;
    
    try {
      // 1. Fetch existing reminders to prevent duplicates
      const existingReminders = await pb.collection('reminders').getFullList({
        filter: `created_by = "${currentUser.id}"`,
        $autoCancel: false
      });
      
      const activeReminders = existingReminders.filter(r => r.status === 'Active');
      
      const existingDocIds = new Set(activeReminders.filter(r => r.linked_document_id).map(r => r.linked_document_id));
      
      // Compound keys for maintenance duplicate checks
      const existingMaintenanceKeys = new Set(
        activeReminders
          .filter(r => r.reminder_type === 'Kilometric Maintenance' && r.notes)
          .map(r => {
            try {
              const n = JSON.parse(r.notes);
              return `${r.truck_id}_${n.component_name}`;
            } catch (e) {
              return '';
            }
          })
          .filter(Boolean)
      );

      // Duplicate checks for FASTag alerts (one active alert per truck)
      const existingFastagTruckIds = new Set(
        activeReminders.filter(r => r.reminder_type === 'FASTag Low-Balance').map(r => r.truck_id)
      );


      // Fetch master tables to resolve names/registration numbers
      const [trucks, employees, tripLogs, intervals] = await Promise.all([
        pb.collection('trucks').getFullList({ sort: 'truck_number', $autoCancel: false }),
        pb.collection('employees').getFullList({ $autoCancel: false }),
        pb.collection('trip_logs').getFullList({ $autoCancel: false }),
        pb.collection('service_intervals').getFullList({ $autoCancel: false })
      ]);

      const truckMap = {};
      trucks.forEach(t => { truckMap[t.id] = t; });

      const employeeMap = {};
      employees.forEach(e => { employeeMap[e.id] = e; });

      // 2. Process Truck Documents Expiry
      const truckDocs = await pb.collection('truck_documents').getFullList({
        filter: `status != 'Expired'`,
        $autoCancel: false
      });
      
      for (const doc of truckDocs) {
        if (!doc.expiry_date || existingDocIds.has(doc.id)) continue;
        
        const truck = truckMap[doc.truck_id];
        if (!truck) continue;

        const daysToExpiry = differenceInDays(new Date(doc.expiry_date), startOfDay(new Date()));
        
        if (daysToExpiry <= 90 && daysToExpiry >= 0) {
          let priority = daysToExpiry <= 30 ? 'High' : daysToExpiry <= 60 ? 'Medium' : 'Low';
          
          await pb.collection('reminders').create({
            title: `${doc.document_type} Expiring: ${truck.truck_number}`,
            description: `The ${doc.document_type} for ${truck.truck_name || 'Unnamed Vehicle'} (${truck.truck_number}) will expire on ${format(new Date(doc.expiry_date), 'MMM dd, yyyy')}. (${daysToExpiry} days left)`,
            reminder_type: 'Truck Doc Expiry',
            reminder_date: new Date(doc.expiry_date).toISOString(),
            priority,
            status: 'Active',
            created_by: currentUser.id,
            user_id: currentUser.id,
            linked_document_id: doc.id,
            truck_id: truck.id
          }, { $autoCancel: false });
          
          newCount++;
        }
      }

      // 3. Process Employee Documents Expiry
      const employeeDocs = await pb.collection('employee_documents').getFullList({
        filter: `status != 'Expired'`,
        $autoCancel: false
      });
      
      for (const doc of employeeDocs) {
        if (!doc.expiry_date || existingDocIds.has(doc.id)) continue;
        
        const emp = employeeMap[doc.employee_id];
        if (!emp) continue;

        const daysToExpiry = differenceInDays(new Date(doc.expiry_date), startOfDay(new Date()));
        
        if (daysToExpiry <= 90 && daysToExpiry >= 0) {
          let priority = daysToExpiry <= 30 ? 'High' : daysToExpiry <= 60 ? 'Medium' : 'Low';
          
          await pb.collection('reminders').create({
            title: `Employee Doc Expiring: ${doc.document_type}`,
            description: `The ${doc.document_type} for ${emp.name} will expire on ${format(new Date(doc.expiry_date), 'MMM dd, yyyy')}. (${daysToExpiry} days left)`,
            reminder_type: 'Manual',
            reminder_date: new Date(doc.expiry_date).toISOString(),
            priority,
            status: 'Active',
            created_by: currentUser.id,
            user_id: currentUser.id,
            linked_document_id: doc.id
          }, { $autoCancel: false });
          
          newCount++;
        }
      }

      // 4. Process Credit Card Payments
      const paymentDueDates = await pb.collection('payment_due_dates').getFullList({
        filter: `user_id = "${currentUser.id}"`,
        expand: 'card_id',
        $autoCancel: false
      });
      
      for (const due of paymentDueDates) {
        if (!due.payment_due_date) continue;
        
        let nextDueDate = setDate(new Date(), due.payment_due_date);
        
        if (isBefore(nextDueDate, startOfDay(new Date()))) {
          nextDueDate = addMonths(nextDueDate, 1);
        }
        
        // Cycle duplicate check: check if there is an existing reminder (Active or Completed)
        // for linked_card_id in the same month/year cycle as nextDueDate.
        const hasExistingForCycle = existingReminders.some(r => {
          if (r.reminder_type !== 'Credit Card Payment' || r.linked_card_id !== due.card_id) return false;
          const rDate = new Date(r.reminder_date);
          return rDate.getMonth() === nextDueDate.getMonth() && rDate.getFullYear() === nextDueDate.getFullYear();
        });
        
        if (hasExistingForCycle) continue;
        
        const daysToDue = differenceInDays(nextDueDate, startOfDay(new Date()));
        
        if (daysToDue <= 30 && daysToDue >= 0) {
          const card = due.expand?.card_id;
          const cardName = card ? card.card_name : 'Credit Card';
          
          await pb.collection('reminders').create({
            title: `Pay ${cardName} Bill`,
            description: `Statement Bill Amount: ₹${(due.full_payment_amount || 0).toLocaleString('en-IN')}. Minimum Due: ₹${(due.minimum_payment_amount || 0).toLocaleString('en-IN')}.`,
            reminder_type: 'Credit Card Payment',
            reminder_date: nextDueDate.toISOString(),
            priority: 'High',
            status: 'Active',
            created_by: currentUser.id,
            user_id: currentUser.id,
            linked_card_id: due.card_id
          }, { $autoCancel: false });
          
          newCount++;
        }
      }

      // 5. Process Kilometric Maintenance Reminders
      const getLiveOdometer = (truck) => {
        const baseOdo = truck.base_odometer || 0;
        const completedTrips = tripLogs.filter(
          log => log.truck_number === truck.truck_number && log.trip_status === 'Completed'
        );
        const tripKms = completedTrips.reduce((sum, log) => sum + (log.kms || 0), 0);
        return baseOdo + tripKms;
      };

      for (const interval of intervals) {
        const truck = truckMap[interval.truck_id];
        if (!truck) continue;
        
        const mKey = `${truck.id}_${interval.component_name}`;
        if (existingMaintenanceKeys.has(mKey)) continue;

        const liveOdometer = getLiveOdometer(truck);
        const kmsRemaining = (interval.last_serviced_odometer + interval.target_interval_kms) - liveOdometer;

        if (kmsRemaining <= 2000) {
          const priority = kmsRemaining < 0 ? 'High' : kmsRemaining <= 1000 ? 'Medium' : 'Low';
          const notes = JSON.stringify({
            component_name: interval.component_name,
            liveOdometer,
            target_interval_kms: interval.target_interval_kms,
            last_serviced_odometer: interval.last_serviced_odometer,
            kms_remaining: kmsRemaining
          });

          await pb.collection('reminders').create({
            title: `Service Due: ${truck.truck_number}`,
            description: `${interval.component_name} service is due for ${truck.truck_name || 'Unnamed Vehicle'} (${truck.truck_number}). Current Odometer: ${liveOdometer.toLocaleString()} KMs. Remaining KMs: ${kmsRemaining.toLocaleString()} KMs.`,
            reminder_type: 'Kilometric Maintenance',
            reminder_date: new Date().toISOString(),
            priority,
            status: 'Active',
            created_by: currentUser.id,
            user_id: currentUser.id,
            truck_id: truck.id,
            notes
          }, { $autoCancel: false });

          newCount++;
        }
      }

      // 6. Process FASTag Low-Balance Reminders
      const now = new Date();
      const next48Hours = addDays(now, 2);
      const tripsIn48Hours = tripLogs.filter(trip => {
        const isUpcoming = ['Pending', 'Upcoming', 'In Progress'].includes(trip.trip_status);
        if (!isUpcoming || !trip.date) return false;
        const tripDate = new Date(trip.date);
        return tripDate >= now && tripDate <= next48Hours;
      });

      for (const truck of trucks) {
        if (existingFastagTruckIds.has(truck.id)) continue;
        if (truck.fastag_status !== 'Active') continue;

        const truckTrips = tripsIn48Hours.filter(t => t.truck_number === truck.truck_number);
        const safetyMargin = 2000;
        const projectedCost = truckTrips.length > 0
          ? truckTrips.reduce((sum, t) => sum + (t.kms * 1.5 || 1500), 0)
          : 0;

        const threshold = Math.max(safetyMargin, projectedCost);
        const currentBalance = truck.current_fastag_balance || 0;

        if (currentBalance < threshold) {
          const priority = currentBalance < 1000 ? 'High' : 'Medium';
          const notes = JSON.stringify({
            balance: currentBalance,
            projectedCost: threshold
          });

          await pb.collection('reminders').create({
            title: `Low Balance Alert: ${truck.truck_number}`,
            description: `FASTag balance for ${truck.truck_name || 'Unnamed Vehicle'} (${truck.truck_number}) is ₹${currentBalance.toLocaleString()}, which is below the safe threshold of ₹${threshold.toLocaleString()}.`,
            reminder_type: 'FASTag Low-Balance',
            reminder_date: new Date().toISOString(),
            priority,
            status: 'Active',
            created_by: currentUser.id,
            user_id: currentUser.id,
            truck_id: truck.id,
            notes
          }, { $autoCancel: false });

          newCount++;
        }
      }
      
    } catch (e) {
      console.error("Error generating smart reminders:", e);
    }
    
    setIsChecking(false);
    return { newRemindersCreated: newCount };
  }, [currentUser]);

  return { checkAndCreateReminders, isChecking };
};