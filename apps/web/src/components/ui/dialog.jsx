import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = ({ open, onOpenChange, children }) => {
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
};
Dialog.displayName = "Dialog";

const DialogTrigger = ({ children, onClick, ...props }) => (
  <div onClick={onClick} {...props}>{children}</div>
);
DialogTrigger.displayName = "DialogTrigger";

const DialogPortal = ({ children }) => <>{children}</>;
DialogPortal.displayName = "DialogPortal";

const DialogOverlay = ({ className, ...props }) => (
  <div className={cn("fixed inset-0 bg-black/80", className)} {...props} />
);
DialogOverlay.displayName = "DialogOverlay";

const DialogClose = ({ children, onClick, ...props }) => (
  <button type="button" onClick={onClick} {...props}>
    {children || <X className="w-4 h-4 text-slate-400 hover:text-white" />}
  </button>
);
DialogClose.displayName = "DialogClose";

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative z-50 w-full bg-slate-950 border border-slate-800 p-6 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto text-white",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 text-left mb-4", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-4 pt-2 border-t border-slate-800/80", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-lg font-black tracking-tight text-white flex items-center gap-2", className)} {...props} />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-xs text-slate-400", className)} {...props} />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
