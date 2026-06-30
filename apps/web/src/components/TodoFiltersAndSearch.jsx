import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

const TodoFiltersAndSearch = ({ filters, setFilters }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 bg-card p-4 rounded-xl border border-border">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          className="pl-9 bg-input text-foreground"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Select value={filters.status} onValueChange={(val) => setFilters({ ...filters, status: val })}>
          <SelectTrigger className="w-[130px] bg-input text-foreground">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.priority} onValueChange={(val) => setFilters({ ...filters, priority: val })}>
          <SelectTrigger className="w-[130px] bg-input text-foreground">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Priority</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.category} onValueChange={(val) => setFilters({ ...filters, category: val })}>
          <SelectTrigger className="w-[130px] bg-input text-foreground">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            <SelectItem value="Personal">Personal</SelectItem>
            <SelectItem value="Work">Work</SelectItem>
            <SelectItem value="Maintenance">Maintenance</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.sortBy} onValueChange={(val) => setFilters({ ...filters, sortBy: val })}>
          <SelectTrigger className="w-[140px] bg-input text-foreground">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-created">Newest First</SelectItem>
            <SelectItem value="due_date">Due Date</SelectItem>
            <SelectItem value="-priority">Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TodoFiltersAndSearch;