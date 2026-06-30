import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const PricingCard = ({ title, weight, price, features, isPopular, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={cn("h-full", isPopular && "relative z-10")}
    >
      <Card className={cn(
        "h-full flex flex-col transition-all duration-300",
        isPopular ? "border-primary shadow-xl scale-105 bg-card" : "bg-muted/30 border-border hover:shadow-md"
      )}>
        {isPopular && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium tracking-wide">
            Most Popular
          </div>
        )}
        <CardHeader className="text-center pb-2 pt-8">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <p className="text-muted-foreground mt-2">{weight}</p>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow p-6">
          <div className="text-center mb-8">
            <span className="text-4xl font-extrabold">{price}</span>
            {price !== 'Custom Quote' && <span className="text-muted-foreground"> / trip</span>}
          </div>
          <ul className="space-y-4 mb-8 flex-grow">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground/80">{feature}</span>
              </li>
            ))}
          </ul>
          <Button 
            asChild 
            className={cn("w-full h-12 text-base", isPopular ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90")}
          >
            <Link to="/quote">Get Quote</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PricingCard;