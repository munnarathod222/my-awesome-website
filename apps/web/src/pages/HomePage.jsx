import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, Clock, DollarSign, Headphones as HeadphonesIcon, ArrowRight,
  Sparkles, ChevronLeft, ChevronRight, MessageSquare, Quote, Star, Truck
} from 'lucide-react';
import QuoteCalculator from '@/components/QuoteCalculator.jsx';
import FAQAccordion from '@/components/FAQAccordion.jsx';

const HomePage = () => {
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
        <title>Jai Bhavani Cargo | Reliable Logistics Solutions</title>
        <meta name="description" content="Fast, safe, and affordable 32ft SXL cargo transportation. Get a quote today." />
      </Helmet>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-[95vh] flex items-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1591768793355-74d04bb6608f?q=80&w=2070&auto=format&fit=crop" 
              alt="Logistics Trucks" 
              className="w-full h-full object-cover scale-105"
            />
            <div className="absolute inset-0 bg-slate-950/85 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/70 to-primary/10"></div>
          </div>
          
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/15 rounded-full blur-[140px] pointer-events-none z-0 floating-animation" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-primary mb-6 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Realistic 32FT SXL Freight Rates Starting at ₹48/KM
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
                  Fast, Safe, and <span className="gradient-text font-extrabold">Competitive</span> Cargo Transportation
                </h1>
                <p className="text-xl text-slate-300 mb-10 max-w-[60ch] leading-relaxed">
                  Empowering your supply chain with premium 32ft SXL logistics. From express cargo delivery to specialized transport, we ensure safe and cost-effective arrivals.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-300 shadow-lg" asChild>
                    <Link to="/quote">Get a Quote</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-white/5 text-white border-white/10 hover:bg-white/15 hover:scale-105 backdrop-blur-sm transition-all duration-300" asChild>
                    <Link to="/services">Learn More</Link>
                  </Button>
                </div>
                
                <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/35 border border-white/5 flex items-center justify-center">
                      <span className="text-primary font-bold">15+</span>
                    </div>
                    <span className="text-sm font-medium text-white">Years Experience</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/20 flex items-center justify-center">
                      <HeadphonesIcon className="w-5 h-5 text-accent animate-pulse" />
                    </div>
                    <span className="text-sm font-medium text-white">24/7 Dedicated Dispatch</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Client Logo Marquee Ticker */}
        <section className="py-8 bg-slate-900 border-y border-white/5 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-3 justify-center">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-extrabold">Trusted by Industry Leaders</span>
          </div>
          
          <div className="relative flex overflow-x-hidden">
            <div className="animate-marquee whitespace-nowrap flex gap-12 py-2 items-center">
              {['Reliance Retail', 'Tata Motors', 'Mahindra Logistics', 'Flipkart Logistics', 'DHL Express', 'BlueDart'].map((partner, idx) => (
                <div key={idx} className="flex items-center gap-2 shrink-0 select-none">
                  <Truck className="w-4 h-4 text-primary opacity-60" />
                  <span className="text-slate-400 font-bold text-sm tracking-wide font-heading uppercase">{partner}</span>
                </div>
              ))}
            </div>
            <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex gap-12 py-2 items-center">
              {['Reliance Retail', 'Tata Motors', 'Mahindra Logistics', 'Flipkart Logistics', 'DHL Express', 'BlueDart'].map((partner, idx) => (
                <div key={idx} className="flex items-center gap-2 shrink-0 select-none">
                  <Truck className="w-4 h-4 text-primary opacity-60" />
                  <span className="text-slate-400 font-bold text-sm tracking-wide font-heading uppercase">{partner}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Counter Stats Section */}
        <section className="py-16 bg-slate-950 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { count: "12,500+", label: "Shipments Completed" },
                { count: "320+", label: "GPS-Enabled SXL Trucks" },
                { count: "98.9%", label: "On-Time Dispatch Rate" },
                { count: "100%", label: "Safe Delivery Commitment" }
              ].map((stat, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 text-center flex flex-col justify-center items-center">
                  <span className="text-3xl sm:text-4xl font-black text-primary font-heading tracking-tight mb-2">
                    {stat.count}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 font-heading tracking-tight">Why Choose Jai Bhavani Cargo</h2>
              <p className="text-lg text-muted-foreground">We combine industry expertise with modern technology to deliver unmatched logistics services.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Clock, title: "Speed", desc: "Optimized routing and dedicated fleets ensure your cargo reaches its destination in record time." },
                { icon: ShieldCheck, title: "Safety", desc: "Comprehensive insurance and strict safety protocols protect your valuable goods in transit." },
                { icon: DollarSign, title: "Realistic Pricing", desc: "Pricing matched to verified 32ft SXL market rates with clear breakdowns and zero hidden charges." },
                { icon: HeadphonesIcon, title: "Reliability", desc: "Our dedicated dispatch management team is always available to handle and track your shipments." }
              ].map((item, idx) => (
                <motion.div 
                   key={idx}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.5, delay: idx * 0.1 }}
                   className="glassmorphism-interactive p-8 rounded-2xl hover:shadow-[0_8px_30px_rgba(99,102,241,0.12)] border border-white/5"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-sm">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 font-heading text-white">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services (Express & Specialized only) */}
        <section className="py-24 bg-slate-950 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 max-w-4xl mx-auto">
              <div className="max-w-xl">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 font-heading tracking-tight">Our Logistics Services</h2>
                <p className="text-lg text-muted-foreground">Tailored 32ft SXL transport solutions designed to fit your shipping and budget requirements.</p>
              </div>
              <Button variant="outline" className="rounded-full hover:scale-105 transition-all duration-300" asChild>
                <Link to="/services">View All Services</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                { img: "https://images.unsplash.com/photo-1699549196390-e31bfc88536d?q=80&w=800&auto=format&fit=crop", title: "Express Delivery", desc: "Time-critical shipments using standard 32ft SXL containers. Fast priority dispatch with non-stop highway routing (up to 8 MT)." },
                { img: "https://images.unsplash.com/photo-1672552226380-486fe900b322?q=80&w=800&auto=format&fit=crop", title: "Specialized Transport", desc: "Refrigerated, fragile, and specialized commercial cargo transport using highly secure, double-locked SXL vehicles (up to 6 MT)." }
              ].map((service, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group rounded-2xl overflow-hidden glassmorphism-interactive hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] hover:border-primary/25"
                >
                  <div className="aspect-video overflow-hidden relative">
                    <img src={service.img} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                  </div>
                  <div className="p-6 sm:p-8">
                    <h3 className="text-2xl font-bold mb-3 font-heading text-white">{service.title}</h3>
                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed">{service.desc}</p>
                    <Link to="/services" className="inline-flex items-center text-primary font-semibold hover:underline">
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
              <h2 className="text-3xl md:text-5xl font-bold mb-4 font-heading tracking-tight">How It Works</h2>
              <p className="text-lg text-muted-foreground">A simple, transparent process from booking to delivery.</p>
            </div>
            
            <div className="relative max-w-5xl mx-auto">
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-primary/10 via-primary/45 to-primary/10 -translate-y-1/2 z-0"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                {[
                  { step: "01", title: "Request Quote", desc: "Submit your shipment details online." },
                  { step: "02", title: "Get Confirmation", desc: "Receive pricing and vehicle assignment." },
                  { step: "03", title: "Track Shipment", desc: "Monitor progress via GPS tracking." },
                  { step: "04", title: "Safe Delivery", desc: "Goods arrive securely on time." }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="flex flex-col items-center text-center glassmorphism p-6 rounded-2xl border border-white/5 relative z-10 shadow-xl"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-violet-600 text-white flex items-center justify-center text-xl font-bold mb-6 shadow-[0_0_20px_rgba(99,102,241,0.4)] ring-4 ring-slate-950">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-bold mb-2 font-heading text-white">{item.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Quote Calculator Section */}
        <section className="py-24 bg-slate-950 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-slate-900 to-transparent z-0 pointer-events-none"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/8 rounded-full blur-3xl z-0 pointer-events-none"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/8 rounded-full blur-3xl z-0 pointer-events-none"></div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center rounded-full border border-secondary/30 bg-secondary/15 px-4 py-1.5 text-sm font-semibold text-secondary mb-4 animate-pulse">
                Instant Pricing
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 font-heading tracking-tight">Get Your Quote in Seconds</h2>
              <p className="text-lg text-muted-foreground">Calculate shipping cost instantly based on current 32ft SXL market rates starting at ₹48/KM.</p>
            </div>
            
            <div className="max-w-6xl mx-auto p-2 sm:p-8 rounded-3xl glassmorphism border border-white/8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none z-0"></div>
              <div className="relative z-10">
                <QuoteCalculator />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials section */}
        <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 relative border-t border-white/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 font-heading tracking-tight">What Our Clients Say</h2>
              <p className="text-lg text-muted-foreground">Trusted by dispatch managers across major industrial corporations.</p>
            </div>

            <div className="max-w-3xl mx-auto relative px-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="bg-slate-900/60 border border-white/5 rounded-3xl p-8 sm:p-10 shadow-xl relative"
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
                    <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-black text-xs text-primary">
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
                className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => setActiveTestimonial(prev => (prev + 1) % testimonials.length)}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
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
              <h2 className="text-3xl md:text-5xl font-bold mb-4 font-heading tracking-tight">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground">Everything you need to know about our services.</p>
            </div>
            <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl glassmorphism border border-white/5 shadow-lg">
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
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-indigo-900/95 mix-blend-multiply"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-heading tracking-tight leading-tight">Ready to Dispatch Your Next Cargo?</h2>
              <p className="text-lg text-slate-200 mb-10 leading-relaxed max-w-[50ch] mx-auto">
                Get realistic market estimates instantly or contact our dispatch desk directly to secure a vehicle within 15 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 transition-transform shadow-lg" asChild>
                  <Link to="/quote">Book Shipment Now</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-white/20 text-white hover:bg-white/10 hover:scale-105 transition-transform" asChild>
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