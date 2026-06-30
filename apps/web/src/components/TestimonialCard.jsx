import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const TestimonialCard = ({ name, company, quote, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <Card className="h-full bg-muted/50 border-none shadow-none">
        <CardContent className="p-8 flex flex-col h-full">
          <div className="flex gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
            ))}
          </div>
          <blockquote className="text-lg text-foreground leading-relaxed mb-8 flex-grow">
            "{quote}"
          </blockquote>
          <div className="flex items-center gap-4 mt-auto">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
              {name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-foreground">{name}</div>
              <div className="text-sm text-muted-foreground">{company}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TestimonialCard;