import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { Download, Search, AlertCircle, FileText, CheckCircle, Bell, XCircle, Table as TableIcon, Loader2, Send, Plus, DollarSign, Clock, ShieldCheck, TrendingUp, Users, ArrowUpRight, CheckSquare, Square, Share2, Eye, Filter, RefreshCw, Layers } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { formatCurrency } from '@/lib/analyticsUtils.js';
import { downloadFile, generatePDF, generateExcel } from '@/lib/downloadUtils.js';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import MarkPaymentPaidModal from '@/components/MarkPaymentPaidModal.jsx';
import SendPaymentReminderModal from '@/components/SendPaymentReminderModal.jsx';
import CancelPaymentRequestModal from '@/components/CancelPaymentRequestModal.jsx';
import CreatePaymentRequestModal from '@/components/CreatePaymentRequestModal.jsx';
import { cn } from '@/lib/utils.js';

const STATUS_COLORS = {
  Paid: 'hsl(var(--success))',
  Pending: 'hsl(var(--warning))',
  Overdue: 'hsl(var(--destructive))',
  Cancelled: 'hsl(var(--muted-foreground))'
};

const parseDateSafe = (dStr) => {
  if (!dStr) return null;
  const normalized = typeof dStr === 'string' && dStr.includes(' ') && !dStr.includes('T') ? dStr.replace(' ', 'T') : dStr;
  const dObj = new Date(normalized);
  return isNaN(dObj.getTime()) ? null : dObj;
};

const PaymentRequestsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [clients, setClients] = useState([]);

  // Modals & Active Tab
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [paidModalReq, setPaidModalReq] = useState(null);
  const [reminderModalReq, setReminderModalReq] = useState(null);
  const [cancelModalReq, setCancelModalReq] = useState(null);
  const [selectedLedgerClient, setSelectedLedgerClient] = useState('all');

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'request_date', direction: 'desc' });
  const [selectedIds, setSelectedIds] = useState([]);

  // Export states
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setSelectedIds([]);
    try {
      const [reqs, cls, allTrips] = await Promise.all([
        pb.collection('payment_requests').getFullList({
          expand: 'trip_id,client_id',
          sort: '-request_date',
          $autoCancel: false
        }),
        pb.collection('clients').getFullList({ sort: 'client_name', $autoCancel: false }),
        pb.collection('trip_logs').getFullList({ sort: '-date', $autoCancel: false }).catch(() => [])
      ]);

      // Lookup map for trips by PocketBase record ID and string trip_id code (e.g. TRIP-227)
      const tripMap = {};
      allTrips.forEach(t => {
        if (t.id) tripMap[t.id] = t;
        if (t.trip_id) tripMap[t.trip_id] = t;
      });

      // Calculate dynamic overdue
      const today = new Date();
      today.setHours(0,0,0,0);

      const mappedReqs = reqs.map(r => {
        let currentStatus = r.status;
        let daysOverdue = 0;
        let effectiveAmount = r.amount;

        // Sync with linked Trip Log if present (by relation expand or tripMap lookup)
        const linkedTrip = r.expand?.trip_id || tripMap[r.trip_id];
        const actualTripDate = linkedTrip?.date || r.request_date;

        if (linkedTrip) {
          const isTripPaid = (linkedTrip.client_payment_status || '').toLowerCase() === 'received' || (linkedTrip.client_payment_status || '').toLowerCase() === 'paid';
          const isDelivered = !linkedTrip.trip_status || linkedTrip.trip_status === 'Delivered';

          if (isTripPaid) {
            currentStatus = 'Paid';
          } else if (!isDelivered) {
            currentStatus = 'In Transit';
          }

          const grossRev = Number(linkedTrip.revenue) || 0;
          const clientAdv = Number(linkedTrip.advance_received_from_client) || 0;
          const calculatedNet = Math.max(0, grossRev - clientAdv);
          if (calculatedNet > 0) {
            effectiveAmount = calculatedNet;
          }

          // Self-heal DB record if discrepancy found
          if ((r.amount !== effectiveAmount || (isTripPaid && r.status !== 'Paid')) && r.id) {
            pb.collection('payment_requests').update(r.id, {
              amount: effectiveAmount,
              status: isTripPaid ? 'Paid' : r.status
            }, { $autoCancel: false }).catch(err => console.warn('Background request sync failed:', err));
          }
        }

        if (currentStatus === 'Pending' && r.due_date) {
          const due = parseDateSafe(r.due_date);
          if (due) {
            due.setHours(0,0,0,0);
            if (today > due) {
              currentStatus = 'Overdue';
              daysOverdue = differenceInDays(today, due);
            }
          }
        }

        return { 
          ...r, 
          amount: effectiveAmount, 
          status: currentStatus, 
          calculatedStatus: currentStatus, 
          daysOverdue,
          linkedTrip,
          actualTripDate
        };
      });

      // Fetch ONLY DELIVERED unpaid trips to auto-generate requests if they don't exist
      const unpaidTrips = await pb.collection('trip_logs').getFullList({
        filter: '(client_payment_status = "pending" || client_payment_status = "delayed") && (trip_status = "Delivered" || trip_status = "") && client_id != ""',
        $autoCancel: false
      });

      const existingTripIds = new Set(reqs.map(r => r.trip_id));
      const tripsToGenerate = unpaidTrips.filter(t => !existingTripIds.has(t.id));

      if (tripsToGenerate.length > 0) {
        console.log(`Auto-generating ${tripsToGenerate.length} payment requests for unpaid trips...`);
        const generatedRequests = [];
        for (const trip of tripsToGenerate) {
          try {
            const tripDate = trip.date ? (parseDateSafe(trip.date) || new Date()) : new Date();
            const dueDate = new Date(tripDate);
            dueDate.setDate(dueDate.getDate() + 7); // Default due date in 7 days after the trip date
            
            const grossRev = Number(trip.revenue) || 0;
            const clientAdv = Number(trip.advance_received_from_client) || 0;
            const netDue = Math.max(0, grossRev - clientAdv);

            const newReq = await pb.collection('payment_requests').create({
              trip_id: trip.id,
              client_id: trip.client_id,
              amount: netDue > 0 ? netDue : grossRev,
              request_date: tripDate.toISOString(),
              due_date: dueDate.toISOString(),
              status: 'Pending',
              notes: `Auto-generated from unpaid Trip Log: ${trip.trip_id || trip.id}`
            }, { $autoCancel: false });
            
            generatedRequests.push({
              ...newReq,
              calculatedStatus: 'Pending',
              daysOverdue: 0,
              expand: {
                trip_id: trip,
                client_id: cls.find(c => c.id === trip.client_id)
              }
            });
          } catch (err) {
            console.error(`Failed to auto-generate request for trip ${trip.id}:`, err);
          }
        }
        
        // Merge with local storage cache
        let localReqs = [];
        try {
          localReqs = JSON.parse(localStorage.getItem('jbc_payment_requests') || '[]');
        } catch (e) {}

        const allRemote = [...mappedReqs, ...generatedRequests];
        const remoteMap = new Map(allRemote.map(r => [r.id, r]));

        localReqs.forEach(lr => {
          if (!remoteMap.has(lr.id)) {
            // Check overdue for local items
            let currentStatus = lr.status;
            let daysOverdue = 0;
            if (lr.status === 'Pending' && lr.due_date) {
              const due = parseDateSafe(lr.due_date);
              if (due) {
                due.setHours(0,0,0,0);
                if (today > due) {
                  currentStatus = 'Overdue';
                  daysOverdue = differenceInDays(today, due);
                }
              }
            }
            remoteMap.set(lr.id, { ...lr, calculatedStatus: currentStatus, daysOverdue });
          }
        });

        setRequests(Array.from(remoteMap.values()));
      } else {
        // Merge mappedReqs with local storage
        let localReqs = [];
        try {
          localReqs = JSON.parse(localStorage.getItem('jbc_payment_requests') || '[]');
        } catch (e) {}

        const remoteMap = new Map(mappedReqs.map(r => [r.id, r]));
        localReqs.forEach(lr => {
          if (!remoteMap.has(lr.id)) {
            let currentStatus = lr.status;
            let daysOverdue = 0;
            if (lr.status === 'Pending' && lr.due_date) {
              const due = parseDateSafe(lr.due_date);
              if (due) {
                due.setHours(0,0,0,0);
                if (today > due) {
                  currentStatus = 'Overdue';
                  daysOverdue = differenceInDays(today, due);
                }
              }
            }
            remoteMap.set(lr.id, { ...lr, calculatedStatus: currentStatus, daysOverdue });
          }
        });

        setRequests(Array.from(remoteMap.values()));
      }
      setClients(cls);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load payment requests');
      toast.error('Failed to sync data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleGenerateInvoicePDF = async (r) => {
    try {
      const clientName = r.expand?.client_id?.client_name || 'Client';
      const address = r.expand?.client_id?.company_address || r.expand?.client_id?.address || 'Customer Address Details';
      const email = r.expand?.client_id?.email || '';
      const phone = r.expand?.client_id?.phone || '';
      
      const tripObj = r.expand?.trip_id || r.linkedTrip || {};
      const tripId = tripObj.trip_id || r.trip_id || '';
      const actualTripDateVal = r.actualTripDate || tripObj.date || r.request_date;
      
      const invoiceObj = {
        invoice_number: `INV-${r.id.substring(0, 8).toUpperCase()}`,
        invoice_date: actualTripDateVal,
        due_date: r.due_date || (() => {
          const parsed = parseDateSafe(actualTripDateVal);
          const tVal = parsed ? parsed.getTime() : Date.now();
          return new Date(tVal + 7 * 24 * 60 * 60 * 1000).toISOString();
        })(),
        customer_name: clientName,
        customer_address: address,
        customer_email: email,
        customer_phone: phone,
        status: r.calculatedStatus,
        subtotal: r.amount,
        tax_rate: 0,
        tax_amount: 0,
        total_amount: r.amount
      };

      const tripDateFormatted = actualTripDateVal && parseDateSafe(actualTripDateVal) ? format(parseDateSafe(actualTripDateVal), 'dd MMM yyyy') : '-';

      const columns = [
        { header: 'Trip Date', key: 'trip_date' },
        { header: 'Description', key: 'description' },
        { header: 'Trip ID', key: 'trip_id' },
        { header: 'Amount', key: 'amount' }
      ];

      const data = [
        {
          trip_date: tripDateFormatted,
          description: `Freight charges for trip: ${tripId}`,
          trip_id: tripId,
          amount: `₹${Number(r.amount || 0).toLocaleString('en-IN')}`
        }
      ];

      const blob = generatePDF(data, `Invoice_${tripId}`, {
        type: 'invoice',
        invoiceObj,
        columns
      });

      downloadFile(blob, `Invoice_${tripId}.pdf`);
      toast.success('Invoice PDF generated and downloaded');
      return true;
    } catch (err) {
      console.error('Invoice PDF generation failed:', err);
      toast.error('Failed to generate Invoice PDF: ' + err.message);
      return false;
    }
  };

  const handleGenerateBulkInvoicePDF = async () => {
    if (selectedReqs.length === 0) return null;
    try {
      const clientReq = selectedReqs[0];
      const clientName = clientReq.expand?.client_id?.client_name || 'Client';
      const address = clientReq.expand?.client_id?.company_address || clientReq.expand?.client_id?.address || 'Customer Address Details';
      const email = clientReq.expand?.client_id?.email || '';
      const phone = clientReq.expand?.client_id?.phone || '';

      const invoiceObj = {
        invoice_number: `INV-B${Date.now().toString().substring(7)}`,
        invoice_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        customer_name: clientName,
        customer_address: address,
        customer_email: email,
        customer_phone: phone,
        status: 'Pending',
        subtotal: bulkTotal,
        tax_rate: 0,
        tax_amount: 0,
        total_amount: bulkTotal
      };

      const columns = [
        { header: 'Sl', key: 'sl_no' },
        { header: 'Trip Date', key: 'date' },
        { header: 'Trip ID', key: 'trip_id' },
        { header: 'Pickup -> Drop Location', key: 'route' },
        { header: 'Vehicle', key: 'vehicle' },
        { header: 'Freight (₹)', key: 'amount' }
      ];

      const data = selectedReqs.map((r, idx) => {
        const tripObj = r.expand?.trip_id || r.linkedTrip || {};
        const tripId = tripObj.trip_id || r.trip_id || `TRIP-${idx + 1}`;
        const actualTripDateVal = r.actualTripDate || tripObj.date || r.expand?.trip_id?.date || r.request_date;
        const dateStr = actualTripDateVal && parseDateSafe(actualTripDateVal) 
          ? format(parseDateSafe(actualTripDateVal), 'dd MMM yyyy') 
          : '-';
        const routeStr = tripObj.origin && tripObj.destination 
          ? `${tripObj.origin} ➔ ${tripObj.destination}` 
          : (tripObj.route || 'Freight Service');
        const vehicleStr = tripObj.truck_number || '-';

        return {
          sl_no: String(idx + 1),
          date: dateStr,
          trip_id: tripId,
          route: routeStr,
          vehicle: vehicleStr,
          amount: `₹${Number(r.amount || 0).toLocaleString('en-IN')}`
        };
      });

      const filename = `Statement_Unpaid_${clientName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}`;
      const blob = generatePDF(data, filename, {
        type: 'invoice',
        invoiceObj,
        columns
      });

      downloadFile(blob, `${filename}.pdf`);
      toast.success('Itemized Unpaid Statement PDF generated and downloaded');
      return `${filename}.pdf`;
    } catch (err) {
      console.error('Bulk Statement PDF generation failed:', err);
      toast.error('Failed to generate Statement PDF: ' + err.message);
      return null;
    }
  };

  const handleShareWhatsApp = async (r) => {
    // Generate and download invoice first
    await handleGenerateInvoicePDF(r);

    const clientName = r.expand?.client_id?.client_name || 'Client';
    const contactPerson = r.expand?.client_id?.contact_person || '';
    const phone = r.expand?.client_id?.phone || '';
    const tripId = r.expand?.trip_id?.trip_id || r.trip_id || '';
    const amount = r.amount ? `₹${Number(r.amount).toLocaleString('en-IN')}` : '₹0';
    const reqDate = r.request_date && parseDateSafe(r.request_date) ? format(parseDateSafe(r.request_date), 'dd MMM yyyy') : '';
    const dueDate = r.due_date && parseDateSafe(r.due_date) ? format(parseDateSafe(r.due_date), 'dd MMM yyyy') : '';

    const tripObj = r.expand?.trip_id;
    const routeStr = tripObj?.origin && tripObj?.destination ? `${tripObj.origin} ➡️ ${tripObj.destination}` : (tripObj?.route || '-');
    const tripDetails = tripObj ? `
*Trip Details:*
• *Trip ID:* ${tripObj.trip_id || tripId}
• *Date:* ${tripObj.date && parseDateSafe(tripObj.date) ? format(parseDateSafe(tripObj.date), 'dd MMM yyyy') : ''}
• *Pickup ➔ Drop:* ${routeStr}
• *Vehicle:* ${tripObj.truck_number || '-'}
• *Driver:* ${tripObj.driver_name || '-'}` : `
*Trip Details:*
• *Trip:* ${tripId}`;

    const greeting = contactPerson ? `Hello ${contactPerson},` : `Hello,`;
    const message = `${greeting}

This is an official payment request from *Jai Bhavani Cargo*.

*Payment Request Details:*
• *Client:* ${clientName}
• *Amount:* ${amount}
• *Request Date:* ${reqDate}
• *Due Date:* ${dueDate}
${tripDetails}

_Note: We have generated and downloaded the Invoice PDF [Invoice_${tripId}.pdf] for your records. Please attach it to this chat._

Please process the payment at your earliest convenience. Thank you!

Best Regards,
*Jai Bhavani Cargo Team*`;

    const encodedText = encodeURIComponent(message);
    const cleanedPhone = phone.replace(/\D/g, '');
    let finalPhone = cleanedPhone;
    if (cleanedPhone.length === 10) {
      finalPhone = `91${cleanedPhone}`;
    }

    const whatsappUrl = finalPhone 
      ? `https://wa.me/${finalPhone}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;

    window.open(whatsappUrl, '_blank');
  };

  const selectedReqs = useMemo(() => {
    return requests.filter(r => selectedIds.includes(r.id));
  }, [requests, selectedIds]);

  const bulkTotal = useMemo(() => {
    return selectedReqs.reduce((sum, r) => sum + (r.amount || 0), 0);
  }, [selectedReqs]);

  const isSameClient = useMemo(() => {
    if (selectedReqs.length === 0) return false;
    const clientIds = new Set(selectedReqs.map(r => r.client_id));
    return clientIds.size === 1;
  }, [selectedReqs]);

  const handleBulkWhatsApp = async () => {
    if (selectedReqs.length === 0) return;
    
    // Generate and download bulk invoice first
    const pdfFilename = await handleGenerateBulkInvoicePDF();
    
    const clientReq = selectedReqs[0];
    const clientName = clientReq.expand?.client_id?.client_name || 'Valued Customer';
    const contactPerson = clientReq.expand?.client_id?.contact_person || '';
    const phone = clientReq.expand?.client_id?.phone || '';

    const greeting = contactPerson ? `Dear ${contactPerson},` : `Dear ${clientName},`;
    
    let tripBreakdown = '';
    selectedReqs.forEach((r, idx) => {
      const tripObj = r.expand?.trip_id || {};
      const tripId = tripObj.trip_id || r.trip_id || `TRIP-${idx + 1}`;
      const reqDate = r.request_date && parseDateSafe(r.request_date) ? format(parseDateSafe(r.request_date), 'dd MMM yyyy') : '';
      const routeStr = tripObj.origin && tripObj.destination ? `${tripObj.origin} ➡️ ${tripObj.destination}` : (tripObj.route || '');
      const vehicleStr = tripObj.truck_number ? ` | 🚛 ${tripObj.truck_number}` : '';
      const amt = r.amount ? `₹${Number(r.amount).toLocaleString('en-IN')}` : '₹0';
      
      tripBreakdown += `${idx + 1}️⃣ *Trip:* ${tripId} (${reqDate})\n   📍 *Route:* ${routeStr || 'Freight Service'}${vehicleStr}\n   💵 *Freight Amount:* ${amt}\n\n`;
    });

    const message = `${greeting}

Here is the itemized summary of your outstanding payment dues with *Jai Bhavani Cargo*:

*OUTSTANDING DUES SUMMARY:*
• *Client:* ${clientName}
• *Total Unpaid Trips:* ${selectedReqs.length}
• *Total Outstanding Amount:* *₹${bulkTotal.toLocaleString('en-IN')}*

📋 *ITEMIZED TRIP BREAKDOWN:*
-----------------------------------------
${tripBreakdown}-----------------------------------------
💰 *TOTAL AMOUNT DUE:* *₹${bulkTotal.toLocaleString('en-IN')}*
-----------------------------------------

${pdfFilename ? `_Note: The official Statement PDF [${pdfFilename}] has been downloaded to your device. Please attach it to this message._\n\n` : ''}Please process the payment at your earliest convenience. Thank you for your continued business!

Best Regards,
*Jai Bhavani Cargo Team*`;

    const encodedText = encodeURIComponent(message);
    const cleanedPhone = phone.replace(/\D/g, '');
    let finalPhone = cleanedPhone;
    if (cleanedPhone.length === 10) {
      finalPhone = `91${cleanedPhone}`;
    }

    const whatsappUrl = finalPhone 
      ? `https://wa.me/${finalPhone}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;

    window.open(whatsappUrl, '_blank');
  };

  const handleBulkMarkAsPaid = async () => {
    if (selectedIds.length === 0) return;
    
    const confirmPay = window.confirm(`Are you sure you want to mark all ${selectedIds.length} selected requests as Paid?`);
    if (!confirmPay) return;

    setLoading(true);
    try {
      for (const id of selectedIds) {
        const req = requests.find(r => r.id === id);
        if (!req) continue;

        await pb.collection('payment_requests').update(id, {
          status: 'Paid',
          payment_date: new Date().toISOString()
        }, { $autoCancel: false });

        if (req.trip_id) {
          await pb.collection('trip_logs').update(req.trip_id, {
            client_payment_status: 'paid'
          }, { $autoCancel: false });
        }
      }

      toast.success(`Successfully marked ${selectedIds.length} requests as Paid`);
      setSelectedIds([]);
      await fetchData();
    } catch (err) {
      console.error('Bulk pay error:', err);
      toast.error('Failed to update some requests');
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const [bulkDueDateInput, setBulkDueDateInput] = useState('');
  const [isUpdatingDueDate, setIsUpdatingDueDate] = useState(false);

  const [isBatchDueDateModalOpen, setIsBatchDueDateModalOpen] = useState(false);
  const [modalSelectedDate, setModalSelectedDate] = useState('');

  const handleBulkUpdateDueDate = async (dueDateVal) => {
    if (!dueDateVal) return;
    const idsToUpdate = selectedIds.length > 0 ? selectedIds : processedData.map(r => r.id);
    if (idsToUpdate.length === 0) {
      return toast.error('No trips available to set Due Date');
    }
    setIsUpdatingDueDate(true);
    try {
      const dueIso = new Date(dueDateVal).toISOString();
      for (const id of idsToUpdate) {
        await pb.collection('payment_requests').update(id, { due_date: dueIso }, { $autoCancel: false });
      }
      toast.success(`Updated Due Date to ${format(new Date(dueDateVal), 'dd MMM yyyy')} for ${idsToUpdate.length} trips`);
      setBulkDueDateInput('');
      await fetchData();
    } catch (err) {
      console.error('Failed to update due dates:', err);
      toast.error('Failed to update due dates');
    } finally {
      setIsUpdatingDueDate(false);
    }
  };

  const handleUpdateSingleDueDate = async (reqId, dueDateVal) => {
    if (!dueDateVal) return;
    try {
      const dueIso = new Date(dueDateVal).toISOString();
      await pb.collection('payment_requests').update(reqId, { due_date: dueIso }, { $autoCancel: false });
      toast.success(`Due date updated to ${format(new Date(dueDateVal), 'dd MMM yyyy')}`);
      await fetchData();
    } catch (err) {
      console.error('Failed to update single due date:', err);
      toast.error('Failed to update due date');
    }
  };

  const processedData = useMemo(() => {
    let filtered = requests.filter(r => {
      const matchStatus = statusFilter === 'all' || r.calculatedStatus === statusFilter;
      const matchClient = clientFilter === 'all' || r.client_id === clientFilter;
      const term = search.toLowerCase();
      const tripIdVal = r.expand?.trip_id?.trip_id || r.trip_id || '';
      const matchSearch = !term || (
        r.expand?.client_id?.client_name?.toLowerCase().includes(term) ||
        tripIdVal.toLowerCase().includes(term)
      );
      return matchStatus && matchClient && matchSearch;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'client_name') {
        aVal = a.expand?.client_id?.client_name || '';
        bVal = b.expand?.client_id?.client_name || '';
      } else if (sortConfig.key === 'status') {
        aVal = a.calculatedStatus;
        bVal = b.calculatedStatus;
      }

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [requests, statusFilter, clientFilter, search, sortConfig]);

  const chartData = useMemo(() => {
    let pendingAmt = 0;
    let paidAmt = 0;
    
    let stats = { Pending: 0, Paid: 0, Overdue: 0, Cancelled: 0 };
    
    const timelineObj = {};

    requests.forEach(r => {
      if (r.calculatedStatus === 'Pending' || r.calculatedStatus === 'Overdue') pendingAmt += r.amount;
      if (r.calculatedStatus === 'Paid') paidAmt += r.amount;
      
      stats[r.calculatedStatus] = (stats[r.calculatedStatus] || 0) + 1;

      const d = r.request_date.split('T')[0];
      if (!timelineObj[d]) timelineObj[d] = 0;
      timelineObj[d]++;
    });

    const statusPie = Object.keys(stats).filter(k => stats[k] > 0).map(k => ({
      name: k, value: stats[k], color: STATUS_COLORS[k]
    }));

    const timeline = Object.keys(timelineObj).sort().map(d => ({
      date: format(parseDateSafe(d) || new Date(), 'dd MMM'),
      count: timelineObj[d]
    }));

    return { pendingAmt, paidAmt, statusPie, timeline };
  }, [requests]);

  const agingData = useMemo(() => {
    let bucket0_15 = { count: 0, amount: 0, items: [] };
    let bucket16_30 = { count: 0, amount: 0, items: [] };
    let bucket31_60 = { count: 0, amount: 0, items: [] };
    let bucket60_plus = { count: 0, amount: 0, items: [] };

    requests.forEach(r => {
      if (r.calculatedStatus === 'Paid' || r.calculatedStatus === 'Cancelled') return;
      const days = r.daysOverdue || 0;
      if (days <= 0 || days <= 15) {
        bucket0_15.count++;
        bucket0_15.amount += r.amount || 0;
        bucket0_15.items.push(r);
      } else if (days <= 30) {
        bucket16_30.count++;
        bucket16_30.amount += r.amount || 0;
        bucket16_30.items.push(r);
      } else if (days <= 60) {
        bucket31_60.count++;
        bucket31_60.amount += r.amount || 0;
        bucket31_60.items.push(r);
      } else {
        bucket60_plus.count++;
        bucket60_plus.amount += r.amount || 0;
        bucket60_plus.items.push(r);
      }
    });

    const totalUnpaid = bucket0_15.amount + bucket16_30.amount + bucket31_60.amount + bucket60_plus.amount;

    return {
      bucket0_15,
      bucket16_30,
      bucket31_60,
      bucket60_plus,
      totalUnpaid
    };
  }, [requests]);

  const clientLedgerData = useMemo(() => {
    const map = {};
    requests.forEach(r => {
      const cId = r.client_id || 'unknown';
      const cName = r.expand?.client_id?.client_name || 'Unknown Client';
      if (!map[cId]) {
        map[cId] = {
          client_id: cId,
          client_name: cName,
          client_obj: r.expand?.client_id || {},
          totalInvoiced: 0,
          totalPaid: 0,
          totalOutstanding: 0,
          overdueCount: 0,
          requests: []
        };
      }
      map[cId].requests.push(r);
      map[cId].totalInvoiced += r.amount || 0;
      if (r.calculatedStatus === 'Paid') {
        map[cId].totalPaid += r.amount || 0;
      } else if (r.calculatedStatus === 'Pending' || r.calculatedStatus === 'Overdue') {
        map[cId].totalOutstanding += r.amount || 0;
        if (r.calculatedStatus === 'Overdue') map[cId].overdueCount++;
      }
    });

    return Object.values(map);
  }, [requests]);

  const prepareExportData = () => {
    return processedData.map(r => {
      const tripDateVal = r.expand?.trip_id?.date || r.request_date;
      return {
        'Trip ID': r.expand?.trip_id?.trip_id || r.trip_id,
        'Client Name': r.expand?.client_id?.client_name || 'Unknown',
        'Amount': r.amount,
        'Trip Date': tripDateVal && parseDateSafe(tripDateVal) ? format(parseDateSafe(tripDateVal), 'yyyy-MM-dd') : '',
        'Due Date': r.due_date && parseDateSafe(r.due_date) ? format(parseDateSafe(r.due_date), 'yyyy-MM-dd') : '',
        'Status': r.calculatedStatus,
        'Days Overdue': r.daysOverdue || 0,
        'Notes': r.notes || ''
      };
    });
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const data = prepareExportData();
      const columns = [
        { header: 'Client Name', key: 'Client Name' },
        { header: 'Trip ID', key: 'Trip ID' },
        { header: 'Amount (₹)', key: 'Amount' },
        { header: 'Request Date', key: 'Request Date' },
        { header: 'Due Date', key: 'Due Date' },
        { header: 'Status', key: 'Status' }
      ];
      
      const totalAmount = data.reduce((sum, row) => sum + Number(row.Amount || 0), 0);
      const totals = {
        'Client Name': 'TOTAL',
        'Trip ID': '',
        'Amount': totalAmount,
        'Request Date': '',
        'Due Date': '',
        'Status': ''
      };

      const blob = generatePDF(data, 'Payment_Requests', {
        title: 'Payment Requests Report',
        columns,
        totals
      });
      
      downloadFile(blob, `Payment_Requests_${format(new Date(), 'yyyyMMdd')}.pdf`);
      toast.success('PDF report downloaded successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to export PDF');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const data = prepareExportData();
      const totalAmount = data.reduce((sum, row) => sum + Number(row.Amount || 0), 0);
      
      data.push({
        'Trip ID': '',
        'Client Name': 'TOTAL',
        'Amount': totalAmount,
        'Request Date': '',
        'Due Date': '',
        'Status': '',
        'Days Overdue': '',
        'Notes': ''
      });

      const blob = generateExcel(data, 'Payment_Requests', 'Requests');
      downloadFile(blob, `Payment_Requests_${format(new Date(), 'yyyyMMdd')}.xlsx`);
      toast.success('Excel report downloaded successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to export Excel');
    } finally {
      setIsExportingExcel(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading payment requests..." />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Failed to load data</h2>
        <Button onClick={fetchData}>Try Again</Button>
      </div>
    );
  }

  if (!loading && requests.length === 0) {
    return (
      <>
        <Helmet><title>Payment Requests - Jai Bhavani Cargo</title></Helmet>
        <div className="min-h-[calc(100dvh-4rem)] p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col items-center justify-center text-center space-y-6 bg-background animate-in fade-in">
          <div className="w-20 h-20 bg-muted/40 rounded-3xl flex items-center justify-center">
            <FileText className="w-10 h-10 text-muted-foreground animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">No Payment Requests Found</h1>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Your payment request ledger is currently empty. Generated requests for unpaid completed trips will appear here automatically.
            </p>
          </div>
          <Button asChild className="rounded-xl px-6 h-11 font-bold shadow-sm">
            <a href="/trip-logs">Create Payment Request</a>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Payment Requests & Collections - Jai Bhavani Cargo</title></Helmet>
      <div className="min-h-[calc(100dvh-4rem)] p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 bg-background animate-in fade-in">
        
        {/* Page Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground" style={{letterSpacing: '-0.02em'}}>Payment Requests & Collections</h1>
            <p className="text-muted-foreground mt-1 text-sm">Track client dues, generate GST invoices, and manage payment collections.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md rounded-xl gap-2 flex-1 md:flex-initial"
            >
              <Plus className="w-4 h-4" /> Create Payment Request
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExportingPDF || isExportingExcel} className="rounded-xl border-border">
                  {isExportingPDF || isExportingExcel ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleExportPDF} disabled={isExportingPDF} className="cursor-pointer">
                  <FileText className="w-4 h-4 mr-2 text-destructive" /> Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel} disabled={isExportingExcel} className="cursor-pointer">
                  <TableIcon className="w-4 h-4 mr-2 text-success" /> Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Executive KPI Cards Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-amber-500 shadow-sm bg-card">
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Dues Outstanding</p>
                  <h3 className="text-2xl font-extrabold mt-1 text-foreground">₹{chartData.pendingAmt.toLocaleString('en-IN')}</h3>
                </div>
                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1 font-medium">
                <span className="text-amber-500 font-bold">{requests.filter(r => r.calculatedStatus === 'Pending' || r.calculatedStatus === 'Overdue').length}</span> invoices pending collection
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 shadow-sm bg-card">
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Revenue Collected</p>
                  <h3 className="text-2xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">₹{chartData.paidAmt.toLocaleString('en-IN')}</h3>
                </div>
                <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1 font-medium">
                <span className="text-emerald-500 font-bold">{(chartData.paidAmt + chartData.pendingAmt) > 0 ? Math.round((chartData.paidAmt / (chartData.paidAmt + chartData.pendingAmt)) * 100) : 0}%</span> overall collection rate
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-rose-500 shadow-sm bg-card">
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overdue Invoices Risk</p>
                  <h3 className="text-2xl font-extrabold mt-1 text-rose-600 dark:text-rose-400">
                    ₹{requests.filter(r => r.calculatedStatus === 'Overdue').reduce((s, r) => s + (r.amount || 0), 0).toLocaleString('en-IN')}
                  </h3>
                </div>
                <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-rose-500 font-bold">
                  {requests.filter(r => r.calculatedStatus === 'Overdue').length} overdue invoices
                </p>
                {requests.filter(r => r.calculatedStatus === 'Overdue').length > 0 && (
                  <button
                    onClick={() => {
                      setStatusFilter('Overdue');
                      setActiveTab('all');
                      toast.info('Filtered to view overdue invoices');
                    }}
                    className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-0.5"
                  >
                    View Overdue &rarr;
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-sm bg-card">
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg Collection DSO</p>
                  <h3 className="text-2xl font-extrabold mt-1 text-blue-600 dark:text-blue-400">14 Days</h3>
                </div>
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1 font-medium">
                ⚡ Excellent receivables collection speed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Workspace View Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-1 w-full max-w-3xl">
            <TabsTrigger value="all" className="rounded-xl font-bold text-xs gap-1.5 py-2.5">
              <FileText className="w-4 h-4 text-blue-500" /> Active Requests
            </TabsTrigger>
            <TabsTrigger value="aging" className="rounded-xl font-bold text-xs gap-1.5 py-2.5">
              <Clock className="w-4 h-4 text-amber-500" /> Aging Workspace
            </TabsTrigger>
            <TabsTrigger value="ledger" className="rounded-xl font-bold text-xs gap-1.5 py-2.5">
              <Users className="w-4 h-4 text-emerald-500" /> Client Ledgers
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl font-bold text-xs gap-1.5 py-2.5">
              <TrendingUp className="w-4 h-4 text-purple-500" /> Analytics
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Active Invoices Table */}
          <TabsContent value="all" className="space-y-6 m-0">

        <Card className="shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row justify-between gap-4 pb-4">
            <CardTitle>All Requests</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search client or trip..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={clientFilter} onValueChange={(val) => {
                setClientFilter(val);
                if (val !== 'all') {
                  const unpaidIds = requests
                    .filter(r => r.client_id === val && (r.calculatedStatus === 'Pending' || r.calculatedStatus === 'Overdue'))
                    .map(r => r.id);
                  if (unpaidIds.length > 0) {
                    setSelectedIds(unpaidIds);
                    const clientObj = clients.find(c => c.id === val);
                    toast.success(`Auto-selected ${unpaidIds.length} unpaid dues for ${clientObj?.client_name || 'Client'}`);
                  }
                }
              }}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Clients" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.client_name}</SelectItem>)}
                </SelectContent>
              </Select>

              <Button 
                variant="default" 
                size="sm" 
                onClick={() => {
                  setModalSelectedDate('');
                  setIsBatchDueDateModalOpen(true);
                }}
                className="h-9 px-3 bg.amber-500 hover:bg-amber-600 bg-amber-600 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4" /> Mark Due Date {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
              </Button>

              {clientFilter !== 'all' && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                  onClick={() => {
                    const unpaidIds = requests
                      .filter(r => r.client_id === clientFilter && (r.calculatedStatus === 'Pending' || r.calculatedStatus === 'Overdue'))
                      .map(r => r.id);
                    if (unpaidIds.length > 0) {
                      setSelectedIds(unpaidIds);
                      const clientObj = clients.find(c => c.id === clientFilter);
                      toast.success(`Selected all ${unpaidIds.length} unpaid dues for ${clientObj?.client_name || 'Client'}`);
                    } else {
                      toast.info('No unpaid dues found for this client');
                    }
                  }}
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> 1-Click Select All Unpaid
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Sticky Bulk Action Banner when trips/requests are selected */}
            {selectedIds.length > 0 && (
              <div className="p-3 px-6 bg-primary/10 border-b border-primary/20 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary text-primary-foreground font-bold text-xs">
                    {selectedIds.length} Selected
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    Total: <span className="text-primary font-bold">{formatCurrency(bulkTotal)}</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Set Bulk Due Date Controls with Auto-Apply */}
                  <div className="flex items-center gap-1.5 bg-background p-1 px-2 rounded-xl border border-border">
                    <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">Set Due Date:</span>
                    <input 
                      type="date"
                      value={bulkDueDateInput}
                      onChange={e => {
                        const val = e.target.value;
                        setBulkDueDateInput(val);
                        if (val) handleBulkUpdateDueDate(val);
                      }}
                      className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
                    />
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="default"
                      disabled={isUpdatingDueDate || !bulkDueDateInput}
                      onClick={() => handleBulkUpdateDueDate(bulkDueDateInput)}
                      className="h-7 text-xs rounded-lg px-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold"
                    >
                      {isUpdatingDueDate ? 'Saving...' : 'Apply Date'}
                    </Button>
                  </div>

                  {isSameClient && (
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline"
                      onClick={handleBulkWhatsApp}
                      className="h-8 text-xs rounded-xl border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-semibold"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" /> WhatsApp Statement
                    </Button>
                  )}

                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    onClick={handleBulkMarkAsPaid}
                    className="h-8 text-xs rounded-xl border-success/30 text-success hover:bg-success/10 font-semibold"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Mark Paid
                  </Button>

                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setSelectedIds([])}
                    className="h-8 text-xs rounded-xl text-muted-foreground hover:bg-muted"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[50px] pl-6">
                      <input 
                        type="checkbox"
                        className="rounded border-muted-foreground/30 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                        checked={processedData.length > 0 && selectedIds.length === processedData.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(processedData.map(r => r.id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Trip Date</TableHead>
                    <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('client_name')}>Client</TableHead>
                    <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('amount')}>Amount</TableHead>
                    <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('due_date')}>Due Date</TableHead>
                    <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('status')}>Status</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        No payment requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    processedData.map(r => {
                      const tripDateVal = r.actualTripDate || r.expand?.trip_id?.date || r.linkedTrip?.date || r.request_date;
                      const formattedTripDate = tripDateVal && parseDateSafe(tripDateVal) ? format(parseDateSafe(tripDateVal), 'dd MMM yyyy') : '';
                      return (
                        <TableRow key={r.id} className="hover:bg-muted/30">
                          <TableCell className="pl-6">
                            <input 
                              type="checkbox"
                              className="rounded border-muted-foreground/30 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                              checked={selectedIds.includes(r.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds(prev => [...prev, r.id]);
                                } else {
                                  setSelectedIds(prev => prev.filter(id => id !== r.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-foreground font-medium">
                            {formattedTripDate}
                          </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{r.expand?.client_id?.client_name || 'Unknown Client'}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">Trip: {r.expand?.trip_id?.trip_id || r.trip_id}</div>
                        </TableCell>
                        <TableCell className="amount-display text-sm font-medium">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-primary">{formatCurrency(r.amount)}</span>
                            {r.expand?.trip_id?.advance_received_from_client > 0 && (
                              <span className="text-[10px] text-emerald-500 font-semibold" title="Client Advance Paid">
                                (Adv: -{formatCurrency(r.expand.trip_id.advance_received_from_client)})
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className={cn("text-sm font-medium", r.calculatedStatus === 'Overdue' && "text-destructive font-bold")}>
                              {r.due_date && parseDateSafe(r.due_date) ? format(parseDateSafe(r.due_date), 'dd MMM yyyy') : 'No Due Date'}
                            </span>
                            <div className="relative group/due inline-flex">
                              <input 
                                type="date" 
                                className="w-6 h-6 p-0 border-0 bg-muted/40 hover:bg-primary/20 cursor-pointer rounded text-transparent font-mono text-xs opacity-60 hover:opacity-100 transition-opacity" 
                                title="Change Due Date"
                                value={r.due_date ? new Date(r.due_date).toISOString().split('T')[0] : ''}
                                onChange={(e) => handleUpdateSingleDueDate(r.id, e.target.value)}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-start gap-1">
                            <Badge variant="outline" className={cn(
                              "border uppercase tracking-wider text-[10px]",
                              r.calculatedStatus === 'Paid' ? "bg-success/10 text-success border-success/20" :
                              r.calculatedStatus === 'Overdue' ? "bg-destructive/10 text-destructive border-destructive/20" :
                              r.calculatedStatus === 'Pending' ? "bg-warning/10 text-warning border-warning/20" :
                              "bg-muted text-muted-foreground border-border"
                            )}>
                              {r.calculatedStatus}
                            </Badge>
                            {r.calculatedStatus === 'Overdue' && (
                              <span className="text-[10px] text-destructive font-medium">{r.daysOverdue} days late</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6 space-x-2">
                          {(r.calculatedStatus === 'Pending' || r.calculatedStatus === 'Overdue') && (
                            <>
                              <Button variant="outline" size="sm" className="h-8" onClick={() => setPaidModalReq(r)}>
                                <CheckCircle className="w-3.5 h-3.5 mr-1 text-success" /> Paid
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 text-primary" onClick={() => handleGenerateInvoicePDF(r)} title="Download PDF Invoice">
                                <FileText className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10" onClick={() => handleShareWhatsApp(r)} title="Share via WhatsApp">
                                <Send className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 text-destructive" onClick={() => setCancelModalReq(r)} title="Cancel Request">
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card List View (Hidden on desktop) */}
            <div className="block md:hidden divide-y divide-border/40">
              {processedData.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground p-6">
                  <FileText className="w-10 h-10 mb-3 opacity-20 mx-auto" />
                  <p>No payment requests found.</p>
                </div>
              ) : (
                processedData.map(r => {
                  const isOverdue = r.calculatedStatus === 'Overdue';
                  const isPendingOrOverdue = r.calculatedStatus === 'Pending' || r.calculatedStatus === 'Overdue';
                  return (
                    <div key={r.id} className="p-4 space-y-3 hover:bg-muted/5 transition-colors">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-start gap-3">
                          {isPendingOrOverdue && (
                            <input 
                              type="checkbox"
                              className="rounded border-muted-foreground/30 text-primary focus:ring-primary w-4 h-4 mt-1 cursor-pointer shrink-0"
                              checked={selectedIds.includes(r.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds(prev => [...prev, r.id]);
                                } else {
                                  setSelectedIds(prev => prev.filter(id => id !== r.id));
                                }
                              }}
                            />
                          )}
                          <div>
                            <p className="font-bold text-sm text-foreground">{r.expand?.client_id?.client_name || 'Unknown Client'}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 font-mono">Trip: {r.expand?.trip_id?.trip_id || r.trip_id}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-extrabold text-sm text-foreground">{formatCurrency(r.amount)}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{r.request_date && parseDateSafe(r.request_date) ? format(parseDateSafe(r.request_date), 'dd MMM yyyy') : ''}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/20 text-xs">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">Due Date</p>
                          <p className={cn("font-semibold mt-0.5", isOverdue && "text-destructive font-extrabold")}>
                            {r.due_date && parseDateSafe(r.due_date) ? format(parseDateSafe(r.due_date), 'dd MMM yyyy') : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">Status</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge variant="outline" className={cn(
                              "border uppercase tracking-wider text-[9px] px-1.5 py-0",
                              r.calculatedStatus === 'Paid' ? "bg-success/10 text-success border-success/20" :
                              r.calculatedStatus === 'Overdue' ? "bg-destructive/10 text-destructive border-destructive/20" :
                              r.calculatedStatus === 'Pending' ? "bg-warning/10 text-warning border-warning/20" :
                              "bg-muted text-muted-foreground border-border"
                            )}>
                              {r.calculatedStatus}
                            </Badge>
                            {isOverdue && (
                              <span className="text-[9px] text-destructive font-bold">({r.daysOverdue}d late)</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {(r.calculatedStatus === 'Pending' || r.calculatedStatus === 'Overdue') && (
                        <div className="flex justify-end items-center gap-2 pt-2 border-t border-border/20">
                          <Button variant="outline" size="sm" className="h-8 text-xs font-semibold rounded-lg border-border" onClick={() => setPaidModalReq(r)}>
                            <CheckCircle className="w-3.5 h-3.5 mr-1 text-success" /> Paid
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-primary font-semibold rounded-lg" onClick={() => handleGenerateInvoicePDF(r)}>
                            <FileText className="w-3.5 h-3.5 mr-1" /> Invoice
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-emerald-600 dark:text-emerald-400 font-semibold rounded-lg" onClick={() => handleShareWhatsApp(r)}>
                            <Send className="w-3.5 h-3.5 mr-1" /> Share
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive font-semibold rounded-lg" onClick={() => setCancelModalReq(r)}>
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab 2: Aging Breakdown Workspace */}
      <TabsContent value="aging" className="space-y-6 m-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-t-4 border-t-emerald-500 bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-500">Current (0 - 15 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-2xl font-extrabold text-foreground">₹{agingData.bucket0_15.amount.toLocaleString('en-IN')}</h3>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{agingData.bucket0_15.count} Invoices</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-amber-500 bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-500">16 - 30 Days Late</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-2xl font-extrabold text-foreground">₹{agingData.bucket16_30.amount.toLocaleString('en-IN')}</h3>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{agingData.bucket16_30.count} Invoices</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-orange-500 bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-orange-500">31 - 60 Days Late</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-2xl font-extrabold text-foreground">₹{agingData.bucket31_60.amount.toLocaleString('en-IN')}</h3>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{agingData.bucket31_60.count} Invoices</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-rose-500 bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-rose-500">60+ Days (High Risk)</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-2xl font-extrabold text-foreground">₹{agingData.bucket60_plus.amount.toLocaleString('en-IN')}</h3>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{agingData.bucket60_plus.count} Invoices</p>
            </CardContent>
          </Card>
        </div>

        {/* Aging Details Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Aging Invoice Breakdown</CardTitle>
            <CardDescription>Overdue invoices categorized by aging schedule</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Trip ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Aging Bucket</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.filter(r => r.calculatedStatus === 'Pending' || r.calculatedStatus === 'Overdue').length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No pending or overdue invoices.</TableCell></TableRow>
                  ) : (
                    requests.filter(r => r.calculatedStatus === 'Pending' || r.calculatedStatus === 'Overdue').map(r => {
                      const days = r.daysOverdue || 0;
                      let bucketLabel = '0-15 Days';
                      let bucketBadgeCls = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
                      if (days > 60) {
                        bucketLabel = '60+ Days (High Risk)';
                        bucketBadgeCls = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
                      } else if (days > 30) {
                        bucketLabel = '31-60 Days';
                        bucketBadgeCls = 'bg-orange-500/10 text-orange-500 border-orange-500/20';
                      } else if (days > 15) {
                        bucketLabel = '16-30 Days';
                        bucketBadgeCls = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
                      }

                      return (
                        <TableRow key={r.id} className="hover:bg-muted/30">
                          <TableCell className="font-bold">{r.expand?.client_id?.client_name || 'Unknown Client'}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{r.expand?.trip_id?.trip_id || r.trip_id || '-'}</TableCell>
                          <TableCell className="font-bold text-sm">₹{Number(r.amount || 0).toLocaleString('en-IN')}</TableCell>
                          <TableCell className="font-bold text-xs">{days > 0 ? `${days} Days Late` : 'On Schedule'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("font-bold text-[10px]", bucketBadgeCls)}>
                              {bucketLabel}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 text-emerald-600 dark:text-emerald-400" onClick={() => handleShareWhatsApp(r)}>
                              <Send className="w-3.5 h-3.5 mr-1" /> WhatsApp
                            </Button>
                            <Button variant="outline" size="sm" className="h-8" onClick={() => setPaidModalReq(r)}>
                              <CheckCircle className="w-3.5 h-3.5 mr-1 text-success" /> Mark Paid
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab 3: Client Ledgers */}
      <TabsContent value="ledger" className="space-y-6 m-0">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl">Client Account Ledgers</CardTitle>
              <CardDescription>Comprehensive invoice and collection summary per client</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Total Invoiced</TableHead>
                    <TableHead>Total Paid</TableHead>
                    <TableHead>Outstanding Dues</TableHead>
                    <TableHead>Overdue Count</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientLedgerData.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No client ledgers found.</TableCell></TableRow>
                  ) : (
                    clientLedgerData.map(c => (
                      <TableRow key={c.client_id} className="hover:bg-muted/30">
                        <TableCell className="font-bold text-sm">
                          {c.client_name}
                          {c.client_obj?.phone && <span className="block text-xs font-normal text-muted-foreground mt-0.5">📞 {c.client_obj.phone}</span>}
                        </TableCell>
                        <TableCell className="font-semibold text-sm">₹{c.totalInvoiced.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">₹{c.totalPaid.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="font-extrabold text-sm text-amber-600 dark:text-amber-400">₹{c.totalOutstanding.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          {c.overdueCount > 0 ? (
                            <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 font-bold">
                              {c.overdueCount} Overdue
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                              Clean Record
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 border-emerald-600/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold"
                            onClick={() => {
                              const clientUnpaid = c.requests.filter(r => r.calculatedStatus === 'Pending' || r.calculatedStatus === 'Overdue');
                              if (clientUnpaid.length > 0) {
                                setSelectedIds(clientUnpaid.map(r => r.id));
                                toast.success(`Selected ${clientUnpaid.length} unpaid trips for ${c.client_name}`);
                                handleBulkWhatsApp();
                              } else {
                                toast.info(`No unpaid dues for ${c.client_name}`);
                              }
                            }}
                          >
                            <Send className="w-3.5 h-3.5 mr-1" /> Share Statement
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab 4: Analytics */}
      <TabsContent value="analytics" className="space-y-6 m-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending vs Paid Value</CardTitle></CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{name: 'Amounts', pending: chartData.pendingAmt, paid: chartData.paidAmt}]} margin={{top:20}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis tickFormatter={v => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} />
                  <Tooltip formatter={v => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="paid" name="Paid" fill="hsl(var(--success))" radius={[4,4,0,0]} />
                  <Bar dataKey="pending" name="Pending" fill="hsl(var(--warning))" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status Distribution</CardTitle></CardHeader>
            <CardContent className="h-[250px]">
              {chartData.statusPie.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData.statusPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                      {chartData.statusPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No requests</div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Requests Over Time</CardTitle></CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.timeline} margin={{top:20, right: 10, left: -20}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{fontSize: 10}} />
                  <YAxis tickCount={4} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{r: 3}} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  </div>

      <MarkPaymentPaidModal 
        isOpen={!!paidModalReq} 
        onClose={() => setPaidModalReq(null)} 
        request={paidModalReq} 
        onSuccess={fetchData} 
      />
      <SendPaymentReminderModal 
        isOpen={!!reminderModalReq} 
        onClose={() => setReminderModalReq(null)} 
        request={reminderModalReq} 
        onSuccess={fetchData} 
      />
      <CancelPaymentRequestModal 
        isOpen={!!cancelModalReq} 
        onClose={() => setCancelModalReq(null)} 
        request={cancelModalReq} 
        onSuccess={fetchData} 
      />
      <CreatePaymentRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchData}
      />

      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-950 text-white dark:bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-50 animate-in slide-in-from-bottom duration-300 w-[92%] max-w-2xl font-heading">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              {selectedIds.length}
            </div>
            <div>
              <p className="font-extrabold text-sm text-white">
                {selectedIds.length} Unpaid Trip{selectedIds.length > 1 ? 's' : ''} Selected {isSameClient && selectedReqs[0]?.expand?.client_id?.client_name ? `(${selectedReqs[0].expand.client_id.client_name})` : ''}
              </p>
              <p className="text-xs text-emerald-400 font-semibold tabular-nums">
                Total Amount: ₹{bulkTotal.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 border-slate-700 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl"
              onClick={handleGenerateBulkInvoicePDF}
              title="Download Itemized Statement PDF with Pickup & Drop Details"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5 text-primary" /> Itemized PDF
            </Button>
            <Button 
              size="sm" 
              className={cn("h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30", !isSameClient && "opacity-50 cursor-not-allowed")}
              onClick={handleBulkWhatsApp}
              disabled={!isSameClient}
              title={isSameClient ? "Send Request on WhatsApp with PDF" : "All selected trips must belong to the same client"}
            >
              <Send className="w-3.5 h-3.5 mr-1.5" /> WhatsApp Request
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold rounded-xl"
              onClick={handleBulkMarkAsPaid}
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Mark Paid
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 text-slate-400 hover:text-white rounded-xl text-xs"
              onClick={() => setSelectedIds([])}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Batch Set Due Date Dialog Modal */}
      <Dialog open={isBatchDueDateModalOpen} onOpenChange={setIsBatchDueDateModalOpen}>
        <DialogContent className="max-w-xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Set Due Date for Multiple Trips ({selectedIds.length > 0 ? selectedIds.length : processedData.length} Selected)
            </DialogTitle>
            <DialogDescription>
              Select multiple trip requests and pick a due date to update them in bulk.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Date Picker & Quick Presets */}
            <div className="space-y-2">
              <Label className="font-semibold text-xs text-muted-foreground uppercase">Target Due Date</Label>
              <Input 
                type="date"
                value={modalSelectedDate}
                onChange={e => setModalSelectedDate(e.target.value)}
                className="font-bold text-sm bg-background"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-xs text-muted-foreground font-semibold self-center mr-1">Presets:</span>
                <Button type="button" variant="outline" size="sm" className="h-7 text-xs rounded-lg" onClick={() => { const d = new Date(); d.setDate(d.getDate() + 7); setModalSelectedDate(d.toISOString().split('T')[0]); }}>+7 Days</Button>
                <Button type="button" variant="outline" size="sm" className="h-7 text-xs rounded-lg" onClick={() => { const d = new Date(); d.setDate(d.getDate() + 10); setModalSelectedDate(d.toISOString().split('T')[0]); }}>+10 Days</Button>
                <Button type="button" variant="outline" size="sm" className="h-7 text-xs rounded-lg" onClick={() => { const d = new Date(); d.setDate(d.getDate() + 15); setModalSelectedDate(d.toISOString().split('T')[0]); }}>+15 Days</Button>
                <Button type="button" variant="outline" size="sm" className="h-7 text-xs rounded-lg" onClick={() => { const d = new Date(); d.setDate(d.getDate() + 30); setModalSelectedDate(d.toISOString().split('T')[0]); }}>+30 Days</Button>
                <Button type="button" variant="outline" size="sm" className="h-7 text-xs rounded-lg" onClick={() => { const d = new Date(); d.setMonth(d.getMonth() + 1, 10); setModalSelectedDate(d.toISOString().split('T')[0]); }}>10th Next Month</Button>
              </div>
            </div>

            {/* Selected Items Quick List */}
            <div className="border border-border/50 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
              <div className="p-2 px-3 bg-muted/40 font-bold text-xs flex justify-between items-center border-b border-border/40">
                <span>Trips ({selectedIds.length > 0 ? selectedIds.length : processedData.length})</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-[11px] font-semibold text-primary p-0 hover:bg-transparent"
                  onClick={() => {
                    if (selectedIds.length === processedData.length) {
                      setSelectedIds([]);
                    } else {
                      setSelectedIds(processedData.map(r => r.id));
                    }
                  }}
                >
                  {selectedIds.length === processedData.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="divide-y divide-border/20">
                {processedData.map(r => {
                  const isChecked = selectedIds.includes(r.id);
                  return (
                    <div 
                      key={r.id}
                      onClick={() => {
                        if (isChecked) {
                          setSelectedIds(prev => prev.filter(id => id !== r.id));
                        } else {
                          setSelectedIds(prev => [...prev, r.id]);
                        }
                      }}
                      className={cn(
                        "p-2.5 px-3 flex items-center justify-between text-xs cursor-pointer transition-colors",
                        isChecked ? "bg-primary/5" : "hover:bg-muted/30"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => {}} 
                          className="rounded text-primary cursor-pointer"
                        />
                        <div>
                          <span className="font-bold">{r.expand?.client_id?.client_name || 'Client'}</span>
                          <span className="text-muted-foreground ml-2 font-mono text-[11px]">Trip: {r.expand?.trip_id?.trip_id || r.trip_id}</span>
                        </div>
                      </div>
                      <span className="font-bold font-mono">{formatCurrency(r.amount)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-row justify-between sm:justify-between items-center gap-2 pt-3 border-t border-border/40">
            <Button variant="ghost" size="sm" onClick={() => setIsBatchDueDateModalOpen(false)}>Cancel</Button>
            <Button 
              variant="default"
              disabled={isUpdatingDueDate || !modalSelectedDate || (selectedIds.length === 0 && processedData.length === 0)}
              onClick={async () => {
                const idsToUpdate = selectedIds.length > 0 ? selectedIds : processedData.map(r => r.id);
                if (!modalSelectedDate) return toast.error('Please pick a Due Date');
                setIsUpdatingDueDate(true);
                try {
                  const dueIso = new Date(modalSelectedDate).toISOString();
                  for (const id of idsToUpdate) {
                    await pb.collection('payment_requests').update(id, { due_date: dueIso }, { $autoCancel: false });
                  }
                  toast.success(`Updated Due Date to ${format(new Date(modalSelectedDate), 'dd MMM yyyy')} for ${idsToUpdate.length} trips`);
                  setIsBatchDueDateModalOpen(false);
                  setModalSelectedDate('');
                  await fetchData();
                } catch (err) {
                  toast.error('Failed to update due dates');
                } finally {
                  setIsUpdatingDueDate(false);
                }
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
            >
              {isUpdatingDueDate ? 'Updating...' : `Apply Due Date to ${selectedIds.length > 0 ? selectedIds.length : processedData.length} Trips`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentRequestsPage;