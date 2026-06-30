import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Truck, AlertTriangle, Calculator } from 'lucide-react';
import { toast } from 'sonner';

const TRUCK_SPECS = {
  type: '32FT SXL',
  capacity: '6-9 Metric Tons',
  dimensions: '32ft × 8ft × 8.5ft',
  volume: '~61.5 cubic meters'
};

const QuotePage = () => {
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [weight, setWeight] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    if (location.state) {
      const { origin: o, destination: d, weight: w, type: t, dimensions: dim, requirements: req } = location.state;
      if (o) setOrigin(o);
      if (d) setDestination(d);
      if (w) setWeight(w);
      if (t) setServiceType(t);
      
      let additionalInfo = '';
      if (dim && (dim.l || dim.w || dim.h)) {
        additionalInfo += `Dimensions (L x W x H): ${dim.l || '-'} x ${dim.w || '-'} x ${dim.h || '-'} cm\n`;
      }
      if (req) {
        const reqs = Object.keys(req).filter(k => req[k]).join(', ');
        if (reqs) additionalInfo += `Special Requirements: ${reqs}\n`;
      }
      if (additionalInfo) setDetails(additionalInfo);
    }
  }, [location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Quote request submitted successfully! Our team will contact you shortly.");
      e.target.reset();
      setOrigin('');
      setDestination('');
      setServiceType('');
      setWeight('');
      setDetails('');
    }, 1500);
  };

  return (
    <>
      <Helmet>
        <title>Get a Quote | Jai Bhavani Cargo</title>
        <meta name="description" content="Request a competitive quote for your cargo transportation needs." />
      </Helmet>

      <main className="flex-1 pt-24 pb-16 bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Request a Quote</h1>
            <p className="text-lg text-muted-foreground">
              Fill out the details below and we'll provide you with a competitive estimate within 30 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <Card className="bg-card border-border shadow-xl">
                <CardContent className="p-6 sm:p-10">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2">Route Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Pickup City / Pincode *</label>
                          <Input 
                            required 
                            placeholder="e.g. Mumbai, 400001" 
                            value={origin}
                            onChange={e => setOrigin(e.target.value)}
                            className="bg-background text-foreground" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Delivery City / Pincode *</label>
                          <Input 
                            required 
                            placeholder="e.g. Delhi, 110001" 
                            value={destination}
                            onChange={e => setDestination(e.target.value)}
                            className="bg-background text-foreground" 
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2">Shipment Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Service Type *</label>
                          <Select required value={serviceType} onValueChange={setServiceType}>
                            <SelectTrigger className="bg-background text-foreground">
                              <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ftl">Full Truck Load (FTL)</SelectItem>
                              <SelectItem value="ptl">Part Truck Load (PTL)</SelectItem>
                              <SelectItem value="express">Express Delivery</SelectItem>
                              <SelectItem value="specialized">Specialized Transport</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Material Type *</label>
                          <Input required placeholder="e.g. Electronics, Machinery, Textiles" className="bg-background text-foreground" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Approx. Weight (kg) *</label>
                          <Input 
                            type="number" 
                            required 
                            placeholder="e.g. 1500" 
                            value={weight}
                            onChange={e => setWeight(e.target.value)}
                            className="bg-background text-foreground" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Expected Dispatch Date</label>
                          <Input type="date" className="bg-background text-foreground" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Additional Requirements / Dimensions</label>
                        <Textarea 
                          placeholder="Any specific handling instructions or exact dimensions (L x W x H)..." 
                          value={details}
                          onChange={e => setDetails(e.target.value)}
                          className="bg-background text-foreground min-h-[100px]" 
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2">Contact Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Full Name *</label>
                          <Input required placeholder="John Doe" className="bg-background text-foreground" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Company Name</label>
                          <Input placeholder="Acme Corp" className="bg-background text-foreground" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Phone Number *</label>
                          <Input type="tel" required placeholder="+91 98765 43210" className="bg-background text-foreground" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email Address *</label>
                          <Input type="email" required placeholder="john@company.com" className="bg-background text-foreground" />
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Get My Quote'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">Fleet Specification</h3>
                    <p className="text-sm text-slate-400">{TRUCK_SPECS.type}</p>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500">Capacity</span> 
                    <span className="font-medium text-slate-200">{TRUCK_SPECS.capacity}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500">Volume</span> 
                    <span className="font-medium text-slate-200">{TRUCK_SPECS.volume}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-slate-500">Dimensions</span> 
                    <span className="font-medium text-slate-200">{TRUCK_SPECS.dimensions}</span>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Calculator className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="text-lg font-bold">Pricing Guide</h3>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  Our standard rate is <strong>₹60 per KM</strong> across all shipment types. Below are examples for a 500 KM journey:
                </p>

                <div className="space-y-4 text-sm">
                  <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                    <div className="font-semibold mb-1">FTL (Max 9 MT)</div>
                    <div className="text-muted-foreground text-xs mb-1">Base: ₹4,000</div>
                    <div className="font-medium">(500 × ₹60) + ₹4,000 = ₹34,000</div>
                  </div>
                  
                  <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                    <div className="font-semibold mb-1">PTL (Max 5 MT)</div>
                    <div className="text-muted-foreground text-xs mb-1">Base: ₹2,500 | Weight: ₹1.50/KG</div>
                    <div className="font-medium">For 3,000 KG:</div>
                    <div className="font-medium">(500 × ₹60) + (3,000 × ₹1.50) + ₹2,500 = ₹37,000</div>
                  </div>
                </div>
              </div>

              <div className="disclaimer-box">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-lg tracking-tight">Important Notice</h4>
                  </div>
                </div>
                
                <p className="text-sm opacity-90 leading-relaxed mb-3">
                  All quotes provided are approximate estimates based on standard {TRUCK_SPECS.type} truck capacity ({TRUCK_SPECS.capacity}).
                </p>
                
                <ul className="list-disc pl-5 text-sm space-y-1.5 opacity-90 mb-4 marker:text-secondary">
                  <li>Final rates depend on current market conditions and fuel prices.</li>
                  <li>Shipments exceeding {TRUCK_SPECS.capacity} will require custom pricing or multiple vehicles.</li>
                  <li>Tolls, loading/unloading, and special handling may incur additional charges.</li>
                </ul>
                
                <div className="bg-black/5 dark:bg-black/20 p-3 rounded-lg text-sm border border-black/5 dark:border-white/5">
                  <p className="font-semibold mb-1">Need immediate assistance?</p>
                  <div className="flex flex-col opacity-90">
                    <span>📞 7794072244</span>
                    <span>✉️ vinod.jbcargo@gmail.com</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default QuotePage;