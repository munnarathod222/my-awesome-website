import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BookOpen, MoreVertical, Edit2, Trash2, Calendar, FileText, ArrowRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

const CashbookListView = ({ cashbooks, loading, onSelect, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="shadow-sm border-border">
            <CardHeader className="pb-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (cashbooks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-2xl bg-muted/20">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Cashbooks Found</h3>
        <p className="text-muted-foreground max-w-md">
          You haven't created any cashbooks yet. Create your first book to start tracking your transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cashbooks.map((book) => {
        const isNegativeBalance = Number(book.currentBalance) < 0;
        const isNegativeOpening = Number(book.opening_balance) < 0;
        const currencySymbol = book.currency === 'USD' ? '$' : book.currency === 'EUR' ? '€' : book.currency === 'GBP' ? '£' : '₹';

        return (
          <Card key={book.id} className="shadow-sm border-border hover:shadow-md transition-shadow group flex flex-col h-full bg-card">
            <CardHeader className="pb-4 flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-semibold line-clamp-1" title={book.name}>{book.name}</CardTitle>
                {book.description && (
                  <CardDescription className="line-clamp-2 mt-1.5 leading-relaxed text-sm">
                    {book.description}
                  </CardDescription>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2 text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(book)} className="cursor-pointer">
                    <Edit2 className="w-4 h-4 mr-2" /> Edit Book
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(book)} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Book
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            
            <CardContent className="pb-6 space-y-5 flex-1">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Current Balance</span>
                <span className={`text-3xl font-bold tracking-tight tabular-nums ${isNegativeBalance ? 'text-destructive' : 'text-foreground'}`}>
                  {isNegativeBalance ? '-' : ''}{currencySymbol}{Math.abs(Number(book.currentBalance)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <span className="text-xs font-medium text-muted-foreground block mb-1">Opening Bal.</span>
                  <span className={`text-sm font-medium tabular-nums ${isNegativeOpening ? 'text-destructive/80' : 'text-foreground'}`}>
                    {isNegativeOpening ? '-' : ''}{currencySymbol}{Math.abs(Number(book.opening_balance)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground block mb-1">Transactions</span>
                  <div className="flex items-center text-sm font-medium">
                    <FileText className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                    {book.txCount || 0}
                  </div>
                </div>
              </div>
              
              {book.lastTxDate && (
                <div className="flex items-center text-xs text-muted-foreground pt-2">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  Last activity: {format(new Date(book.lastTxDate), 'MMM d, yyyy')}
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-0 mt-auto">
              <Button 
                onClick={() => onSelect(book)} 
                className="w-full group-hover:bg-primary/90 transition-colors"
                variant="secondary"
              >
                Open Book <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default CashbookListView;