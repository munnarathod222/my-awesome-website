import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const ServiceCard = ({ icon: Icon, title, description, link, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="h-full bg-card border-border hover:shadow-lg transition-all duration-300 group">
        <CardContent className="p-8 flex flex-col h-full">
          <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-7 h-7 text-secondary" />
          </div>
          <h3 className="text-2xl font-bold mb-3">{title}</h3>
          <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">{description}</p>
          <Link 
            to={link} 
            className="inline-flex items-center text-primary font-medium hover:text-primary/80 transition-colors mt-auto"
          >
            Learn More <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ServiceCard;