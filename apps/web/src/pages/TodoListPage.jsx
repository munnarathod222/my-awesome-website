import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, Plus, AlertCircle, Edit2, Trash2, Calendar, 
  Clock, Tag, Search, Filter, LayoutGrid, List, CheckCircle2, 
  AlertTriangle, ArrowRight, RefreshCw, Zap, Sparkles, Flag, MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { usePageData } from '@/hooks/usePageData.js';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import TodoTaskModal from '@/components/TodoTaskModal.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { format, isBefore, isToday, parseISO } from 'date-fns';

const CATEGORY_COLORS = {
  Work: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  Maintenance: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Finance: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Fleet: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  Personal: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
  Other: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

const PRIORITY_BADGES = {
  High: 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-bold',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Low: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

const TodoListPage = () => {
  const { data: todos = [], loading, error, retry } = usePageData('todos', { sort: '-created' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // UI View & Filter state
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'list'
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleToggleComplete = async (task) => {
    try {
      const isComp = !task.is_completed;
      const newStatus = isComp ? 'Completed' : 'Pending';
      await pb.collection('todos').update(task.id, { 
        is_completed: isComp,
        status: newStatus
      }, { $autoCancel: false });
      toast.success(isComp ? 'Task marked complete! 🎉' : 'Task reopened');
      retry();
    } catch (err) {
      console.error('Failed to toggle task status:', err);
      toast.error('Failed to update task status');
    }
  };

  const handleMoveStatus = async (task, newStatus) => {
    try {
      const isComp = newStatus === 'Completed';
      await pb.collection('todos').update(task.id, {
        status: newStatus,
        is_completed: isComp
      }, { $autoCancel: false });
      toast.success(`Task moved to ${newStatus}`);
      retry();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await pb.collection('todos').delete(id, { $autoCancel: false });
      toast.success('Task deleted');
      retry();
    } catch (err) {
      console.error('Failed to delete task:', err);
      toast.error('Failed to delete task');
    }
  };

  // Filtered tasks computation
  const filteredTodos = useMemo(() => {
    return todos.filter(t => {
      if (search && !t.title?.toLowerCase().includes(search.toLowerCase()) && !t.description?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
      if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
      if (statusFilter !== 'All') {
        if (statusFilter === 'Completed' && !t.is_completed) return false;
        if (statusFilter === 'Pending' && (t.is_completed || t.status === 'In Progress')) return false;
        if (statusFilter === 'In Progress' && (t.is_completed || t.status !== 'In Progress')) return false;
      }
      return true;
    });
  }, [todos, search, categoryFilter, priorityFilter, statusFilter]);

  // Metrics computation
  const metrics = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.is_completed || t.status === 'Completed').length;
    const inProgress = todos.filter(t => !t.is_completed && t.status === 'In Progress').length;
    const pending = todos.filter(t => !t.is_completed && (t.status === 'Pending' || !t.status)).length;
    const highPriority = todos.filter(t => !t.is_completed && t.priority === 'High').length;

    const overdue = todos.filter(t => {
      if (t.is_completed || !t.due_date) return false;
      try {
        const dueDate = new Date(t.due_date);
        return isBefore(dueDate, new Date()) && !isToday(dueDate);
      } catch {
        return false;
      }
    }).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, pending, highPriority, overdue, completionRate };
  }, [todos]);

  // Kanban Board Columns
  const boardColumns = [
    { title: 'Pending', status: 'Pending', color: 'border-blue-500/40 text-blue-400 bg-blue-500/5', items: filteredTodos.filter(t => !t.is_completed && (t.status === 'Pending' || !t.status)) },
    { title: 'In Progress', status: 'In Progress', color: 'border-amber-500/40 text-amber-400 bg-amber-500/5', items: filteredTodos.filter(t => !t.is_completed && t.status === 'In Progress') },
    { title: 'Completed ✓', status: 'Completed', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5', items: filteredTodos.filter(t => t.is_completed || t.status === 'Completed') }
  ];

  if (loading) return <LoadingSpinner text="Loading your task space..." />;

  if (error) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4 opacity-80" />
        <h2 className="text-2xl font-bold mb-2 text-foreground">Failed to load tasks</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Button onClick={retry} size="lg" className="rounded-xl shadow-sm">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <Helmet>
        <title>Advanced Task Manager | Jai Bhavani Cargo</title>
      </Helmet>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl text-primary"><CheckSquare className="w-7 h-7" /></div>
            Task Command Center
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Manage daily operations, fleet maintenance, and administrative action items.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={retry} className="rounded-xl text-xs font-bold shadow-sm">
            <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
          </Button>
          <Button onClick={handleAddTask} className="rounded-xl font-bold text-xs bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Plus className="w-4 h-4 mr-1.5" /> Add New Task
          </Button>
        </div>
      </div>

      {/* KPI Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="rounded-2xl border-border/60 bg-card p-4 space-y-1 shadow-sm">
          <div className="text-[11px] font-bold text-muted-foreground uppercase">Total Tasks</div>
          <div className="text-2xl font-black font-mono text-foreground">{metrics.total}</div>
          <div className="text-[10px] text-muted-foreground font-semibold">{metrics.completed} Completed</div>
        </Card>

        <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/5 p-4 space-y-1 shadow-sm">
          <div className="text-[11px] font-bold text-emerald-500 uppercase">Completion Rate</div>
          <div className="text-2xl font-black font-mono text-emerald-500">{metrics.completionRate}%</div>
          <Progress value={metrics.completionRate} className="h-1 bg-emerald-500/20" />
        </Card>

        <Card className="rounded-2xl border-blue-500/30 bg-blue-500/5 p-4 space-y-1 shadow-sm">
          <div className="text-[11px] font-bold text-blue-400 uppercase">Pending</div>
          <div className="text-2xl font-black font-mono text-blue-400">{metrics.pending}</div>
          <div className="text-[10px] text-muted-foreground">Action Needed</div>
        </Card>

        <Card className="rounded-2xl border-amber-500/30 bg-amber-500/5 p-4 space-y-1 shadow-sm">
          <div className="text-[11px] font-bold text-amber-400 uppercase">In Progress</div>
          <div className="text-2xl font-black font-mono text-amber-400">{metrics.inProgress}</div>
          <div className="text-[10px] text-muted-foreground">Active Work</div>
        </Card>

        <Card className="rounded-2xl border-rose-500/30 bg-rose-500/5 p-4 space-y-1 shadow-sm">
          <div className="text-[11px] font-bold text-rose-400 uppercase">Overdue</div>
          <div className="text-2xl font-black font-mono text-rose-400">{metrics.overdue}</div>
          <div className="text-[10px] text-rose-400/80 font-bold">Past Due Date</div>
        </Card>

        <Card className="rounded-2xl border-purple-500/30 bg-purple-500/5 p-4 space-y-1 shadow-sm">
          <div className="text-[11px] font-bold text-purple-400 uppercase">High Priority</div>
          <div className="text-2xl font-black font-mono text-purple-400">{metrics.highPriority}</div>
          <div className="text-[10px] text-muted-foreground">Urgent Action</div>
        </Card>
      </div>

      {/* Filter & View Switcher Bar */}
      <Card className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="pl-9 rounded-xl h-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-32 h-9 text-xs rounded-xl"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                <SelectItem value="Work">Work</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Fleet">Fleet</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-28 h-9 text-xs rounded-xl"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Priority</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-28 h-9 text-xs rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Switcher */}
            <div className="flex items-center p-1 bg-muted/60 rounded-xl border border-border/50">
              <Button
                size="sm"
                variant={viewMode === 'board' ? 'secondary' : 'ghost'}
                onClick={() => setViewMode('board')}
                className="h-7 px-2.5 rounded-lg text-xs font-bold"
              >
                <LayoutGrid className="w-3.5 h-3.5 mr-1" /> Board
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="h-7 px-2.5 rounded-lg text-xs font-bold"
              >
                <List className="w-3.5 h-3.5 mr-1" /> List
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* VIEW MODE 1: KANBAN BOARD */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {boardColumns.map(col => (
            <Card key={col.status} className={`rounded-3xl border ${col.color} bg-card/40 backdrop-blur-md p-4 shadow-sm flex flex-col h-[650px]`}>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/40">
                <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                  <span>{col.title}</span>
                  <Badge variant="outline" className="font-mono text-xs">{col.items.length}</Badge>
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {col.items.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-xs text-muted-foreground/60 border border-dashed border-border/60 rounded-2xl">
                    <span>No tasks in {col.title}</span>
                  </div>
                ) : (
                  col.items.map(task => {
                    const isOverdue = task.due_date && isBefore(new Date(task.due_date), new Date()) && !isToday(new Date(task.due_date)) && !task.is_completed;
                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`group bg-card border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 space-y-3 ${task.is_completed ? 'opacity-60 border-border/40 bg-muted/20' : isOverdue ? 'border-rose-500/40 bg-rose-500/5' : 'border-border/60 hover:border-primary/40'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 flex-1">
                            <Checkbox
                              checked={task.is_completed}
                              onCheckedChange={() => handleToggleComplete(task)}
                              className="mt-1"
                            />
                            <div className="space-y-1">
                              <h4 className={`text-sm font-extrabold transition-all ${task.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Badges & Date */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {task.priority && (
                            <Badge variant="outline" className={`text-[10px] ${PRIORITY_BADGES[task.priority] || ''}`}>
                              {task.priority}
                            </Badge>
                          )}
                          {task.category && (
                            <Badge variant="outline" className={`text-[10px] ${CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Other}`}>
                              {task.category}
                            </Badge>
                          )}
                          {task.due_date && (
                            <Badge variant="outline" className={`text-[10px] font-mono flex items-center gap-1 ${isOverdue ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-bold' : 'bg-muted/40 text-muted-foreground'}`}>
                              <Calendar className="w-3 h-3" />
                              {format(new Date(task.due_date), 'dd MMM')}
                            </Badge>
                          )}
                        </div>

                        {/* Quick Move Status Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/30 text-[11px]">
                          <div className="flex gap-1">
                            {col.status !== 'Pending' && (
                              <button type="button" onClick={() => handleMoveStatus(task, 'Pending')} className="text-[10px] text-muted-foreground hover:text-blue-400 font-semibold underline">
                                Move to Pending
                              </button>
                            )}
                            {col.status !== 'In Progress' && !task.is_completed && (
                              <button type="button" onClick={() => handleMoveStatus(task, 'In Progress')} className="text-[10px] text-amber-400 hover:underline font-semibold ml-2">
                                Start Progress →
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleEditTask(task)} className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteTask(task.id)} className="h-6 w-6 p-0 text-muted-foreground hover:text-rose-400">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* VIEW MODE 2: LIST VIEW */}
      {viewMode === 'list' && (
        <Card className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-md">
          <CardContent className="p-4 space-y-2">
            {filteredTodos.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-semibold">No tasks found matching your filters</p>
                <Button variant="link" onClick={handleAddTask} className="mt-2 text-xs font-bold text-primary">Create a task</Button>
              </div>
            ) : (
              filteredTodos.map(task => {
                const isOverdue = task.due_date && isBefore(new Date(task.due_date), new Date()) && !isToday(new Date(task.due_date)) && !task.is_completed;
                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${task.is_completed ? 'opacity-50 bg-muted/20 border-border/40' : isOverdue ? 'border-rose-500/40 bg-rose-500/5' : 'border-border/60 bg-card hover:border-primary/40'}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Checkbox
                        checked={task.is_completed}
                        onCheckedChange={() => handleToggleComplete(task)}
                      />
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-bold ${task.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.title}
                          </span>
                          {task.priority && (
                            <Badge variant="outline" className={`text-[10px] ${PRIORITY_BADGES[task.priority]}`}>
                              {task.priority}
                            </Badge>
                          )}
                          {task.category && (
                            <Badge variant="outline" className={`text-[10px] ${CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Other}`}>
                              {task.category}
                            </Badge>
                          )}
                          {isOverdue && (
                            <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-400 font-bold border-rose-500/30">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-xl">{task.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {task.due_date && (
                        <div className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {format(new Date(task.due_date), 'dd MMM yyyy')}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEditTask(task)} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteTask(task.id)} className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      )}

      {/* Add / Edit Task Modal */}
      <TodoTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        task={editingTask}
        onSuccess={retry} 
      />
    </div>
  );
};

export default TodoListPage;