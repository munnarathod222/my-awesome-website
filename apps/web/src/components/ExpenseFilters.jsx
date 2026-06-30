import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X, Calendar as CalendarIcon } from 'lucide-react';

const ExpenseFilters = ({ filters, setFilters, trucks, creditCards = [], onClear }) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-5 mb-8 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Search */}
        <div className="relative xl:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search description, truck no, vendor..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-9 bg-background text-foreground border-border"
          />
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2 bg-background border border-border rounded-md px-3 h-10 xl:col-span-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          <input 
            type="date" 
            className="bg-transparent border-none outline-none text-sm w-full text-foreground dark:[color-scheme:dark]"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            title="From Date"
          />
          <span className="text-muted-foreground text-sm">to</span>
          <input 
            type="date" 
            className="bg-transparent border-none outline-none text-sm w-full text-foreground dark:[color-scheme:dark]"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            title="To Date"
          />
        </div>

        {/* Category */}
        <Select 
          value={filters.category} 
          onValueChange={(val) => setFilters({ ...filters, category: val, subcategory: 'all' })}
        >
          <SelectTrigger className="bg-background text-foreground border-border">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Employee Advance">Employee Advance</SelectItem>
            <SelectItem value="EMI">EMI</SelectItem>
            <SelectItem value="Regular">Regular</SelectItem>
          </SelectContent>
        </Select>

        {/* Subcategory (Only visible when Regular is selected) */}
        {filters.category === 'Regular' && (
          <Select value={filters.subcategory} onValueChange={(val) => setFilters({ ...filters, subcategory: val })}>
            <SelectTrigger className="bg-background text-foreground border-border">
              <SelectValue placeholder="All Subcategories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subcategories</SelectItem>
              <SelectItem value="Fuel">Fuel</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Toll">Toll</SelectItem>
              <SelectItem value="Insurance">Insurance</SelectItem>
              <SelectItem value="Salary">Salary</SelectItem>
              <SelectItem value="Rent">Rent</SelectItem>
              <SelectItem value="Utilities">Utilities</SelectItem>
              <SelectItem value="Rapido">Rapido</SelectItem>
              <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Credit Card Filter */}
        <Select value={filters.creditCard} onValueChange={(val) => setFilters({ ...filters, creditCard: val })}>
          <SelectTrigger className="bg-background text-foreground border-border">
            <SelectValue placeholder="All Methods/Cards" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods/Cards</SelectItem>
            <SelectItem value="none">Not Linked to Card</SelectItem>
            {creditCards.map(card => (
              <SelectItem key={card.id} value={card.id}>
                {card.card_name} - {card.card_number_last4}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Payment Mode */}
        <Select value={filters.paymentMode} onValueChange={(val) => setFilters({ ...filters, paymentMode: val })}>
          <SelectTrigger className="bg-background text-foreground border-border">
            <SelectValue placeholder="All Payment Modes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment Modes</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="Card">Card</SelectItem>
            <SelectItem value="UPI">UPI</SelectItem>
            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
            <SelectItem value="Cheque">Cheque</SelectItem>
          </SelectContent>
        </Select>

        {/* Truck No */}
        <Select value={filters.truckNo} onValueChange={(val) => setFilters({ ...filters, truckNo: val })}>
          <SelectTrigger className="bg-background text-foreground border-border">
            <SelectValue placeholder="All Trucks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trucks</SelectItem>
            {trucks.map(t => (
              <SelectItem key={t.id} value={t.truck_number}>{t.truck_number}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={filters.sortBy} onValueChange={(val) => setFilters({ ...filters, sortBy: val })}>
          <SelectTrigger className="bg-background text-foreground border-border">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-date">Newest First</SelectItem>
            <SelectItem value="date">Oldest First</SelectItem>
            <SelectItem value="-amount">Amount: High to Low</SelectItem>
            <SelectItem value="amount">Amount: Low to High</SelectItem>
            <SelectItem value="category">Category (A-Z)</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        <Button variant="ghost" onClick={onClear} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4 mr-2" /> Clear
        </Button>
      </div>
    </div>
  );
};

export default ExpenseFilters;