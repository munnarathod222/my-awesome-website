import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { FileText, Upload, CheckCircle2, AlertCircle, RefreshCw, Eye, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export default function PODManagementPage() {
  const [trips, setTrips] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingId, setUploadingId] = useState(null);

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
            <div className="overflow-x-auto">
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
                    const hasPOD = trip.pod_status === 'Uploaded' || trip.pod_file;
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
                            {hasPOD && trip.pod_file && (
                              <Button asChild size="sm" variant="ghost" className="rounded-xl">
                                <a href={pb.files.getUrl(trip, trip.pod_file)} target="_blank" rel="noopener noreferrer">
                                  <Eye className="w-4 h-4 mr-1.5" /> View POD
                                </a>
                              </Button>
                            )}
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
                                variant={hasPOD ? 'outline' : 'default'} 
                                className="rounded-xl cursor-pointer"
                              >
                                <label htmlFor={`file-upload-${trip.id}`}>
                                  <Upload className="w-4 h-4 mr-1.5" /> 
                                  {uploadingId === trip.id ? 'Uploading...' : hasPOD ? 'Re-upload' : 'Upload POD'}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
