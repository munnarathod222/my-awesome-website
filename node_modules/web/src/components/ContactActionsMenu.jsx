import React from 'react';
import { MoreHorizontal, Phone, Mail, Copy, Share2, Edit2, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function ContactActionsMenu({ contact, onView, onEdit, onDelete }) {
  const handleCopy = () => {
    const text = `${contact.company_name}\nPhone: ${contact.phone_number}\nGSTIN: ${contact.gstin}\nAddress: ${contact.physical_address}`;
    navigator.clipboard.writeText(text);
    toast.success('Contact details copied to clipboard');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${contact.company_name} Contact Info`,
        text: `Contact: ${contact.company_name}\nPhone: ${contact.phone_number}\nGSTIN: ${contact.gstin}`,
      }).catch(console.error);
    } else {
      handleCopy();
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
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onView(contact)}>
          <Eye className="mr-2 h-4 w-4" /> View Card
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(`tel:${contact.phone_number}`)}>
          <Phone className="mr-2 h-4 w-4" /> Call
        </DropdownMenuItem>
        {contact.email && (
          <DropdownMenuItem onClick={() => window.open(`mailto:${contact.email}`)}>
            <Mail className="mr-2 h-4 w-4" /> Email
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" /> Copy Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" /> Share
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEdit(contact)}>
          <Edit2 className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(contact)} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}