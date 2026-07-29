import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Settings, ShieldCheck, DollarSign, MapPin, Activity, Save } from 'lucide-react';
import { toast } from 'sonner';
import AdminPricingPanelModal from '@/components/AdminPricingPanelModal.jsx';
import { motion } from 'framer-motion';

export default function AdminMapsSettingsPage() {
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [toggles, setToggles] = useState({
    liveTracking: true,
    freightCalculator: true,
    geofencing: true,
    nearbyServices: true,
  });

  const handleSaveToggles = () => {
    localStorage.setItem('MAPS_ADMIN_SETTINGS', JSON.stringify(toggles));
    toast.success('Google Maps Admin Settings Saved!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6 font-sans"
    >
      <Helmet>
        <title>Google Maps Admin Controls | Jai Bhavani Cargo</title>
      </Helmet>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl text-primary border border-primary/20">
              <Settings className="w-7 h-7" />
            </div>
            Google Maps Admin Controls
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure Maps Platform Features • Dynamic Pricing Rules • Geofence Rules
          </p>
        </div>

        <Button onClick={() => setIsPricingModalOpen(true)} className="rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md">
          <DollarSign className="w-4 h-4 mr-1" /> Adjust Freight Pricing
        </Button>
      </div>

      <Card className="rounded-3xl border border-border/60 bg-card p-6 space-y-6 shadow-md">
        <h3 className="text-sm font-extrabold text-foreground border-b border-border/40 pb-3">
          Platform Feature Toggles
        </h3>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/40">
            <div>
              <span className="font-bold text-foreground block">Public Live Customer Tracking</span>
              <span className="text-[11px] text-muted-foreground">Allow customers to track waybill numbers on Google Maps</span>
            </div>
            <Switch
              checked={toggles.liveTracking}
              onCheckedChange={(val) => setToggles({ ...toggles, liveTracking: val })}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/40">
            <div>
              <span className="font-bold text-foreground block">Instant Freight Calculator</span>
              <span className="text-[11px] text-muted-foreground">Display Google Maps distance fare estimator on homepage</span>
            </div>
            <Switch
              checked={toggles.freightCalculator}
              onCheckedChange={(val) => setToggles({ ...toggles, freightCalculator: val })}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/40">
            <div>
              <span className="font-bold text-foreground block">Automated Geofencing Alerts</span>
              <span className="text-[11px] text-muted-foreground">Notify admin when trucks arrive or depart hubs/warehouses</span>
            </div>
            <Switch
              checked={toggles.geofencing}
              onCheckedChange={(val) => setToggles({ ...toggles, geofencing: val })}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/40">
            <div>
              <span className="font-bold text-foreground block">Driver Nearby Services Locator</span>
              <span className="text-[11px] text-muted-foreground">Enable fuel station, garage, and emergency search for drivers</span>
            </div>
            <Switch
              checked={toggles.nearbyServices}
              onCheckedChange={(val) => setToggles({ ...toggles, nearbyServices: val })}
            />
          </div>
        </div>

        <Button onClick={handleSaveToggles} className="w-full rounded-2xl font-extrabold text-xs bg-primary text-primary-foreground h-11 shadow-lg">
          <Save className="w-4 h-4 mr-2" /> Save Admin Map Settings
        </Button>
      </Card>

      <AdminPricingPanelModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
      />
    </motion.div>
  );
}
