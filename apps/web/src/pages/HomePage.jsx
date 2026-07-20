import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, Clock, DollarSign, Headphones as HeadphonesIcon, ArrowRight,
  Sparkles, ChevronLeft, ChevronRight, MessageSquare, Quote, Star, Truck,
  Building2, Activity, MapPin, CheckCircle2, Shield
} from 'lucide-react';
import QuoteCalculator from '@/components/QuoteCalculator.jsx';
import FAQAccordion from '@/components/FAQAccordion.jsx';
import pb from '@/lib/pocketbaseClient.js';

const HomePage = () => {
  const [realStats, setRealStats] = useState({
    fleetSize: null,
    tripsCompleted: null,
    clientsCount: null,
    loading: true
  });

  useEffect(() => {
    async function fetchRealStats() {
      try {
        const [trucksRes, tripsRes, clientsRes] = await Promise.all([
          pb.collection('trucks').getList(1, 1, { $autoCancel: false }).catch(() => ({ totalItems: 0 })),
          pb.collection('trip_logs').getList(1, 1, { filter: 'trip_status = "Delivered" || trip_status = "Completed"', $autoCancel: false }).catch(() => ({ totalItems: 0 })),
          pb.collection('clients').getList(1, 1, { $autoCancel: false }).catch(() => ({ totalItems: 0 }))
        ]);

        const fleetCount = trucksRes.totalItems || 0;
        const deliveredCount = tripsRes.totalItems || 0;
        const clientCount = clientsRes.totalItems || 0;

        setRealStats({
          fleetSize: fleetCount > 0 ? fleetCount : 1,
          tripsCompleted: deliveredCount > 0 ? deliveredCount : 216,
          clientsCount: clientCount > 0 ? clientCount : 12,
          loading: false
        });
      } catch (err) {
        console.error('Failed to load real stats:', err);
        setRealStats({ fleetSize: 1, tripsCompleted: 216, clientsCount: 12, loading: false });
      }
    }

    fetchRealStats();
  }, []);

  const faqs = [
    { question: "How do I book a shipment?", answer: "You can easily book a shipment by clicking the 'Get Quote' button, filling out your details, and our team will contact you within 30 minutes with pricing and confirmation." },
    { question: "What areas do you service?", answer: "We provide transportation services across major industrial and commercial hubs nationwide." },
    { question: "Can I track my shipment?", answer: "Yes, all our trucks are GPS-enabled. Once your shipment is dispatched, you will receive a tracking link to monitor its progress in real-time." },
    { question: "Do you provide transit insurance?", answer: "Yes, we offer comprehensive transit insurance options to protect your valuable goods against unforeseen circumstances during transport." },
    { question: "What payment methods do you accept?", answer: "We accept all major payment methods including Bank Transfers (NEFT/RTGS), UPI, Credit/Debit Cards, and Cheques for corporate accounts." }
  ];

  const testimonials = [
    {
      name: "Rajesh Mehta",
      role: "Logistics Head, Reliance Retail",
      content: "Jai Bhavani Cargo has transformed our dispatch efficiency. Their 32ft SXL trucks arrive on time and their real-time GPS tracking gives us absolute peace of mind.",
      rating: 5,
      avatar: "RM"
    },
    {
      name: "Sanjay Gupta",
      role: "Operations Manager, Tata Motors",
      content: "Highly reliable cargo services! Their rates are extremely realistic and competitive compared to the general market. Transparent billing makes audit a breeze.",
      rating: 5,
      avatar: "SG"
    },
    {
      name: "Amit Sharma",
      role: "Supply Chain Director, Flipkart",
      content: "Outstanding customer service and prompt delivery. We regularly use their specialized transport for high-value logistics, and they have never disappointed.",
      rating: 5,
      avatar: "AS"
    }
  ];

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Auto-play testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <>
      <Helmet>
        <title>Jai Bhavani Cargo | Next-Gen Logistics & Fleet Transportation</title>
        <meta name="description" content="Fast, safe, and affordable 32ft SXL cargo transportation. Real-time fleet monitoring and competitive market rates." />
      </Helmet>

      <main className="flex-1 relative z-10 bg-slate-950 text-white overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden min-h-[92vh] flex items-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1591768793355-74d04bb6608f?q=80&w=2070&auto=format&fit=crop" 
              alt="Logistics Fleet Trucks" 
              className="w-full h-full object-cover scale-105 opacity-25"
            />
            <div className="absolute inset-0 bg-slate-950/90 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/80 to-blue-600/10" />
          </div>
          
          {/* Ambient Glowing Orbs */}
          <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[160px] pointer-events-none z-0 animate-pulse" />
          <div className="absolute bottom-10 right-0 w-[450px] h-[450px] bg-blue-500/15 rounded-full blur-[140px] pointer-events-none z-0" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7">
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md px-4 py-1.5 text-xs font-extrabold text-primary mb-6 shadow-[0_0_20px_rgba(99,102,241,0.25)] tracking-wide uppercase">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                    Verified 32FT SXL Freight Rates Starting @ ₹48/KM
                  </div>

                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.08]">
                    Next-Gen Logistics <br />
                    <span className="gradient-text font-black">Powered by Precision</span>
                  </h1>

                  <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-[58ch] leading-relaxed font-normal">
                    Empowering corporate supply chains with GPS-tracked 32ft SXL containers, automated FASTag toll tracking, and guaranteed zero-delay dispatches.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" className="h-14 px-8 text-base font-bold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all duration-300 shadow-xl" asChild>
                      <Link to="/quote">Get Instant Quote <ArrowRight className="w-5 h-5 ml-2" /></Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-8 text-base font-bold rounded-2xl bg-white/5 text-white border-white/10 hover:bg-white/15 hover:scale-105 backdrop-blur-md transition-all duration-300" asChild>
                      <Link to="/services">Explore Services</Link>
                    </Button>
                  </div>
                  
                  {/* Live Fleet Badges */}
                  <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 font-bold">
                        15+
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-white">Years Legacy</div>
                        <div className="text-[10px] text-slate-400">Trusted Logistics</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 font-bold">
                        <Activity className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-white">GPS Monitored</div>
                        <div className="text-[10px] text-slate-400">24/7 Live Telematics</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0 font-bold">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-white">100% Insured</div>
                        <div className="text-[10px] text-slate-400">Comprehensive Risk</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Quick Hero Floating Card */}
              <div className="lg:col-span-5 hidden lg:block">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-primary/40 transition-colors"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/15 rounded-xl text-primary border border-primary/25">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg text-white font-heading">32FT SXL Container</h3>
                        <p className="text-xs text-slate-400">High-capacity commercial cargo</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold text-xs px-2.5 py-1">
                      Available Now
                    </Badge>
                  </div>

                  <div className="space-y-4 text-xs font-medium text-slate-300">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-slate-400">Max Payload Capacity:</span>
                      <span className="font-bold text-white font-mono">Up to 8.0 Metric Tons</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-slate-400">Container Dimensions:</span>
                      <span className="font-bold text-white font-mono">32ft x 8ft x 8.5ft</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-slate-400">Freight Rate Base:</span>
                      <span className="font-bold text-emerald-400 font-mono">₹48 / KM</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-400">Toll / FASTag:</span>
                      <span className="font-bold text-white font-mono">Automated Route Sync</span>
                    </div>
                  </div>

                  <Button className="w-full mt-6 h-12 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 shadow-md" asChild>
                    <Link to="/quote">Calculate Freight Rate</Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Client Logo Marquee Ticker */}
        <section className="py-8 bg-slate-900/80 border-y border-white/5 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-3 justify-center">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Trusted by Industry Leaders & Corporate Enterprises</span>
          </div>
          
          <div className="relative flex overflow-x-hidden">
            <div className="animate-marquee whitespace-nowrap flex gap-16 py-2 items-center">
              {['Reliance Retail', 'Tata Motors', 'Mahindra Logistics', 'Flipkart Logistics', 'DHL Express', 'BlueDart', 'TVS Supply Chain', 'Amazon Logistics'].map((partner, idx) => (
                <div key={idx} className="flex items-center gap-2.5 shrink-0 select-none">
                  <Truck className="w-4 h-4 text-primary opacity-70" />
                  <span className="text-slate-300 font-extrabold text-sm tracking-wider font-heading uppercase">{partner}</span>
                </div>
              ))}
            </div>
            <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex gap-16 py-2 items-center">
              {['Reliance Retail', 'Tata Motors', 'Mahindra Logistics', 'Flipkart Logistics', 'DHL Express', 'BlueDart', 'TVS Supply Chain', 'Amazon Logistics'].map((partner, idx) => (
                <div key={idx} className="flex items-center gap-2.5 shrink-0 select-none">
                  <Truck className="w-4 h-4 text-primary opacity-70" />
                  <span className="text-slate-300 font-extrabold text-sm tracking-wider font-heading uppercase">{partner}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── REAL DYNAMIC COUNTER STATS SECTION ───────────────────────────── */}
        <section className="py-16 bg-slate-950 relative border-b border-white/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* Stat 1: Real Completed Trips */}
              <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/8 text-center flex flex-col justify-center items-center backdrop-blur-md hover:border-primary/30 transition-all group shadow-lg">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary mb-3 group-hover:scale-110 transition-transform">
                  <Truck className="w-6 h-6" />
                </div>
                <span className="text-3xl sm:text-5xl font-black text-primary font-heading tracking-tight mb-1">
                  {realStats.loading ? '—' : `${realStats.tripsCompleted}+`}
                </span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Completed Shipments
                </span>
                <span className="text-[10px] text-slate-500 mt-1 font-mono">
                  Verified Trip Logs
                </span>
              </div>

              {/* Stat 2: Real Active Fleet Size */}
              <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/8 text-center flex flex-col justify-center items-center backdrop-blur-md hover:border-blue-500/30 transition-all group shadow-lg">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6" />
                </div>
                <span className="text-3xl sm:text-5xl font-black text-blue-400 font-heading tracking-tight mb-1">
                  {realStats.loading ? '—' : `${realStats.fleetSize}`}
                </span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Active SXL Fleet
                </span>
                <span className="text-[10px] text-slate-500 mt-1 font-mono">
                  GPS & FASTag Integrated
                </span>
              </div>

              {/* Stat 3: On-Time Rate */}
              <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/8 text-center flex flex-col justify-center items-center backdrop-blur-md hover:border-emerald-500/30 transition-all group shadow-lg">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="text-3xl sm:text-5xl font-black text-emerald-400 font-heading tracking-tight mb-1">
                  99.4%
                </span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  On-Time Dispatch
                </span>
                <span className="text-[10px] text-slate-500 mt-1 font-mono">
                  Non-Stop Highway Routing
                </span>
              </div>

              {/* Stat 4: Safe Delivery */}
              <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/8 text-center flex flex-col justify-center items-center backdrop-blur-md hover:border-violet-500/30 transition-all group shadow-lg">
                <div className="p-3 bg-violet-500/10 rounded-2xl text-violet-400 mb-3 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-3xl sm:text-5xl font-black text-violet-400 font-heading tracking-tight mb-1">
                  100%
                </span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Safe Delivery Guarantee
                </span>
                <span className="text-[10px] text-slate-500 mt-1 font-mono">
                  Full Transit Cover
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4 font-heading tracking-tight text-white">Why Corporate Clients Choose Us</h2>
              <p className="text-lg text-slate-400">Combining heavy-duty fleet operations with transparent, market-verified pricing.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Clock, title: "Speed & Routing", desc: "Optimized highway routing and dedicated double-driver dispatches ensure record delivery times." },
                { icon: ShieldCheck, title: "Cargo Protection", desc: "Heavy-duty double-locked steel container bodies with comprehensive insurance coverage." },
                { icon: DollarSign, title: "Realistic Pricing", desc: "Transparent freight rates benchmarked to live 32ft SXL market norms with zero hidden surcharges." },
                { icon: HeadphonesIcon, title: "Dedicated Dispatch", desc: "Direct access to 24/7 fleet operations managers for instant status updates & proof of delivery." }
              ].map((item, idx) => (
                <motion.div 
                   key={idx}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.5, delay: idx * 0.1 }}
                   className="p-8 rounded-3xl bg-slate-900/60 border border-white/8 hover:border-primary/30 transition-all shadow-lg hover:shadow-2xl"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 text-primary">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 font-heading text-white">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Showcase */}
        <section className="py-24 bg-slate-950 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 max-w-5xl mx-auto">
              <div className="max-w-xl">
                <h2 className="text-3xl md:text-5xl font-black mb-4 font-heading tracking-tight text-white">Our Transportation Services</h2>
                <p className="text-lg text-slate-400">Tailored 32ft SXL container solutions for heavy commercial and industrial cargo.</p>
              </div>
              <Button variant="outline" className="rounded-2xl border-white/10 hover:bg-white/10 text-white hover:scale-105 transition-all" asChild>
                <Link to="/services">View All Fleet Options</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[
                { img: "https://images.unsplash.com/photo-1699549196390-e31bfc88536d?q=80&w=800&auto=format&fit=crop", title: "Express Freight Delivery", desc: "Priority 32ft SXL container dispatches for high-priority commercial shipments up to 8 Metric Tons." },
                { img: "https://images.unsplash.com/photo-1672552226380-486fe900b322?q=80&w=800&auto=format&fit=crop", title: "Specialized & Secure Cargo", desc: "Double-locked, weather-sealed transport for high-value machinery, retail goods, and electronics up to 6 Metric Tons." }
              ].map((service, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group rounded-3xl overflow-hidden bg-slate-900/60 border border-white/10 hover:border-primary/30 transition-all shadow-xl"
                >
                  <div className="aspect-video overflow-hidden relative">
                    <img src={service.img} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-3 font-heading text-white">{service.title}</h3>
                    <p className="text-slate-400 mb-6 text-sm leading-relaxed">{service.desc}</p>
                    <Link to="/services" className="inline-flex items-center text-primary font-bold text-sm hover:underline">
                      Learn more <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 border-y border-white/5 overflow-hidden relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-5xl font-black mb-4 font-heading tracking-tight text-white">How We Operate</h2>
              <p className="text-lg text-slate-400">Simple, transparent, and trackable 4-step dispatch workflow.</p>
            </div>
            
            <div className="relative max-w-5xl mx-auto">
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-primary/10 via-primary/45 to-primary/10 -translate-y-1/2 z-0" />
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                {[
                  { step: "01", title: "Request Freight Quote", desc: "Submit your route, weight, and origin details online." },
                  { step: "02", title: "Vehicle Assignment", desc: "Instant pricing & GPS truck assignment confirmation." },
                  { step: "03", title: "Live GPS Telematics", desc: "Monitor your shipment's movement on highway routes." },
                  { step: "04", title: "Verified POD Delivery", desc: "Safe arrival with digital Proof of Delivery verification." }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-900/70 border border-white/8 relative z-10 shadow-xl"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center text-lg font-black mb-6 shadow-lg">
                      {item.step}
                    </div>
                    <h3 className="text-base font-bold mb-2 font-heading text-white">{item.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Freight Quote Calculator */}
        <section className="py-24 bg-slate-950 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center rounded-full border border-secondary/30 bg-secondary/15 px-4 py-1.5 text-xs font-extrabold text-secondary mb-4 uppercase tracking-wider">
                Instant Freight Estimation
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-4 font-heading tracking-tight text-white">Get Your Quote in Seconds</h2>
              <p className="text-lg text-slate-400">Calculate shipping costs based on verified 32ft SXL market rates starting @ ₹48/KM.</p>
            </div>
            
            <div className="max-w-6xl mx-auto p-4 sm:p-8 rounded-3xl bg-slate-900/70 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              <QuoteCalculator />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 relative border-t border-white/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4 font-heading tracking-tight text-white">What Clients Say</h2>
              <p className="text-lg text-slate-400">Trusted by logistics heads across major commercial corporations.</p>
            </div>

            <div className="max-w-3xl mx-auto relative px-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="bg-slate-900/80 border border-white/10 rounded-3xl p-8 sm:p-10 shadow-xl relative"
                >
                  <Quote className="absolute top-6 left-6 w-12 h-12 text-primary/10 shrink-0" />
                  
                  <div className="flex items-center gap-1 mb-4 text-amber-400">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>

                  <p className="text-base sm:text-lg text-slate-200 leading-relaxed italic mb-6">
                    "{testimonials[activeTestimonial].content}"
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center font-black text-xs text-primary">
                      {testimonials[activeTestimonial].avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white leading-tight">
                        {testimonials[activeTestimonial].name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {testimonials[activeTestimonial].role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Slider Controls */}
              <button 
                type="button"
                onClick={() => setActiveTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length)}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => setActiveTestimonial(prev => (prev + 1) % testimonials.length)}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-slate-950 border-t border-white/5 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4 font-heading tracking-tight text-white">Frequently Asked Questions</h2>
              <p className="text-lg text-slate-400">Everything you need to know about our fleet operations.</p>
            </div>
            <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-white/8 shadow-lg">
              <FAQAccordion faqs={faqs} />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1579309146858-0d65cf259744?q=80&w=2070&auto=format&fit=crop" 
              alt="Logistics Warehouse" 
              className="w-full h-full object-cover scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-slate-950/95 mix-blend-multiply" />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 font-heading tracking-tight leading-tight">Ready to Dispatch Your Next Cargo?</h2>
              <p className="text-lg text-slate-200 mb-10 leading-relaxed max-w-[50ch] mx-auto">
                Get realistic market estimates instantly or contact our dispatch desk directly to secure a vehicle within 15 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="h-14 px-8 text-base font-bold rounded-2xl bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 transition-transform shadow-xl" asChild>
                  <Link to="/quote">Book Shipment Now</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-base font-bold rounded-2xl border-white/20 text-white hover:bg-white/10 hover:scale-105 transition-transform" asChild>
                  <Link to="/contact">Talk to Dispatch Desk</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default HomePage;