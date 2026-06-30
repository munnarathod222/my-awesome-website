import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, User, Truck, BookOpen, FileText, BarChart3, Globe } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess.js';
import { cn } from '@/lib/utils.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext.jsx';

export default function Header() {
  const { isAuthenticated, logout, currentUser } = useAuth();
  const { isAdmin, isManager, isDispatcher } = useRoleBasedAccess();
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLink = ({ to, children }) => {
    // Exact match for dashboard to prevent active state bleeding, startsWith for others
    const isActive = to === '/dashboard' 
      ? location.pathname === '/dashboard' 
      : location.pathname.startsWith(to);

    return (
      <Link 
        to={to} 
        className={cn(
          "px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-xl relative",
          isActive 
            ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]" 
            : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:scale-105"
        )}
      >
        {children}
      </Link>
    );
  };

  const DesktopNav = () => (
    <nav className="hidden md:flex items-center gap-1.5 flex-1 px-6">
      <NavLink to="/dashboard">Dashboard</NavLink>
      <NavLink to="/truck-manager">Trucks</NavLink>
      <NavLink to="/trip-logs">Trips</NavLink>
      <NavLink to="/cashbook">Cashbook</NavLink>
      {(isAdmin || isManager || isDispatcher) && (
        <NavLink to="/analytics">Analytics</NavLink>
      )}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/55 backdrop-blur-md supports-[backdrop-filter]:bg-background/45 shadow-lg transition-all duration-300">
      <div className="container max-w-7xl mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
        
        {/* Left: Logo */}
        <div className="flex items-center shrink-0">
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
              <Truck className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight hidden sm:inline-block text-foreground">
              FleetMaster
            </span>
          </Link>
        </div>

        {/* Right: Profile & Actions */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:block">
                Login
              </Link>
              <Button asChild size="sm" className="rounded-full shadow-sm hover:-translate-y-0.5 transition-all duration-300">
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          ) : (
            <>
              <div className="hidden sm:flex items-center gap-4">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-secondary/30 border border-border/50">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="bg-transparent border-none shadow-none h-7 w-20 px-1 focus:ring-0 text-xs font-semibold text-foreground">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिन्दी</SelectItem>
                      <SelectItem value="mr">मराठी</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-sm font-medium text-secondary-foreground">
                  <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center border border-border/50 shadow-sm">
                    <User className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <span className="pr-1">{currentUser?.full_name || currentUser?.name || 'User'}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors" aria-label="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] border-l border-border/50">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 font-heading">
                      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <Truck className="h-4 w-4 text-primary-foreground" />
                      </div>
                      FleetMaster
                    </SheetTitle>
                    <SheetDescription className="sr-only">Navigation Menu</SheetDescription>
                  </SheetHeader>
                  
                  <div className="flex flex-col gap-6 mt-8">
                    <div className="flex flex-col gap-3 px-4 py-3 rounded-xl bg-secondary/30 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-sm">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{currentUser?.full_name || currentUser?.name || 'User'}</p>
                          <p className="text-xs text-muted-foreground capitalize">{currentUser?.role?.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 pt-2 border-t border-border/30">
                        <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="bg-transparent border-none shadow-none h-7 w-24 px-1 focus:ring-0 text-xs font-semibold text-foreground">
                            <SelectValue placeholder="Language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="hi">हिन्दी</SelectItem>
                            <SelectItem value="mr">मराठी</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <nav className="flex flex-col gap-1">
                      <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-secondary/80 hover:text-foreground transition-colors">
                        <BookOpen className="h-4 w-4 text-muted-foreground" /> Dashboard
                      </Link>
                      <Link to="/truck-manager" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-secondary/80 hover:text-foreground transition-colors">
                        <Truck className="h-4 w-4 text-muted-foreground" /> Trucks
                      </Link>
                      <Link to="/trip-logs" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-secondary/80 hover:text-foreground transition-colors">
                        <Truck className="h-4 w-4 text-muted-foreground" /> Trips
                      </Link>
                      <Link to="/cashbook" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-secondary/80 hover:text-foreground transition-colors">
                        <FileText className="h-4 w-4 text-muted-foreground" /> Cashbook
                      </Link>
                      {(isAdmin || isManager || isDispatcher) && (
                        <Link to="/analytics" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-secondary/80 hover:text-foreground transition-colors">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" /> Analytics
                        </Link>
                      )}
                    </nav>
                    
                    <div className="mt-auto pt-4 border-t border-border/50">
                      <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl py-6" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-3" /> Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
        
      </div>
    </header>
  );
}