import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { 
  Building2, Phone, Mail, MapPin, FileText, CreditCard, 
  TrendingUp, Truck, MessageSquare, Inbox,
  Sparkles, ExternalLink, Calendar, CheckCircle2, User, Star, ArrowRight, Zap, Download
} from 'lucide-react';

export default function TransportCrmCustomerDetailModal({ isOpen, onClose, customer, onQuickBook }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!customer) return null;

  const riskColor = customer.risk_level === 'Excellent' 
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
    : customer.risk_level === 'Average' 
    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
    : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

  const riskTrafficLight = customer.risk_level === 'Excellent' ? '🟢 Excellent Credit' : customer.risk_level === 'Average' ? '🟡 Average Credit' : '🔴 High Risk Account';

  // Use ONLY REAL database data arrays without fake manufactured rows
  const rateHistory = Array.isArray(customer.rate_history) ? customer.rate_history : [];
  const preferredVehicles = Array.isArray(customer.preferred_vehicles) ? customer.preferred_vehicles : [];
  const shipmentHistory = Array.isArray(customer.shipment_history) ? customer.shipment_history : [];
  const contactsList = Array.isArray(customer.contacts) ? customer.contacts : [];
  const favouriteRoutes = Array.isArray(customer.favourite_routes) ? customer.favourite_routes : [];
  const documentsList = Array.isArray(customer.documents) ? customer.documents : [];
  const timelineList = Array.isArray(customer.timeline) ? customer.timeline : [];
  const aiInsightsList = Array.isArray(customer.ai_insights) ? customer.ai_insights : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[96vw] h-[92vh] flex flex-col bg-card border-border shadow-2xl rounded-3xl p-4 sm:p-6 font-sans">
        
        {/* Header Title & Quick Badges */}
        <DialogHeader className="pb-3 border-b border-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl text-primary font-black text-xl">
              {customer.company_name?.slice(0, 2).toUpperCase() || 'CU'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-extrabold text-foreground">{customer.company_name}</DialogTitle>
                <Badge variant="outline" className="font-mono text-xs font-bold bg-muted/30">
                  {customer.customer_code}
                </Badge>
                <Badge variant="outline" className={`font-mono font-bold text-xs ${riskColor}`}>
                  {riskTrafficLight}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <span>{customer.industry || 'Logistics Partner'}</span> • <span>Assigned Manager: <strong>{customer.primary_contact || 'Operations Desk'}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => onQuickBook && onQuickBook(customer)} className="rounded-xl shadow-md font-bold text-xs bg-primary text-primary-foreground">
              <Zap className="w-3.5 h-3.5 mr-1" /> 1-Click Trip Booking
            </Button>
          </div>
        </DialogHeader>

        {/* 11 Interactive Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 pt-2">
          <TabsList className="bg-muted/40 p-1 rounded-2xl flex overflow-x-auto justify-start border border-border/50 text-xs flex-shrink-0">
            <TabsTrigger value="overview" className="rounded-xl px-3 py-1.5 font-bold">Overview</TabsTrigger>
            <TabsTrigger value="rates" className="rounded-xl px-3 py-1.5 font-bold">Rate History ({rateHistory.length})</TabsTrigger>
            <TabsTrigger value="vehicles" className="rounded-xl px-3 py-1.5 font-bold">Preferred Vehicles ({preferredVehicles.length})</TabsTrigger>
            <TabsTrigger value="shipments" className="rounded-xl px-3 py-1.5 font-bold">Shipments ({shipmentHistory.length})</TabsTrigger>
            <TabsTrigger value="payment" className="rounded-xl px-3 py-1.5 font-bold">Payment Risk</TabsTrigger>
            <TabsTrigger value="contacts" className="rounded-xl px-3 py-1.5 font-bold">Contacts ({contactsList.length})</TabsTrigger>
            <TabsTrigger value="routes" className="rounded-xl px-3 py-1.5 font-bold">Fav Routes ({favouriteRoutes.length})</TabsTrigger>
            <TabsTrigger value="documents" className="rounded-xl px-3 py-1.5 font-bold">Documents ({documentsList.length})</TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-xl px-3 py-1.5 font-bold">Timeline ({timelineList.length})</TabsTrigger>
            <TabsTrigger value="ai_insights" className="rounded-xl px-3 py-1.5 font-bold text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> AI Insights
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl px-3 py-1.5 font-bold">Analytics</TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="rounded-2xl border-border/60 bg-card p-4 space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-primary" /> Company Identity
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div><span className="text-muted-foreground">GSTIN:</span> <strong className="font-mono text-foreground">{customer.gstin || 'Not Entered'}</strong></div>
                  <div><span className="text-muted-foreground">PAN:</span> <strong className="font-mono text-foreground">{customer.pan || 'Not Entered'}</strong></div>
                  <div><span className="text-muted-foreground">Primary Contact:</span> <strong className="text-foreground">{customer.primary_contact || 'N/A'}</strong></div>
                  <div><span className="text-muted-foreground">Mobile:</span> {customer.phone ? <a href={`tel:${customer.phone}`} className="text-primary font-mono font-bold hover:underline">{customer.phone}</a> : <strong className="text-foreground">N/A</strong>}</div>
                  <div><span className="text-muted-foreground">Email:</span> {customer.email ? <a href={`mailto:${customer.email}`} className="text-primary font-bold hover:underline">{customer.email}</a> : <strong className="text-foreground">N/A</strong>}</div>
                </div>
              </Card>

              <Card className="rounded-2xl border-border/60 bg-card p-4 space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" /> Location & Address
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div><span className="text-muted-foreground">City:</span> <strong className="text-foreground">{customer.city || 'N/A'}</strong></div>
                  <div><span className="text-muted-foreground">Billing Address:</span> <p className="text-foreground font-medium mt-0.5">{customer.billing_address || customer.city || 'Address Not Specified'}</p></div>
                </div>
              </Card>

              <Card className="rounded-2xl border-border/60 bg-card p-4 space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-400" /> Commercial Metrics
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lifetime Revenue:</span>
                    <strong className="font-mono text-emerald-400">₹ {(customer.total_revenue || 0).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Recorded Trips:</span>
                    <strong className="font-mono text-foreground">{customer.total_shipments || 0} Trips</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credit Limit:</span>
                    <strong className="font-mono text-foreground">₹ {(customer.credit_limit || 0).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Outstanding Balance:</span>
                    <strong className="font-mono text-rose-400">₹ {(customer.outstanding_amount || 0).toLocaleString()}</strong>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: RATE HISTORY */}
          <TabsContent value="rates" className="flex-1 overflow-y-auto pt-4 space-y-3 pr-1">
            {rateHistory.length === 0 ? (
              <div className="p-8 text-center bg-muted/20 border border-border/60 rounded-2xl space-y-2">
                <Inbox className="w-8 h-8 text-muted-foreground mx-auto" />
                <h4 className="text-sm font-bold text-foreground">No Rate History Recorded</h4>
                <p className="text-xs text-muted-foreground">No negotiated rate contract records have been uploaded for this customer yet.</p>
              </div>
            ) : (
              <div className="border border-border/60 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-xs font-bold">Date</TableHead>
                      <TableHead className="text-xs font-bold">Route</TableHead>
                      <TableHead className="text-xs font-bold">Vehicle Type</TableHead>
                      <TableHead className="text-xs font-bold text-right">Base Freight</TableHead>
                      <TableHead className="text-xs font-bold text-right">Final Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rateHistory.map((rate, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/20 text-xs font-mono">
                        <TableCell className="font-semibold">{rate.date}</TableCell>
                        <TableCell className="font-sans font-bold text-foreground">{rate.route}</TableCell>
                        <TableCell className="font-sans text-muted-foreground">{rate.truck_type}</TableCell>
                        <TableCell className="text-right">₹ {rate.freight?.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-extrabold text-emerald-400 font-mono">₹ {rate.final_amount?.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* TAB 3: PREFERRED VEHICLES */}
          <TabsContent value="vehicles" className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1">
            {preferredVehicles.length === 0 ? (
              <div className="p-8 text-center bg-muted/20 border border-border/60 rounded-2xl space-y-2">
                <Truck className="w-8 h-8 text-muted-foreground mx-auto" />
                <h4 className="text-sm font-bold text-foreground">No Preferred Vehicle Allocation</h4>
                <p className="text-xs text-muted-foreground">Vehicle preferences will be dynamically generated after initial trip bookings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {preferredVehicles.map((v, i) => (
                  <Card key={i} className="p-4 rounded-2xl border border-border/60 bg-card space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-foreground">{v.type}</span>
                      <Badge variant="outline" className="font-mono text-xs font-bold text-primary border-primary/30">
                        {v.pct}%
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${v.pct}%` }} />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 4: SHIPMENT HISTORY */}
          <TabsContent value="shipments" className="flex-1 overflow-y-auto pt-4 space-y-3 pr-1">
            {shipmentHistory.length === 0 ? (
              <div className="p-8 text-center bg-muted/20 border border-border/60 rounded-2xl space-y-2">
                <Inbox className="w-8 h-8 text-muted-foreground mx-auto" />
                <h4 className="text-sm font-bold text-foreground">No Trip Logged Yet</h4>
                <p className="text-xs text-muted-foreground">No shipment trip logs recorded for {customer.company_name}. Click "1-Click Trip Booking" to create a load.</p>
              </div>
            ) : (
              <div className="border border-border/60 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-xs font-bold">LR Number</TableHead>
                      <TableHead className="text-xs font-bold">Date</TableHead>
                      <TableHead className="text-xs font-bold">Route</TableHead>
                      <TableHead className="text-xs font-bold">Status</TableHead>
                      <TableHead className="text-xs font-bold text-right">Freight Invoice</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipmentHistory.map((s, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/20 text-xs">
                        <TableCell className="font-mono font-bold text-primary">{s.lr_number}</TableCell>
                        <TableCell className="font-mono text-muted-foreground">{s.booking_date}</TableCell>
                        <TableCell className="font-bold text-foreground">{s.route}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={s.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}>
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-foreground">₹ {s.invoice_amount?.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* TAB 5: PAYMENT RISK & CREDIT SCORE */}
          <TabsContent value="payment" className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <Card className="p-4 rounded-2xl border border-primary/30 bg-primary/5 text-center space-y-1">
                <div className="text-xs text-muted-foreground font-bold">Transport Credit Score</div>
                <div className="text-2xl font-black font-mono text-primary">{customer.credit_score || 750}</div>
                <Badge variant="outline" className={`font-mono text-[10px] font-bold ${customer.score_color || 'bg-emerald-500/10 text-emerald-400'}`}>
                  Tier {customer.credit_tier || 'AAA'}
                </Badge>
              </Card>
              <Card className="p-4 rounded-2xl border border-border/60 bg-card text-center space-y-1">
                <div className="text-xs text-muted-foreground">Credit Limit</div>
                <div className="text-lg font-black font-mono text-foreground">₹ {(customer.credit_limit || 0).toLocaleString()}</div>
              </Card>
              <Card className="p-4 rounded-2xl border border-border/60 bg-card text-center space-y-1">
                <div className="text-xs text-muted-foreground">Outstanding Amount</div>
                <div className="text-lg font-black font-mono text-rose-400">₹ {(customer.outstanding_amount || 0).toLocaleString()}</div>
              </Card>
              <Card className="p-4 rounded-2xl border border-border/60 bg-card text-center space-y-1">
                <div className="text-xs text-muted-foreground">Avg Payment Days</div>
                <div className="text-lg font-black font-mono text-amber-400">{customer.avg_payment_days || 15} Days</div>
                <div className="text-[10px] text-muted-foreground">Calculated Turnaround</div>
              </Card>
              <Card className="p-4 rounded-2xl border border-border/60 bg-card text-center space-y-1">
                <div className="text-xs text-muted-foreground">Credit Risk Level</div>
                <Badge variant="outline" className={`font-mono text-xs font-bold mt-1 ${riskColor}`}>
                  {riskTrafficLight}
                </Badge>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 6: CONTACT PERSONS */}
          <TabsContent value="contacts" className="flex-1 overflow-y-auto pt-4 space-y-3 pr-1">
            {contactsList.length === 0 && !customer.primary_contact ? (
              <div className="p-8 text-center bg-muted/20 border border-border/60 rounded-2xl space-y-2">
                <User className="w-8 h-8 text-muted-foreground mx-auto" />
                <h4 className="text-sm font-bold text-foreground">No Additional Contacts Recorded</h4>
                <p className="text-xs text-muted-foreground">Primary Contact: {customer.primary_contact || 'N/A'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 rounded-2xl border border-border/60 bg-card space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-sm text-foreground">{customer.primary_contact || 'Primary Contact'}</h4>
                      <p className="text-xs text-muted-foreground">Logistics Manager • {customer.company_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                    {customer.phone && (
                      <a href={`tel:${customer.phone}`} className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> Call ({customer.phone})
                      </a>
                    )}
                    {customer.email && (
                      <a href={`mailto:${customer.email}`} className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> Email
                      </a>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* TAB 7: FAVOURITE ROUTES */}
          <TabsContent value="routes" className="flex-1 overflow-y-auto pt-4 space-y-3 pr-1">
            {favouriteRoutes.length === 0 ? (
              <div className="p-8 text-center bg-muted/20 border border-border/60 rounded-2xl space-y-2">
                <MapPin className="w-8 h-8 text-muted-foreground mx-auto" />
                <h4 className="text-sm font-bold text-foreground">No Saved Transport Corridors</h4>
                <p className="text-xs text-muted-foreground">Favourite routes will be saved automatically as trips are dispatched.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {favouriteRoutes.map((r, i) => (
                  <Card key={i} className="p-4 rounded-2xl border border-border/60 bg-card space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="font-extrabold text-sm text-foreground flex items-center gap-2">
                        {r.from} <ArrowRight className="w-4 h-4 text-primary" /> {r.to}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 8: DOCUMENTS */}
          <TabsContent value="documents" className="flex-1 overflow-y-auto pt-4 space-y-3 pr-1">
            {documentsList.length === 0 ? (
              <div className="p-8 text-center bg-muted/20 border border-border/60 rounded-2xl space-y-2">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
                <h4 className="text-sm font-bold text-foreground">No Customer Documents Uploaded</h4>
                <p className="text-xs text-muted-foreground">Upload GST certificates, rate agreements, and mandate letters to store in vault.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {documentsList.map((d, i) => (
                  <Card key={i} className="p-4 rounded-2xl border border-border/60 bg-card space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <FileText className="w-4 h-4 text-primary" /> {d.name}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 9: TIMELINE */}
          <TabsContent value="timeline" className="flex-1 overflow-y-auto pt-4 space-y-3 pr-1">
            {timelineList.length === 0 ? (
              <div className="p-8 text-center bg-muted/20 border border-border/60 rounded-2xl space-y-2">
                <Calendar className="w-8 h-8 text-muted-foreground mx-auto" />
                <h4 className="text-sm font-bold text-foreground">No Account Activity Events</h4>
                <p className="text-xs text-muted-foreground">Account timeline updates will log automatically upon rate changes and bookings.</p>
              </div>
            ) : (
              <div className="space-y-3 relative pl-4 border-l-2 border-primary/30 ml-2">
                {timelineList.map((item) => (
                  <div key={item.id} className="relative space-y-1">
                    <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-card" />
                    <div className="text-xs font-extrabold text-foreground flex items-center gap-2">
                      <span>{item.title}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{item.date}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.details}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 10: AI INSIGHTS */}
          <TabsContent value="ai_insights" className="flex-1 overflow-y-auto pt-4 space-y-3 pr-1">
            <Card className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
              <h3 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" /> AI Supply Chain Analysis
              </h3>
              {aiInsightsList.length === 0 ? (
                <div className="p-4 bg-card rounded-xl border border-border/60 text-xs text-muted-foreground">
                  AI insights will be generated automatically once trip bookings are logged for {customer.company_name}.
                </div>
              ) : (
                <div className="space-y-2">
                  {aiInsightsList.map((ins, i) => (
                    <div key={i} className="p-3 bg-card rounded-xl border border-border/60 text-xs font-medium text-foreground">
                      {ins}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* TAB 11: ANALYTICS */}
          <TabsContent value="analytics" className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <Card className="p-4 rounded-2xl border border-border/60 bg-card text-center">
                <div className="text-muted-foreground">Account Status</div>
                <div className="text-xl font-black text-emerald-400 mt-1">{customer.status || 'Active'}</div>
              </Card>
              <Card className="p-4 rounded-2xl border border-border/60 bg-card text-center">
                <div className="text-muted-foreground">Credit Utilization</div>
                <div className="text-xl font-black text-primary mt-1">{customer.credit_utilization_pct || 0}%</div>
              </Card>
              <Card className="p-4 rounded-2xl border border-border/60 bg-card text-center">
                <div className="text-muted-foreground">Total Shipments</div>
                <div className="text-xl font-black text-amber-400 mt-1">{customer.total_shipments || 0}</div>
              </Card>
              <Card className="p-4 rounded-2xl border border-border/60 bg-card text-center">
                <div className="text-muted-foreground">Total Revenue</div>
                <div className="text-xl font-black text-emerald-400 mt-1">₹ {(customer.total_revenue || 0).toLocaleString()}</div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-3 border-t border-border/40 shrink-0">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs">
            Close Customer 360° Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
