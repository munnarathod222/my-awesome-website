import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, ArrowRight, RotateCw, Maximize, Minimize, 
  ExternalLink, Lock, ShieldCheck, MapPin, Truck, AlertTriangle, 
  Radio, Compass, Layers, CheckCircle2, Info
} from 'lucide-react';
import { toast } from 'sonner';

const BLACKBUCK_GPS_URL = 'https://blackbuck.com/boss/gps';
const BLACKBUCK_HOME_URL = 'https://www.blackbuck.com';

export default function GPSPage() {
  const [activeTab, setActiveTab] = useState('webview'); // 'webview' | 'api_hub'
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeBlocked, setIframeBlocked] = useState(true); // Default to fallback since BlackBuck sends X-Frame-Options: SAMEORIGIN
  const [tryEmbed, setTryEmbed] = useState(false);

  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        toast.error('Fullscreen mode not permitted by browser');
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
    toast.success('Refreshing BlackBuck GPS view...');
  };

  const handleBack = () => {
    try {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.history.back();
      }
    } catch (e) {
      toast.info('Back navigation restricted across origins');
    }
  };

  const handleForward = () => {
    try {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.history.forward();
      }
    } catch (e) {
      toast.info('Forward navigation restricted across origins');
    }
  };

  const handleOpenExternal = () => {
    window.open(BLACKBUCK_GPS_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-8">
      <Helmet>
        <title>BlackBuck GPS & Fleet Tracking | Jai Bhavani Cargo</title>
      </Helmet>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/60 backdrop-blur border border-border/40 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-foreground">BlackBuck GPS & Fleet Control</h1>
              <Badge variant="outline" className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                LIVE GPS HUB
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Access real-time vehicle GPS locations, route replays, and speed telematics directly via BlackBuck BOSS.
            </p>
          </div>
        </div>

        {/* View Switcher: Webview vs Future API */}
        <div className="flex items-center gap-2">
          <div className="bg-muted/40 p-1 rounded-xl border border-border/40 flex items-center">
            <button
              onClick={() => setActiveTab('webview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'webview'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🌐 BlackBuck Webview
            </button>
            <button
              onClick={() => setActiveTab('api_hub')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'api_hub'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ⚡ Direct GPS API (Future)
            </button>
          </div>

          <Button 
            onClick={handleOpenExternal}
            className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open BlackBuck GPS
          </Button>
        </div>
      </div>

      {activeTab === 'webview' ? (
        /* Browser-Style Container */
        <div 
          ref={containerRef}
          className={`flex flex-col rounded-2xl border border-border/50 bg-slate-950 overflow-hidden shadow-2xl transition-all ${
            isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0' : 'h-[780px] sm:h-[820px]'
          }`}
        >
          {/* Top Mini-Browser Chrome Bar */}
          <div className="bg-slate-900 border-b border-slate-800 p-2.5 px-3.5 flex items-center justify-between gap-2 select-none">
            {/* Browser Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                title="Go Back"
                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleForward}
                title="Go Forward"
                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                title="Refresh Page"
                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              </Button>
            </div>

            {/* Browser URL / Status Bar */}
            <div className="flex-1 max-w-xl mx-2">
              <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800/80 rounded-xl px-3 py-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2 truncate">
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-bold text-white shrink-0">BlackBuck GPS</span>
                  <span className="text-slate-500 truncate font-mono text-[11px] hidden md:inline">
                    https://blackbuck.com/boss/gps
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider hidden sm:inline">Connected</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Fullscreen & Open External */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenExternal}
                title="Open in new window"
                className="h-8 px-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg font-semibold flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Window</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFullscreen}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Browser Viewport Area */}
          <div className="flex-1 relative bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
            {tryEmbed ? (
              /* Attempted Iframe */
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={BLACKBUCK_GPS_URL}
                title="BlackBuck GPS Dashboard"
                onLoad={() => setIsLoading(false)}
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
                allow="geolocation; microphone; camera; display-capture"
              />
            ) : (
              /* Professional Fallback Card (because BlackBuck enforces X-Frame-Options: SAMEORIGIN) */
              <div className="max-w-xl w-full p-8 mx-auto text-center space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/5">
                  <Truck className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    BlackBuck GPS & Fleet Portal
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    BlackBuck GPS protects security using origin restrictions (<code className="text-emerald-400 font-mono text-xs">X-Frame-Options: SAMEORIGIN</code>). 
                    Access your live truck GPS tracking, route playback, and fuel sensor telemetry directly in your browser.
                  </p>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    size="lg"
                    onClick={handleOpenExternal}
                    className="w-full sm:w-auto px-8 py-6 rounded-2xl font-extrabold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 group transition-all"
                  >
                    <span>Open BlackBuck GPS Dashboard</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setTryEmbed(true);
                      setIsLoading(true);
                    }}
                    className="w-full sm:w-auto px-5 py-6 rounded-2xl font-bold text-xs border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900"
                  >
                    Attempt In-Page Embed
                  </Button>
                </div>

                {/* Login Session Persistence Explainer Card */}
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 text-left space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 font-bold text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Seamless 1-Time Login Persistence</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    When you log into BlackBuck in your browser, your session token & cookies are saved securely in your browser. 
                    You only need to log in <strong>once</strong> — all future clicks on this GPS tab will open your live dashboard without prompting for OTP or password again.
                  </p>
                </div>

                {/* Direct Sub-Links */}
                <div className="pt-2 border-t border-slate-800/60 flex flex-wrap justify-center gap-4 text-xs font-semibold text-slate-400">
                  <a 
                    href="https://blackbuck.com/boss/gps" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                  >
                    <Compass className="w-3.5 h-3.5" /> Live GPS Map
                  </a>
                  <span className="text-slate-700">•</span>
                  <a 
                    href="https://blackbuck.com/boss/fastag" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                  >
                    <Radio className="w-3.5 h-3.5" /> BlackBuck FASTag
                  </a>
                  <span className="text-slate-700">•</span>
                  <a 
                    href="https://blackbuck.com/boss/fuel" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                  >
                    <Layers className="w-3.5 h-3.5" /> Fuel Card Portal
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Future-Ready Direct GPS API Architecture Tab */
        <Card className="p-6 rounded-2xl border-border/40 bg-card/60 backdrop-blur space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                BlackBuck Direct Telematics API Integration
              </h2>
              <p className="text-xs text-muted-foreground">
                Architecture designed to ingest live BlackBuck GPS webhooks and REST telemetry into Jai Bhavani Cargo.
              </p>
            </div>
            <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-xs font-bold">
              READY FOR API KEYS
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border/40 bg-muted/20 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="text-sm font-bold text-foreground">Fleet Telemetry Ingestion</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connects truck GPS devices directly with Jai Bhavani Cargo truck records (e.g. <code className="text-xs font-mono text-primary">TG12U2637</code>) for speed, ignition, and real-time odometer KM sync.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/40 bg-muted/20 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="text-sm font-bold text-foreground">Automated Geofence Triggers</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automatically detects when trucks reach loading docks or delivery drops, updating Trip Logs from <Badge variant="outline" className="text-[10px]">In Transit</Badge> to <Badge variant="outline" className="text-[10px] text-emerald-400">Delivered</Badge>.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/40 bg-muted/20 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="text-sm font-bold text-foreground">Anti-Theft & Fuel Sensor Alerts</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Receives instant alerts on unexpected fuel drops, night halt violations, and sudden route deviations directly to WhatsApp.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Info className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>When BlackBuck issues API credentials for your account, simply supply <code className="text-emerald-400 font-mono">BLACKBUCK_API_KEY</code> in Render to activate direct sensor feeds.</span>
            </div>
            <Button
              size="sm"
              onClick={() => setActiveTab('webview')}
              className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs"
            >
              Return to Webview
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
