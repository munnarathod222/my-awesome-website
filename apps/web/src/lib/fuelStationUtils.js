import pb from './pocketbaseClient.js';

const LOCAL_STORAGE_KEY = 'jbc_fuel_stations';

// Default initial fuel stations
const DEFAULT_STATIONS = [
  {
    id: 'fs_bpcl_ghatkesar',
    station_name: 'BPCL Ghatkesar Bunk',
    station_code: 'BP-GHAT',
    brand: 'BPCL',
    contact_person: 'Sheik Abdul Mannan',
    phone_number: '917794072244',
    location: 'Ghatkesar NH-65, Hyderabad',
    google_maps_url: 'https://maps.google.com/?q=BPCL+Ghatkesar',
    credit_balance: 0,
    total_paid: 0,
    status: 'Active'
  },
  {
    id: 'fs_iocl_aushapur',
    station_name: 'IOCL Aushapur Petrol Pump',
    station_code: 'IOC-AUSH',
    brand: 'IOCL',
    contact_person: 'Ganga Narender',
    phone_number: '9849012345',
    location: 'Aushapur, Ghatkesar Mandal',
    google_maps_url: 'https://maps.google.com/?q=IOCL+Aushapur',
    credit_balance: 0,
    total_paid: 0,
    status: 'Active'
  }
];

export async function fetchFuelStations() {
  try {
    const records = await pb.collection('fuel_stations').getFullList({
      sort: 'station_name',
      $autoCancel: false
    });
    if (records && records.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
      return records;
    }
  } catch (err) {
    console.log('[fuelStationUtils] PocketBase fetch fallback:', err?.message);
  }

  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.error('Failed to parse cached fuel stations', e);
    }
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_STATIONS));
  return DEFAULT_STATIONS;
}

export async function saveFuelStation(stationData) {
  let savedRecord = null;
  const isEdit = !!stationData.id;

  try {
    if (isEdit) {
      savedRecord = await pb.collection('fuel_stations').update(stationData.id, stationData, { $autoCancel: false });
    } else {
      savedRecord = await pb.collection('fuel_stations').create(stationData, { $autoCancel: false });
    }
  } catch (err) {
    console.log('[fuelStationUtils] PocketBase save fallback:', err?.message);
    const stations = await fetchFuelStations();
    if (isEdit) {
      const idx = stations.findIndex(s => s.id === stationData.id);
      if (idx !== -1) {
        stations[idx] = { ...stations[idx], ...stationData };
        savedRecord = stations[idx];
      }
    } else {
      savedRecord = {
        ...stationData,
        id: `fs_${Date.now()}`,
        credit_balance: Number(stationData.credit_balance || 0),
        total_paid: 0,
        status: stationData.status || 'Active',
        created: new Date().toISOString()
      };
      stations.push(savedRecord);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stations));
  }
  return savedRecord;
}

export async function addFuelStationCredit(stationIdOrName, amount) {
  const numAmount = Number(amount || 0);
  if (!numAmount) return;

  const stations = await fetchFuelStations();
  const station = stations.find(s => s.id === stationIdOrName || s.station_name === stationIdOrName);
  if (station) {
    const newBalance = Number(station.credit_balance || 0) + numAmount;
    await saveFuelStation({ ...station, credit_balance: newBalance });
  }
}

export async function payFuelStationCredit(stationIdOrName, amountPaid) {
  const numPaid = Number(amountPaid || 0);
  if (!numPaid) return;

  const stations = await fetchFuelStations();
  const station = stations.find(s => s.id === stationIdOrName || s.station_name === stationIdOrName);
  if (station) {
    const currentBal = Number(station.credit_balance || 0);
    const newBal = Math.max(0, currentBal - numPaid);
    const newTotalPaid = Number(station.total_paid || 0) + numPaid;
    await saveFuelStation({ ...station, credit_balance: newBal, total_paid: newTotalPaid });
  }
}

export async function deleteFuelStation(stationId) {
  try {
    await pb.collection('fuel_stations').delete(stationId, { $autoCancel: false });
  } catch (err) {
    console.log('[fuelStationUtils] PocketBase delete fallback:', err?.message);
  }
  const stations = await fetchFuelStations();
  const filtered = stations.filter(s => s.id !== stationId);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  return true;
}
