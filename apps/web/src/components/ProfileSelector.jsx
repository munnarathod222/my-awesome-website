import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bookmark } from 'lucide-react';

export default function ProfileSelector({ profiles, activeProfileId, onProfileChange, loading, trucks = [] }) {
  if (loading && profiles.length === 0) {
    return (
      <div className="h-10 w-full sm:w-[240px] bg-muted animate-pulse rounded-xl"></div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto min-w-0">
      <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
        <Bookmark className="w-4 h-4" />
      </div>
      <Select 
        value={activeProfileId || 'draft'} 
        onValueChange={(val) => onProfileChange(val === 'draft' ? null : val)}
      >
        <SelectTrigger className="w-full sm:w-[240px] bg-background rounded-xl shadow-sm border-border min-w-0 flex-1">
          <SelectValue placeholder="Select a profile" className="truncate" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft" className="font-medium italic text-muted-foreground">
            Unsaved Draft
          </SelectItem>
          {profiles.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground text-center italic">
              No profiles saved
            </div>
          ) : (
            profiles.map(profile => {
              const linkedTruck = trucks.find(t => t.id === profile.truck_id);
              return (
                <SelectItem key={profile.id} value={profile.id}>
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="truncate">{profile.profileName} {linkedTruck ? `· ${linkedTruck.truck_number}` : ''}</span>
                    {profile.isDefault && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium shrink-0">Default</span>}
                  </div>
                </SelectItem>
              );
            })
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
