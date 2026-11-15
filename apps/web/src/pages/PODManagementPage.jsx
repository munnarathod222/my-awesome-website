
export function getCourierTrackingUrl(partner, awb) {
  if (!awb) return null;
  const clean = String(awb).trim();
  const p = (partner || '').toUpperCase();
  if (p.includes('DTDC')) return 'https://www.dtdc.in/tracking.asp?awb=' + encodeURIComponent(clean);
  if (p.includes('TRACKON')) return 'https://trackon.in/tracking?awb=' + encodeURIComponent(clean);
  if (p.includes('BLUEDART') || p.includes('BLUE DART')) return 'https://www.bluedart.com/tracking?numbers=' + encodeURIComponent(clean);
  if (p.includes('DELHIVERY')) return 'https://www.delhivery.com/track/package/' + encodeURIComponent(clean);
  if (p.includes('SPEED POST') || p.includes('INDIA POST') || p.includes('POST')) return 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx';
  if (p.includes('PROFESSIONAL')) return 'https://www.tpcindia.com/track.aspx?awb=' + encodeURIComponent(clean);
  return null;
}

export function getPodCourierInfo(trip, isRequired = true) {
  const awb = trip.pod_courier_awb ? String(trip.pod_courier_awb).trim() : "";
  const partner = trip.pod_courier_partner || "DTDC";
  const courierDate = trip.pod_courier_date || "";
  const isDeliveredToClient = trip.pod_hardcopy_status === "Delivered to Client";
  
  if (isDeliveredToClient) {
    return {
      status: "delivered",
      badgeText: "✓ Delivered to Client",
      badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      partner, awb, courierDate, isRequired
    };
  }
  
  if (awb) {
    return {
      status: "in_transit",
      badgeText: "🚚 " + partner + ": " + awb,
      badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/30 font-mono",
      partner, awb, courierDate,
      trackingUrl: getCourierTrackingUrl(partner, awb),
      isRequired
    };
  }

  // If client does not require POD, courier delivery is not needed
  if (!isRequired) {
    return {
      status: "not_required",
      badgeText: "⚪ POD Not Required",
      badgeClass: "bg-slate-800/60 text-slate-400 border-slate-700/60 text-[10px]",
      partner: "", awb: "", courierDate: "",
      isRequired: false
    };
  }
  
  const dateRef = trip.delivered_at || trip.date;
  let days = 0;
  if (dateRef) {
    const ms = Date.now() - new Date(dateRef).getTime();
    days = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  }
  
  if (days >= 5) {
    return {
      status: "overdue",
      badgeText: "🚨 " + days + "d OVERDUE COURIER",
      badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse font-bold",
      days,
      isRequired: true
    };
  } else if (days >= 3) {
    return {
      status: "warning",
      badgeText: "⚠️ " + days + "d Uncouriered",
      badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold",
      days,
      isRequired: true
    };
  } else {
    return {
      status: "pending",
      badgeText: "⏱️ " + days + "d Pending Courier",
      badgeClass: "bg-slate-800 text-slate-300 border-slate-700 font-medium",
      days,
      isRequired: true
    };
  }
}

const getActualPodFile = (trip) => {
  if (!trip || !trip.pod_file) return null;
  if (Array.isArray(trip.pod_file)) {
    const valid = trip.pod_file.filter(f => typeof f === "string" && f.trim() !== "" && f !== "[]" && f !== "[" && f !== "]" && f !== "null");
    return valid.length > 0 ? valid[0] : null;
  }
  if (typeof trip.pod_file === "string") {
    const trimmed = trip.pod_file.trim();
    if (!trimmed || trimmed === "[]" || trimmed === "[" || trimmed === "]" || trimmed === "null" || trimmed === "undefined") {
      return null;
    }
    return trimmed;
  }
  return null;
};
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { FileText, Upload, CheckCircle2, AlertCircle, RefreshCw, Eye, Search, Link2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import MultiPodViewerModal from '@/components/MultiPodViewerModal.jsx';
import { getPodFiles, compressDocumentBatch, formatBytes } from '@/lib/imageCompressor.js';

export default function PODManagementPage() {
  const [trips, setTrips] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingId, setUploadingId] = useState(null);
  const [viewingPodTrip, setViewingPodTrip] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);

  const fetchPODTrips = async () => {
    setLoading(true);
    try {
      // 1. Fetch clients requiring POD
      const clientsRes = await pb.collection('clients').getFullList({
        filter: 'requires_pod = true',
        $autoCancel: false
      });
      const clientMap = {};
      clientsRes.forEach(c => {
        clientMap[c.id] = c.company_name || c.name || 'Unknown Client';
      });
      setClients(clientMap);

      const clientFilterStr = clientsRes.map(c => `client_id = "${c.id}"`).join(' || ');

      if (clientsRes.length === 0) {
        setTrips([]);
        setLoading(false);
        return;
      }

      // 2. Fetch trips belonging to those clients
      const tripsRes = await pb.collection('trip_logs').getFullList({
        filter: `(${clientFilterStr})`,
        sort: '-date',
        $autoCancel: false
      });

      setTrips(tripsRes);
    } catch (err) {
      console.error('Error fetching POD trips:', err);
      toast.error('Failed to load POD-required shipments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPODTrips();
  }, []);

  const handleFileUpload = async (e, tripId) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingId(tripId);
    const formData = new FormData();
    formData.append('pod_file', file);
    formData.append('pod_status', 'Uploaded');

    try {
      // Direct call or backend REST endpoint
      await pb.collection('trip_logs').update(tripId, formData);
      toast.success('POD document uploaded and synced successfully.');
      fetchPODTrips();
    } catch (err) {
      console.error('Error uploading POD file:', err);
      toast.error('Failed to upload POD. Please try again.');
    } finally {
      setUploadingId(null);
    }
  };

  const handleLinkUpload = async (tripId, link) => {
    setUploadingId(tripId);
    try {
      const currentTrip = trips.find(t => t.id === tripId);
      const data = {
        pod_link: link,
        pod_status: (link || currentTrip?.pod_file) ? (currentTrip?.pod_status === 'Verified' ? 'Verified' : 'Uploaded') : 'Pending'
      };
      await pb.collection('trip_logs').update(tripId, data);
      toast.success(link ? 'POD link saved successfully.' : 'POD link cleared.');
      fetchPODTrips();
    } catch (err) {
      console.error('Error saving POD link:', err);
      toast.error('Failed to save POD link. Please try again.');
    } finally {
      setUploadingId(null);
    }
  };

  const filteredTrips = trips.filter(trip => {
    const clientName = clients[trip.client_id]?.toLowerCase() || '';
    const tripNum = trip.trip_id?.toLowerCase() || trip.id?.toLowerCase() || '';
    const route = `${trip.origin || ''} ${trip.destination || ''}`.toLowerCase();
    const query = searchQuery.toLowerCase();

    return clientName.includes(query) || tripNum.includes(query) || route.includes(query);
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-3 duration-300">
      <Helmet>
        <title>POD Management | Operations</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            Proof of Delivery (POD)
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Track and upload POD documents for clients requiring delivery verification.
          </p>
        </div>
        <Button onClick={fetchPODTrips} variant="outline" className="rounded-xl">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-border/50">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by client, trip ID, or route..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-background border-border rounded-xl"
          />
        </div>
      </div>

      <Card className="border border-border/50 rounded-3xl overflow-hidden shadow-soft">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <span>Loading POD records...</span>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No POD Shipments Found</h3>
              <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                All shipments for active POD clients are up to date, or search criteria matched no records.
              </p>
            </div>
          ) : (
            <>
            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/10 hover:bg-muted/10 border-b border-border/50">
                    <TableHead className="py-4">Trip / Reference</TableHead>
                    <TableHead className="py-4">Client</TableHead>
                    <TableHead className="py-4">Route</TableHead>
                    <TableHead className="py-4">Date</TableHead>
                    <TableHead className="py-4">POD Status</TableHead>
                    <TableHead className="py-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrips.map(trip => {
                    const actualFile = getActualPodFile(trip); const hasPOD = (trip.pod_status === 'Uploaded' && (actualFile || trip.pod_link)) || !!actualFile || !!trip.pod_link;
                    return (
                      <TableRow key={trip.id} className="border-b border-border/40 hover:bg-muted/5 transition-colors">
                        <TableCell className="font-semibold py-4 text-foreground">
                          {trip.trip_id || trip.id.substring(0, 8)}
                        </TableCell>
                        <TableCell className="text-muted-foreground py-4">
                          {clients[trip.client_id] || 'Unknown Client'}
                        </TableCell>
                        <TableCell className="py-4 font-medium text-foreground">
                          {trip.origin} ➔ {trip.destination}
                        </TableCell>
                        <TableCell className="text-muted-foreground py-4">
                          {trip.date ? new Date(trip.date).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge variant="outline" className={`rounded-xl px-3 py-1 flex items-center w-fit gap-1.5 ${hasPOD ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                            {hasPOD ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Uploaded
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3.5 h-3.5" />
                                Pending Upload
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {getActualPodFile(trip) && (
                              <Button asChild size="sm" variant="ghost" className="rounded-xl">
                                <a href={pb.files.getUrl(trip, getActualPodFile(trip) || trip.pod_file)} target="_blank" rel="noopener noreferrer">
                                  <Eye className="w-4 h-4 mr-1.5" /> View POD File
                                </a>
                              </Button>
                            )}
                            {trip.pod_link && (
                              <Button asChild size="sm" variant="ghost" className="rounded-xl">
                                <a href={trip.pod_link} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 mr-1.5" /> View Link
                                </a>
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="rounded-xl gap-1.5"
                              onClick={() => {
                                const link = window.prompt("Enter POD Link (e.g. Google Drive/Dropbox URL):", trip.pod_link || "");
                                if (link !== null) {
                                  handleLinkUpload(trip.id, link.trim());
                                }
                              }}
                              disabled={uploadingId === trip.id}
                            >
                              <Link2 className="w-4 h-4" />
                              {trip.pod_link ? "Edit Link" : "Upload Link"}
                            </Button>
                            <div className="relative">
                              <input 
                                type="file" 
                                id={`file-upload-${trip.id}`} 
                                className="hidden" 
                                accept=".pdf,image/*" 
                                onChange={(e) => handleFileUpload(e, trip.id)}
                                disabled={uploadingId === trip.id}
                              />
                              <Button 
                                asChild 
                                size="sm" 
                                variant={getActualPodFile(trip) ? 'outline' : 'default'} 
                                className="rounded-xl cursor-pointer"
                              >
                                <label htmlFor={`file-upload-${trip.id}`}>
                                  <Upload className="w-4 h-4 mr-1.5" /> 
                                  {uploadingId === trip.id ? 'Uploading...' : getActualPodFile(trip) ? 'Re-upload File' : 'Upload File'}
                                </label>
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card List View (Hidden on desktop) */}
            <div className="block md:hidden divide-y divide-border/40">              {filteredTrips.map(trip => {
                  const actualFile = getActualPodFile(trip); const hasPOD = (trip.pod_status === 'Uploaded' && (actualFile || trip.pod_link)) || !!actualFile || !!trip.pod_link;
                  return (
                    <div key={trip.id} className="p-4 space-y-3 hover:bg-muted/5 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm text-foreground">{trip.trip_id || trip.id.substring(0, 8)}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{clients[trip.client_id] || 'Unknown Client'}</p>
                        </div>
                        <Badge variant="outline" className={`rounded-xl px-2.5 py-0.5 flex items-center w-fit gap-1 text-[10px] ${hasPOD ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                          {hasPOD ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Uploaded
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5" />
                              Pending
                            </>
                          )}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/20 text-xs">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">Route</p>
                          <p className="font-semibold text-foreground mt-0.5 truncate">{trip.origin} ➔ {trip.destination}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">Date</p>
                          <p className="font-semibold text-foreground mt-0.5">
                            {trip.date ? new Date(trip.date).toLocaleDateString() : '-'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/20 flex-wrap">
                        {getActualPodFile(trip) && (
                          <Button asChild size="sm" variant="ghost" className="h-8 text-xs font-semibold rounded-lg">
                            <a href={pb.files.getUrl(trip, getActualPodFile(trip) || trip.pod_file)} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-3.5 h-3.5 mr-1" /> File
                            </a>
                          </Button>
                        )}
                        {trip.pod_link && (
                          <Button asChild size="sm" variant="ghost" className="h-8 text-xs font-semibold rounded-lg">
                            <a href={trip.pod_link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3.5 h-3.5 mr-1" /> Link
                            </a>
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-xs font-semibold rounded-lg gap-1"
                          onClick={() => {
                            const link = window.prompt("Enter POD Link (e.g. Google Drive/Dropbox URL):", trip.pod_link || "");
                            if (link !== null) {
                              handleLinkUpload(trip.id, link.trim());
                            }
                          }}
                          disabled={uploadingId === trip.id}
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          {trip.pod_link ? "Edit Link" : "Link"}
                        </Button>
                        <div className="relative">
                          <input 
                            type="file" 
                            id={`file-upload-mobile-${trip.id}`} 
                            className="hidden" 
                            accept=".pdf,image/*" 
                            onChange={(e) => handleFileUpload(e, trip.id)}
                            disabled={uploadingId === trip.id}
                          />
                          <Button 
                            asChild 
                            size="sm" 
                            variant={getActualPodFile(trip) ? 'outline' : 'default'} 
                            className="h-8 text-xs font-semibold rounded-lg cursor-pointer"
                          >
                            <label htmlFor={`file-upload-mobile-${trip.id}`}>
                              <Upload className="w-3.5 h-3.5 mr-1" /> 
                              {uploadingId === trip.id ? 'Uploading...' : getActualPodFile(trip) ? 'Re-upload' : 'Upload'}
                            </label>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
