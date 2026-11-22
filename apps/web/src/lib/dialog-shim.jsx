import React from 'react';
import { X } from 'lucide-react';

function cn(...args) {
  return args.filter(Boolean).join(' ');
}

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-150">
      <div 
        className="fixed inset-0 bg-transparent" 
        onClick={() => onOpenChange && onOpenChange(false)} 
      />
      <div className="relative z-50 w-full max-w-xl mx-auto">
        {children}
      </div>
    </div>
  );
}

export function DialogTrigger({ children, onClick, ...props }) {
  return <div onClick={onClick} {...props}>{children}</div>;
}

export function DialogPortal({ children }) {
  return <>{children}</>;
}

export function DialogOverlay({ className, ...props }) {
  return <div className={cn("fixed inset-0 bg-black/80", className)} {...props} />;
}

export function DialogClose({ children, onClick, ...props }) {
  return (
    <button type="button" onClick={onClick} {...props}>
      {children || <X className="w-4 h-4 text-slate-400 hover:text-white" />}
    </button>
  );
}

export function DialogContent({ className, children, ...props }) {
  return (
    <div 
      className={cn(
        "relative z-50 w-full bg-slate-950 border border-slate-800 p-6 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto text-white", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn("flex flex-col space-y-1.5 text-left mb-4", className)} {...props} />;
}

export function DialogFooter({ className, ...props }) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-4 pt-2 border-t border-slate-800/80", className)} {...props} />;
}

export function DialogTitle({ className, ...props }) {
  return <h3 className={cn("text-lg font-black tracking-tight text-white flex items-center gap-2", className)} {...props} />;
}

export function DialogDescription({ className, ...props }) {
  return <p className={cn("text-xs text-slate-400", className)} {...props} />;
}

export default {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
};
