import React from 'react';
import { MoreHorizontal, Phone, Mail, Copy, Share2, Edit2, Trash2, Eye, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { shareContact, copyContactDetails, extractGoogleMapsUrl } from '@/lib/contactUtils.js';

export default function ContactActionsMenu({ contact, onView, onEdit, onDelete }) {
  const handleCopy = () => {
    copyContactDetails(contact);
  };

  const handleShare = () => {
    shareContact(contact);
  };

  const handleOpenMaps = () => {
    const mapsUrl = extractGoogleMapsUrl(contact);
    if (mapsUrl) {
      window.open(mapsUrl, '_blank');
    } else {
      toast.error('No maps link or address available');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 bg-card border-border shadow-xl z-50">
        <DropdownMenuItem onClick={() => onView(contact)} className="cursor-pointer">
          <Eye className="mr-2 h-4 w-4 text-primary" /> View Card
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(`tel:${contact.phone_number}`)} className="cursor-pointer">
          <Phone className="mr-2 h-4 w-4 text-emerald-500" /> Call {contact.phone_number ? `(${contact.phone_number})` : ''}
        </DropdownMenuItem>
        {(contact.google_maps_url || contact.physical_address) && (
          <DropdownMenuItem onClick={handleOpenMaps} className="cursor-pointer">
            <MapPin className="mr-2 h-4 w-4 text-rose-500" /> Open Maps Navigation
          </DropdownMenuItem>
        )}
        {contact.email && (
          <DropdownMenuItem onClick={() => window.open(`mailto:${contact.email}`)} className="cursor-pointer">
            <Mail className="mr-2 h-4 w-4 text-blue-400" /> Email
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleShare} className="cursor-pointer font-bold text-primary">
          <Share2 className="mr-2 h-4 w-4 text-primary" /> Share Contact & Map
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy} className="cursor-pointer">
          <Copy className="mr-2 h-4 w-4" /> Copy Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEdit(contact)} className="cursor-pointer">
          <Edit2 className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(contact)} className="text-destructive focus:text-destructive cursor-pointer">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}