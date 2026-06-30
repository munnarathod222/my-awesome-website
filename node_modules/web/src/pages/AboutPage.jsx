import React from 'react';
import { Helmet } from 'react-helmet';
import { Target, Heart, Award, Users } from 'lucide-react';

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About Us | Jai Bhavani Cargo</title>
        <meta name="description" content="Learn about Jai Bhavani Cargo's history, mission, and commitment to excellence in logistics." />
      </Helmet>

      <main className="flex-1 pt-24 pb-16">
        {/* Header */}
        <div className="bg-muted/30 py-16 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Jai Bhavani Cargo</h1>
            <p className="text-lg text-muted-foreground">
              Driving India's supply chain forward with integrity, innovation, and unwavering reliability since 2014.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Founded in 2014, Jai Bhavani Cargo began with a single truck and a simple vision: to provide transparent, reliable transportation services in an industry often plagued by unpredictability.
                </p>
                <p>
                  Over the past decade, we have grown into a comprehensive logistics provider with a modern fleet and a network spanning over 50 cities across India. Our growth has been fueled entirely by customer trust and word-of-mouth referrals.
                </p>
                <p>
                  Today, we leverage cutting-edge technology alongside our deep industry experience to offer seamless FTL, PTL, and express delivery services to businesses of all sizes.
                </p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl border border-border">
              <img 
                src="https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=1000&auto=format&fit=crop" 
                alt="Warehouse Operations" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="bg-card border-y border-border py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
              <p className="text-lg text-muted-foreground">The principles that guide every mile we drive and every decision we make.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-background p-8 rounded-2xl border border-border text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Reliability</h3>
                <p className="text-muted-foreground">We do what we say we'll do. On-time delivery is our baseline, not an exception.</p>
              </div>
              <div className="bg-background p-8 rounded-2xl border border-border text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Customer First</h3>
                <p className="text-muted-foreground">Your cargo is our priority. We build lasting partnerships based on mutual success.</p>
              </div>
              <div className="bg-background p-8 rounded-2xl border border-border text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-6">
                  <Award className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">Excellence</h3>
                <p className="text-muted-foreground">We continuously improve our fleet, technology, and processes to serve you better.</p>
              </div>
              <div className="bg-background p-8 rounded-2xl border border-border text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Teamwork</h3>
                <p className="text-muted-foreground">From drivers to dispatchers, our team works as one unit to deliver results.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AboutPage;