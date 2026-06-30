import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getEmployeePhotoUrl } from '@/lib/photoUtils.js';
import { Badge } from '@/components/ui/badge';

const EmployeePhotoModal = ({ isOpen, onClose, employee }) => {
  if (!employee) return null;

  const photoUrl = getEmployeePhotoUrl(employee, false);
  const hasPhoto = !!employee.photo;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Employee Photo</DialogTitle>
          <DialogDescription className="sr-only">
            Full size photo of {employee.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-muted shadow-xl bg-muted/30 flex items-center justify-center">
            {hasPhoto ? (
              <img 
                src={photoUrl} 
                alt={`Photo of ${employee.name}`} 
                className="w-full h-full object-cover"
              />
            ) : (
              <img 
                src={photoUrl} 
                alt="Placeholder avatar" 
                className="w-32 h-32 opacity-50"
              />
            )}
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold tracking-tight">{employee.name}</h3>
            <Badge variant="secondary" className="capitalize text-sm px-3 py-1">
              {employee.employee_type || 'Employee'}
            </Badge>
            {employee.contact && (
              <p className="text-muted-foreground text-sm mt-2">{employee.contact}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeePhotoModal;