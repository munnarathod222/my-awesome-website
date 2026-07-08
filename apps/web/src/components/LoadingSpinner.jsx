import React from 'react';
import { Truck } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading data…' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[320px] w-full select-none">
      {/* Animated truck icon with pulsing ring */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping" style={{ animationDuration: '1.5s' }} />
        <div className="relative w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center shadow-glow-primary">
          <Truck className="w-7 h-7 text-primary animate-pulse" />
        </div>
      </div>

      {/* Dot loader row */}
      <div className="flex items-center gap-1.5 mb-4">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary"
            style={{
              animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>

      <p className="text-sm text-muted-foreground font-medium tracking-wide">{text}</p>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: scaleY(1); opacity: 0.5; }
          50%       { transform: scaleY(1.8); opacity: 1; }
        }
      `}</style>
    </div>
  );
}