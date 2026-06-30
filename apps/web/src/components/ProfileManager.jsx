import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Trash2, Pencil, Copy, Star, Loader2, CheckCircle2 } from 'lucide-react';

export default function ProfileManager({ 
  isOpen, 
  onClose, 
  profiles, 
  activeProfileId, 
  onProfileSelect, 
  onSave, 
  onUpdate, 
  onDelete, 
  onDuplicate, 
  onSetDefault,
  loading 
}) {
  const [newProfileName, setNewProfileName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [editProfile, setEditProfile] = useState(null);

  const handleSaveNew = async () => {
    if (!newProfileName.trim()) return;
    await onSave(newProfileName);
    setNewProfileName('');
  };

  const handleUpdate = async () => {
    if (!editProfile || !editProfile.profileName.trim()) return;
    await onUpdate(editProfile.id, { profileName: editProfile.profileName });
    setEditProfile(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    await onDelete(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto custom-scrollbar border-l border-border">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <Bookmark className="w-5 h-5 text-primary" />
              Loan Profiles
            </SheetTitle>
            <SheetDescription>
              Manage your saved loan configurations for quick access.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            {/* Save Current State */}
            <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-3">
              <Label className="text-sm font-semibold">Save Current Calculator State</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g., Home Loan 2026" 
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="bg-background"
                />
                <Button onClick={handleSaveNew} disabled={loading || !newProfileName.trim()} className="shrink-0">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            </div>

            {/* Profiles List */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Saved Profiles</h4>
              
              {profiles.length === 0 && !loading && (
                <div className="text-center p-8 border border-dashed border-border rounded-xl text-muted-foreground">
                  <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No profiles saved yet.</p>
                </div>
              )}

              {profiles.map(profile => {
                const isActive = profile.id === activeProfileId;
                return (
                  <div 
                    key={profile.id} 
                    className={`p-4 rounded-xl border transition-all ${isActive ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:border-primary/30'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-foreground">{profile.profileName}</h5>
                          {isActive && <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0 h-5"><CheckCircle2 className="w-3 h-3 mr-1"/> Active</Badge>}
                          {profile.isDefault && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">Default</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          ₹{profile.loanAmount?.toLocaleString('en-IN')} • {profile.interestRate}% • {profile.loanTerm} mos
                        </p>
                      </div>
                      <Button 
                        variant={isActive ? "secondary" : "outline"} 
                        size="sm" 
                        onClick={() => onProfileSelect(profile.id)}
                        disabled={isActive || loading}
                        className="h-8 text-xs"
                      >
                        {isActive ? 'Loaded' : 'Load'}
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-1 pt-3 border-t border-border/50">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setEditProfile(profile)} title="Edit Name">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onDuplicate(profile)} title="Duplicate">
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      {!profile.isDefault && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-warning" onClick={() => onSetDefault(profile.id)} title="Set as Default">
                          <Star className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <div className="flex-1"></div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteConfirmId(profile.id)} title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this loan profile? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} disabled={loading}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Name */}
      <Dialog open={!!editProfile} onOpenChange={(open) => !open && setEditProfile(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Rename Profile</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Profile Name</Label>
            <Input 
              value={editProfile?.profileName || ''} 
              onChange={(e) => setEditProfile({...editProfile, profileName: e.target.value})}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfile(null)} disabled={loading}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={loading || !editProfile?.profileName.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}