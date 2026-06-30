import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Clock, DollarSign, Headphones as HeadphonesIcon, ArrowRight } from 'lucide-react';
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

  return (
    <>
      <Helmet>
        <title>Jai Bhavani Cargo | Reliable Logistics Solutions</title>
        <meta name="description" content="Fast, safe, and affordable cargo transportation. Get a quote today." />
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
                <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md px-4 py-1.5 text-sm font-semibold text-primary mb-6 animate-pulse">
                  Transparent Pricing Starting at ₹60/KM
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
                  Fast, Safe, and <span className="gradient-text font-extrabold">Affordable</span> Cargo Transportation
                </h1>
                <p className="text-xl text-slate-300 mb-10 max-w-[60ch] leading-relaxed">
                  Empowering your business with seamless transportation. From full truckloads to express delivery, we ensure your goods arrive on time, every time.
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
                      <span className="text-primary font-bold">10+</span>
                    </div>
                    <span className="text-sm font-medium text-white">Years Experience</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/20 flex items-center justify-center">
                      <HeadphonesIcon className="w-5 h-5 text-accent animate-pulse" />
                    </div>
                    <span className="text-sm font-medium text-white">24/7 Support</span>
                  </div>
                </div>
              </motion.div>
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
                { icon: DollarSign, title: "Affordability", desc: "Transparent, upfront pricing at a flat ₹60/KM rate with no hidden fees. Get the best value for your logistics budget." },
                { icon: HeadphonesIcon, title: "Reliability", desc: "Our dedicated customer service team is always available to assist you with tracking and queries." }
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

        {/* Services */}
        <section className="py-24 bg-slate-950 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 font-heading tracking-tight">Comprehensive Logistics Services</h2>
                <p className="text-lg text-muted-foreground">Tailored transportation solutions designed to meet the unique demands of your supply chain.</p>
              </div>
              <Button variant="outline" className="rounded-full hover:scale-105 transition-all duration-300" asChild>
                <Link to="/services">View All Services</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { img: "https://images.unsplash.com/photo-1600333078107-d6844b754f41?q=80&w=800&auto=format&fit=crop", title: "Full Truck Load (FTL)", desc: "Dedicated vehicles for your large shipments up to 9 MT. Direct point-to-point delivery ensuring maximum security." },
                { img: "https://images.unsplash.com/photo-1565891741441-64926e441838?q=80&w=800&auto=format&fit=crop", title: "Partial Truck Load (PTL)", desc: "Cost-effective shared truck space for shipments up to 5 MT. Pay only for the space and weight you use." },
                { img: "https://images.unsplash.com/photo-1699549196390-e31bfc88536d?q=80&w=800&auto=format&fit=crop", title: "Express Delivery", desc: "Time-critical shipments up to 8 MT delivered with priority routing and non-stop transit." },
                { img: "https://images.unsplash.com/photo-1672552226380-486fe900b322?q=80&w=800&auto=format&fit=crop", title: "Specialized Transport", desc: "Secure transport for fragile, hazardous, or temperature-controlled cargo up to 6 MT." }
              ].map((service, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group rounded-2xl overflow-hidden glassmorphism-interactive hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] hover:border-primary/25"
                >
                  <div className="aspect-video sm:aspect-[2/1] overflow-hidden relative">
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
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-slate-900 to-transparent z-0 pointer-events-none"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/8 rounded-full blur-3xl z-0 pointer-events-none"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/8 rounded-full blur-3xl z-0 pointer-events-none"></div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center rounded-full border border-secondary/30 bg-secondary/15 px-4 py-1.5 text-sm font-semibold text-secondary mb-4 animate-pulse">
                Instant Pricing
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 font-heading tracking-tight">Get Your Quote in Seconds</h2>
              <p className="text-lg text-muted-foreground">Calculate shipping cost instantly based on our flat ₹60/KM rate and your exact requirements.</p>
            </div>
            
            <div className="max-w-6xl mx-auto p-2 sm:p-8 rounded-3xl glassmorphism border border-white/8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none z-0"></div>
              <div className="relative z-10">
                <QuoteCalculator />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-white/5 relative">
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
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 font-heading tracking-tight">Ready to Transform Your Logistics?</h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Contact us today to get a competitive quote and experience logistics that actually works for your business.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl bg-white text-primary hover:bg-white/95 hover:scale-105 transition-all duration-300 font-bold" asChild>
                <Link to="/quote">Get Quote Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-transparent text-white border-white/30 hover:bg-white/10 hover:scale-105 transition-all duration-300" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default HomePage;