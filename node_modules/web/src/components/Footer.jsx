import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/50 pt-16 pb-8">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-5">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform duration-300">
                <Truck className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-2xl font-bold text-foreground">FleetMaster</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed text-sm max-w-[280px]">
              Reliable Logistics Solutions. Fast, safe, and affordable cargo transportation management across the country.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"><Linkedin className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"><Instagram className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-foreground mb-6">Platform</h4>
            <ul className="space-y-3.5 text-sm">
              <li><Link to="/features" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-primary/50 opacity-0 transition-opacity"></span> Features</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-primary/50 opacity-0 transition-opacity"></span> About Us</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-primary/50 opacity-0 transition-opacity"></span> Contact Support</Link></li>
              <li><Link to="/login" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-primary/50 opacity-0 transition-opacity"></span> Partner Login</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-foreground mb-6">Solutions</h4>
            <ul className="space-y-3.5 text-sm">
              <li><Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">Fleet Tracking</Link></li>
              <li><Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">Expense Management</Link></li>
              <li><Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">Route Optimization</Link></li>
              <li><Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">Analytics & Reporting</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-foreground mb-6">Get in Touch</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 group">
                <div className="p-2 rounded-lg bg-secondary/50 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <MapPin className="w-4 h-4 shrink-0" />
                </div>
                <span className="text-muted-foreground pt-1">Plot No 3, Patel Nagar, Ghatkesar, 501301</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="p-2 rounded-lg bg-secondary/50 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Phone className="w-4 h-4 shrink-0" />
                </div>
                <span className="text-muted-foreground">7794072244</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="p-2 rounded-lg bg-secondary/50 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Mail className="w-4 h-4 shrink-0" />
                </div>
                <span className="text-muted-foreground">support@fleetmaster.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} FleetMaster Logistics. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;