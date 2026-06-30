import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Truck, Package, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';

const ServicesPage = () => {
  const services = [
    {
      id: "ftl",
      icon: Truck,
      title: "Full Truck Load (FTL)",
      description: "Our FTL service provides dedicated vehicles for your large shipments. This ensures direct point-to-point delivery without intermediate handling, maximizing security and minimizing transit times.",
      benefits: ["Dedicated vehicle for your cargo", "Direct routing with no transshipment", "Faster transit times", "Ideal for high-volume shipments"],
      image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: "ptl",
      icon: Package,
      title: "Part Truck Load (PTL)",
      description: "A cost-effective solution for shipments that don't require a full truck. You pay only for the space your cargo occupies while still enjoying our reliable delivery schedules and tracking capabilities.",
      benefits: ["Cost-effective for smaller loads", "Pay only for space used", "Regular scheduled departures", "Consolidated routing efficiency"],
      image: "https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: "express",
      icon: Zap,
      title: "Express Delivery",
      description: "When time is critical, our express service delivers. Utilizing dual-driver operations and priority routing, we ensure your urgent shipments reach their destination in the shortest possible time.",
      benefits: ["Guaranteed delivery timelines", "Dual-driver non-stop transit", "Priority loading and unloading", "24/7 dedicated monitoring"],
      image: "https://images.unsplash.com/photo-1566843972142-a7fcb70de55a?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: "specialized",
      icon: ShieldCheck,
      title: "Specialized Transport",
      description: "Custom handling for fragile, oversized, or high-value goods. We provide specialized vehicles with air suspension, temperature control, and enhanced security measures for sensitive cargo.",
      benefits: ["Air-suspension vehicles available", "Enhanced security protocols", "Trained handling personnel", "Customized securing equipment"],
      image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1000&auto=format&fit=crop"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Our Services | Jai Bhavani Cargo</title>
        <meta name="description" content="Explore our comprehensive logistics services including FTL, PTL, Express Delivery, and Specialized Transport." />
      </Helmet>

      <main className="flex-1 pt-24 pb-16">
        {/* Header */}
        <div className="bg-muted/30 py-16 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
            <p className="text-lg text-muted-foreground">
              Comprehensive transportation solutions tailored to meet the unique demands of your supply chain, delivered with reliability and precision.
            </p>
          </div>
        </div>

        {/* Services List */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
          {services.map((service, index) => (
            <div key={service.id} className={`flex flex-col lg:flex-row gap-12 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="w-full lg:w-1/2">
                <div className="rounded-2xl overflow-hidden shadow-xl border border-border aspect-video lg:aspect-[4/3]">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="w-full lg:w-1/2 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <service.icon className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">{service.title}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-3 pt-4">
                  {service.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-secondary shrink-0" />
                      <span className="text-foreground font-medium">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-6">
                  <Button size="lg" asChild>
                    <Link to="/quote">Request Quote for {service.title.split('(')[0].trim()}</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-card border border-border rounded-3xl p-8 md:p-16 text-center shadow-lg">
            <h2 className="text-3xl font-bold mb-4">Not sure which service you need?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Our logistics experts are ready to analyze your requirements and recommend the most efficient and cost-effective solution.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/contact">Talk to an Expert</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
};

export default ServicesPage;