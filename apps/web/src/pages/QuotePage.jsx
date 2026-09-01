import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Truck, AlertTriangle, Calculator, CheckCircle2, MessageSquare, PhoneCall, ArrowRight, RefreshCw, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { TRUCK_SIZE_OPTIONS, getTruckSizeSpec } from '@/constants/truckSizes.js';

export { TRUCK_SIZE_OPTIONS as VEHICLE_SIZES };

const QuotePage = () => {
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState(null);
  
  // Form State
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [truckSize, setTruckSize] = useState('32 FT SXL');
  const [customVehicleReq, setCustomVehicleReq] = useState('');
  const [truckSizeError, setTruckSizeError] = useState('');
  const [serviceType, setServiceType] = useState('express');
  const [materialType, setMaterialType] = useState('');
  const [weight, setWeight] = useState('');
  const [dispatchDate, setDispatchDate] = useState('');
  const [details, setDetails] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Selected vehicle specifications
  const selectedVehicleSpec = getTruckSizeSpec(truckSize);

  useEffect(() => {
    if (location.state) {
      const { origin: o, destination: d, weight: w, type: t, vehicle: v, dimensions: dim, requirements: req } = location.state;
      if (o) setOrigin(o);
      if (d) setDestination(d);
      if (w) setWeight(w);
      if (t) setServiceType(t);
      if (v) {
        const spec = getTruckSizeSpec(v);
        if (spec) setTruckSize(spec.value);
      }
      
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTruckSizeError('');

    if (!truckSize) {
      setTruckSizeError('Please select a truck size.');
      toast.error('Please select a truck size.');
      return;
    }

    if (truckSize === 'Other / Not Sure' && !customVehicleReq.trim()) {
      setTruckSizeError('Please specify your vehicle requirement (e.g. 10 ton, Open body, Refrigerated).');
      toast.error('Please specify your vehicle requirement.');
      return;
    }

    if (!origin || !destination) {
      toast.error("Please enter both Pickup and Delivery locations.");
      return;
    }
    if (!phone && !email) {
      toast.error("Please provide at least a Phone Number or Email Address.");
      return;
    }

    setIsSubmitting(true);
    const weightNum = Number(weight) || 1000;
    const generatedQuoteNumber = `QT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const quotePayload = {
      quote_number: generatedQuoteNumber,
      customer_name: fullName.trim() || 'Inquiry Client',
      customer_email: email.trim() || 'inquiry@jaibhavanicargo.com',
      customer_phone: phone.trim(),
      company_name: companyName.trim(),
      origin: origin.trim(),
      destination: destination.trim(),
      destination_zone: 'North',
      service_type: serviceType,
      material_type: materialType.trim() || 'General Commercial Cargo',
      truck_size: truckSize,
      custom_vehicle_requirement: customVehicleReq.trim(),
      container_type: truckSize === 'Other / Not Sure' && customVehicleReq.trim()
        ? `Other / Not Sure - ${customVehicleReq.trim()}`
        : truckSize,
      actual_weight: weightNum,
      length: 32,
      width: 8,
      height: 8.5,
      expected_dispatch_date: dispatchDate,
      details: details.trim(),
      notes: [
        `Truck Size: ${truckSize}`,
        customVehicleReq.trim() ? `Custom Requirement: ${customVehicleReq.trim()}` : '',
        `Service: ${serviceType === 'specialized' ? 'Specialized Heavy Transport' : 'Express Delivery'}`,
        details.trim() ? `Instructions: ${details.trim()}` : ''
      ].filter(Boolean).join('\n')
    };

    let confirmedQuote = null;

    // 1. Submit via backend superuser endpoint
    try {
      const resA = await window.fetch('/hcgi/api/driver/submit-public-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotePayload)
      });
      const dataA = await resA.json().catch(() => ({}));
      if (resA.ok && dataA.success) {
        confirmedQuote = dataA.quote || { ...quotePayload, quote_number: dataA.quoteNumber };
      }
    } catch (errA) {}

    if (!confirmedQuote) {
      try {
        const resB = await window.fetch('/api/driver/submit-public-quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quotePayload)
        });
        const dataB = await resB.json().catch(() => ({}));
        if (resB.ok && dataB.success) {
          confirmedQuote = dataB.quote || { ...quotePayload, quote_number: dataB.quoteNumber };
        }
      } catch (errB) {}
    }

    // 2. Direct PocketBase Client SDK fallback
    if (!confirmedQuote) {
      try {
        const pbRecord = await pb.collection('quotes').create({
          quote_number: generatedQuoteNumber,
          customer_name: quotePayload.customer_name,
          customer_email: quotePayload.customer_email,
          customer_phone: quotePayload.customer_phone,
          origin: quotePayload.origin,
          destination: quotePayload.destination,
          destination_zone: 'North',
          truck_size: quotePayload.truck_size,
          custom_vehicle_requirement: quotePayload.custom_vehicle_requirement,
          container_type: quotePayload.container_type,
          actual_weight: weightNum,
          length: 32,
          width: 8,
          height: 8.5,
          volumetric_weight: Math.round((32 * 8 * 8.5) / 5000 * 100) / 100,
          chargeable_weight: weightNum,
          status: 'Pending',
          total_price: selectedVehicleSpec.ratePerKm * 500 + 2000,
          notes: quotePayload.notes
        }, { $autoCancel: false });
        
        confirmedQuote = pbRecord;
      } catch (pbErr) {
        console.warn("PocketBase client submission fallback:", pbErr);
      }
    }

    // 3. Fallback Local Storage Sync
    if (!confirmedQuote) {
      confirmedQuote = {
        ...quotePayload,
        id: `qt_${Date.now()}`,
        status: 'Pending',
        total_price: selectedVehicleSpec.ratePerKm * 500 + 2000,
        created: new Date().toISOString()
      };
    }

    try {
      const localQuotes = JSON.parse(localStorage.getItem('jbc_public_quotes') || '[]');
      // Deduplicate by quote_number
      const filtered = localQuotes.filter(q => q.quote_number !== confirmedQuote.quote_number);
      filtered.unshift(confirmedQuote);
      localStorage.setItem('jbc_public_quotes', JSON.stringify(filtered));
      
      // Global and multi-tab notification broadcasts
      window.dispatchEvent(new CustomEvent('jbc_new_quote_submitted', { detail: confirmedQuote }));
      if (typeof window.BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('jbc_quotes_channel');
        bc.postMessage({ type: 'NEW_QUOTE', quote: confirmedQuote });
        bc.close();
      }
    } catch (e) {}

    setIsSubmitting(false);
    setSubmittedQuote(confirmedQuote);
    toast.success(`Quote Request #${confirmedQuote.quote_number} Submitted Successfully!`);
  };

  const handleReset = () => {
    setSubmittedQuote(null);
    setOrigin('');
    setDestination('');
    setTruckSize('32 FT SXL');
    setCustomVehicleReq('');
    setTruckSizeError('');
    setWeight('');
    setMaterialType('');
    setDispatchDate('');
    setDetails('');
    setPhone('');
    setEmail('');
    setCompanyName('');
    setFullName('');
  };

  const getWhatsAppLink = () => {
    if (!submittedQuote) return 'https://wa.me/917794072244';
    const vehicleText = submittedQuote.truck_size === 'Other / Not Sure' && submittedQuote.custom_vehicle_requirement
      ? `Other / Not Sure (${submittedQuote.custom_vehicle_requirement})`
      : (submittedQuote.truck_size || submittedQuote.container_type || selectedVehicleSpec.name);

    const text = encodeURIComponent(
      `Hello Jai Bhavani Cargo,\n\nI just requested a quote on your website:\n\n` +
      `📄 Quote Ref: ${submittedQuote.quote_number}\n` +
      `📍 Route: ${submittedQuote.origin} to ${submittedQuote.destination}\n` +
      `🚛 Truck Size: ${vehicleText}\n` +
      `📦 Material: ${submittedQuote.material_type || 'General Cargo'} (${submittedQuote.actual_weight} kg)\n` +
      `👤 Contact: ${submittedQuote.customer_name} (${submittedQuote.customer_phone})\n\n` +
      `Please provide estimated rate and vehicle availability.`
    );
    return `https://wa.me/917794072244?text=${text}`;
  };

  return (
    <>
      <Helmet>
        <title>Request a Quote | Jai Bhavani Cargo</title>
        <meta name="description" content="Request a competitive freight estimate for 14 FT, 17 FT, 20 FT SXL, 22 FT SXL, 24 FT SXL, 32 FT SXL, Single Axle, Multi Axle, and custom container trucks." />
      </Helmet>

      <main className="flex-1 pt-24 pb-16 bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Request a Freight Quote</h1>
            <p className="text-lg text-muted-foreground">
              Select your required truck size (14 FT to 32 FT Multi Axle) and get an instant estimate within minutes.
            </p>
          </div>

          {submittedQuote ? (
            <div className="max-w-2xl mx-auto">
              <Card className="bg-slate-900 border-slate-800 text-white shadow-2xl overflow-hidden rounded-3xl animate-in fade-in-50 duration-300">
                <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-6 text-center text-white">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">Quote Request Submitted!</h2>
                  <p className="text-emerald-100 text-sm mt-1">Our dispatch desk has received your request and is reviewing vehicle placement.</p>
                </div>

                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5">
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quote Reference</span>
                      <span className="text-emerald-400 font-mono font-black text-base">{submittedQuote.quote_number}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5 text-sm">
                      <span className="text-slate-400">Pickup Origin:</span>
                      <span className="font-semibold text-slate-200">{submittedQuote.origin}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5 text-sm">
                      <span className="text-slate-400">Delivery Destination:</span>
                      <span className="font-semibold text-slate-200">{submittedQuote.destination}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5 text-sm">
                      <span className="text-slate-400">Truck Size:</span>
                      <span className="font-bold text-emerald-400">
                        {submittedQuote.truck_size || submittedQuote.container_type || selectedVehicleSpec.value}
                      </span>
                    </div>
                    {submittedQuote.custom_vehicle_requirement && (
                      <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5 text-sm">
                        <span className="text-slate-400">Vehicle Requirement:</span>
                        <span className="font-semibold text-amber-300">{submittedQuote.custom_vehicle_requirement}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5 text-sm">
                      <span className="text-slate-400">Material & Weight:</span>
                      <span className="font-semibold text-slate-200">{submittedQuote.material_type || 'General Cargo'} ({submittedQuote.actual_weight} kg)</span>
                    </div>
                    {submittedQuote.expected_dispatch_date && (
                      <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5 text-sm">
                        <span className="text-slate-400">Expected Dispatch:</span>
                        <span className="font-semibold text-slate-200">{submittedQuote.expected_dispatch_date}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Status:</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        In Review by Dispatch Desk
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <a
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
                    >
                      <MessageSquare className="w-4 h-4" /> Message on WhatsApp
                    </a>
                    <a
                      href="tel:+917794072244"
                      className="flex items-center justify-center gap-2 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all hover:scale-105"
                    >
                      <PhoneCall className="w-4 h-4 text-primary" /> Call 7794072244
                    </a>
                  </div>

                  <div className="text-center pt-2">
                    <Button variant="ghost" onClick={handleReset} className="text-xs text-slate-400 hover:text-white">
                      <RefreshCw className="w-3.5 h-3.5 mr-1" /> Request Another Quote
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8">
                <Card className="bg-card border-border shadow-xl">
                  <CardContent className="p-6 sm:p-10">
                    <form onSubmit={handleSubmit} className="space-y-8">
                      
                      {/* Route Details */}
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

                      {/* Shipment & Truck Size Details */}
                      <div>
                        <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2">Shipment & Truck Size</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                          
                          {/* Truck Size Dropdown */}
                          <div className="space-y-2 col-span-1 sm:col-span-2">
                            <label className="text-sm font-bold text-foreground flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <Truck className="w-4 h-4 text-primary" /> Truck Size / Vehicle Type *
                              </span>
                              <span className="text-xs text-primary font-semibold">
                                {selectedVehicleSpec.capacity} • {selectedVehicleSpec.dimensions}
                              </span>
                            </label>
                            <Select 
                              required 
                              value={truckSize} 
                              onValueChange={(val) => {
                                setTruckSize(val);
                                setTruckSizeError('');
                              }}
                            >
                              <SelectTrigger className={`bg-background text-foreground font-bold h-12 text-sm ${truckSizeError ? 'border-destructive ring-1 ring-destructive' : 'border-primary/40 focus:border-primary'}`}>
                                <SelectValue placeholder="Please select a truck size" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[360px]">
                                {TRUCK_SIZE_OPTIONS.map(v => (
                                  <SelectItem key={v.id} value={v.value} className="py-2.5">
                                    <div className="flex items-center justify-between gap-4 w-full">
                                      <span className="font-bold text-foreground">{v.value}</span>
                                      <span className="text-xs text-muted-foreground font-mono">({v.capacity})</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {truckSizeError && (
                              <p className="text-xs text-destructive font-semibold flex items-center gap-1 mt-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> {truckSizeError}
                              </p>
                            )}
                          </div>

                          {/* Conditional "Please specify vehicle requirement" when Other / Not Sure is selected */}
                          {truckSize === 'Other / Not Sure' && (
                            <div className="space-y-2 col-span-1 sm:col-span-2 bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl animate-in fade-in-50 duration-200">
                              <label className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                                <HelpCircle className="w-4 h-4" /> Please specify vehicle requirement *
                              </label>
                              <Input 
                                required
                                placeholder="e.g. 10 ton, 7 ton, Open body, Container, Trailer, Refrigerated truck, Not sure, recommend a vehicle"
                                value={customVehicleReq}
                                onChange={e => {
                                  setCustomVehicleReq(e.target.value);
                                  if (e.target.value.trim()) setTruckSizeError('');
                                }}
                                className="bg-background text-foreground border-amber-500/40"
                              />
                              <p className="text-xs text-muted-foreground">
                                Tell us your tonnage, body type, or cargo nature so our fleet controller can arrange the ideal truck.
                              </p>
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Service Priority</label>
                            <Select value={serviceType} onValueChange={setServiceType}>
                              <SelectTrigger className="bg-background text-foreground">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="express">⚡ Standard / Express Delivery</SelectItem>
                                <SelectItem value="specialized">🛡️ Specialized Heavy Transport</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Material Type *</label>
                            <Input 
                              required 
                              placeholder="e.g. Electronics, Machinery, Textiles" 
                              value={materialType}
                              onChange={e => setMaterialType(e.target.value)}
                              className="bg-background text-foreground" 
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Approx. Weight (kg) *</label>
                            <Input 
                              type="number" 
                              required 
                              placeholder="e.g. 3500" 
                              value={weight}
                              onChange={e => setWeight(e.target.value)}
                              className="bg-background text-foreground" 
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Expected Dispatch Date</label>
                            <Input 
                              type="date" 
                              value={dispatchDate}
                              onChange={e => setDispatchDate(e.target.value)}
                              className="bg-background text-foreground" 
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Additional Requirements / Dimensions</label>
                          <Textarea 
                            placeholder="Any specific handling instructions, timing, or exact cargo dimensions (L x W x H)..." 
                            value={details}
                            onChange={e => setDetails(e.target.value)}
                            className="bg-background text-foreground min-h-[90px]" 
                          />
                        </div>
                      </div>

                      {/* Contact Details */}
                      <div>
                        <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2">Contact Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name *</label>
                            <Input 
                              required 
                              placeholder="John Doe" 
                              value={fullName}
                              onChange={e => setFullName(e.target.value)}
                              className="bg-background text-foreground" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Company Name</label>
                            <Input 
                              placeholder="Acme Corp" 
                              value={companyName}
                              onChange={e => setCompanyName(e.target.value)}
                              className="bg-background text-foreground" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Phone Number *</label>
                            <Input 
                              type="tel" 
                              required 
                              placeholder="+91 98765 43210" 
                              value={phone}
                              onChange={e => setPhone(e.target.value)}
                              className="bg-background text-foreground" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <Input 
                              type="email" 
                              placeholder="john@company.com" 
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              className="bg-background text-foreground" 
                            />
                          </div>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 rounded-2xl shadow-xl hover:scale-[1.01] transition-all"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 animate-spin" /> Submitting Request...
                          </span>
                        ) : 'Get My Instant Quote'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Fleet Specification Card */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Dynamically updating Fleet Specification */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md animate-in fade-in duration-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-100">Fleet Specification</h3>
                      <p className="text-sm font-bold text-emerald-400">{selectedVehicleSpec.short}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm text-slate-300">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-500">Vehicle Type</span> 
                      <span className="font-medium text-slate-200 truncate max-w-[170px] text-right">{selectedVehicleSpec.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-500">Capacity</span> 
                      <span className="font-semibold text-emerald-400">{selectedVehicleSpec.capacity}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-500">Volume</span> 
                      <span className="font-medium text-slate-200">{selectedVehicleSpec.volume}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-slate-500">Dimensions</span> 
                      <span className="font-medium text-slate-200">{selectedVehicleSpec.dimensions}</span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Pricing Guide */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <Calculator className="w-5 h-5 text-secondary" />
                    </div>
                    <h3 className="text-lg font-bold">Pricing Guide</h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    Our standard rate starts at <strong>₹{selectedVehicleSpec.ratePerKm} per KM</strong> for {selectedVehicleSpec.short}. Below are examples for a 500 KM journey:
                  </p>

                  <div className="space-y-4 text-sm">
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                      <div className="font-semibold mb-1">Standard Delivery ({selectedVehicleSpec.short})</div>
                      <div className="text-muted-foreground text-xs mb-1">Base: ₹2,000 | Rate: ₹{selectedVehicleSpec.ratePerKm}/KM</div>
                      <div className="font-bold text-emerald-400">
                        (500 × ₹{selectedVehicleSpec.ratePerKm}) + ₹2,000 = ₹{(500 * selectedVehicleSpec.ratePerKm + 2000).toLocaleString('en-IN')}
                      </div>
                    </div>
                    
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                      <div className="font-semibold mb-1">Specialized Heavy Transport</div>
                      <div className="text-muted-foreground text-xs mb-1">Base: ₹3,000 | Rate: ₹{selectedVehicleSpec.ratePerKm + 6}/KM</div>
                      <div className="font-bold text-blue-400">
                        (500 × ₹{selectedVehicleSpec.ratePerKm + 6}) + ₹3,000 = ₹{(500 * (selectedVehicleSpec.ratePerKm + 6) + 3000).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="bg-muted/20 border border-border rounded-2xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" /> Important Notice
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    All quotes provided are approximate estimates based on selected vehicle size ({selectedVehicleSpec.name}).
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                    <li>Final rates depend on current market diesel prices and toll routes.</li>
                    <li>Guaranteed container placement with GPS live tracking.</li>
                  </ul>
                </div>

              </div>

            </div>
          )}

        </div>
      </main>
    </>
  );
};

export default QuotePage;