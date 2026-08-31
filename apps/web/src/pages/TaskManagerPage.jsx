import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { 
  CheckSquare, Plus, Search, Filter, MessageSquare, Send, Phone, User, 
  Calendar, Clock, AlertTriangle, CheckCircle2, ChevronRight, Share2, 
  Sparkles, RefreshCw, Hash, Users, ShieldAlert, ArrowUpRight, Check, 
  Flame, Flag, MoreHorizontal, Trash2, Edit3, Paperclip, Smile, Bot
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { cn } from '@/lib/utils.js';

const TASK_CATEGORIES = [
  'Dispatch & Trips',
  'Maintenance & Workshop',
  'Billing & Accounts',
  'RTO & FASTag Compliance',
  'Customer Support & Quotes',
  'Driver Management',
  'General Operations'
];

const TASK_PRIORITIES = [
  { id: 'Critical', label: '🔥 Critical / Urgent', badge: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { id: 'High',     label: '⚡ High Priority',      badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'Medium',   label: '🔷 Medium Priority',    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'Low',      label: '☕ Low Priority',       badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
];

const TASK_STATUSES = [
  { id: 'To Do',       label: 'To Do',       badge: 'bg-slate-800 text-slate-300 border-slate-700' },
  { id: 'In Progress', label: 'In Progress', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'In Review',   label: 'In Review',   badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'Completed',   label: 'Completed ✓', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
];

const CHAT_CHANNELS = [
  { id: 'general-ops',    name: 'general-ops',    desc: 'Company-wide fleet operations & updates', icon: Hash },
  { id: 'dispatch-alerts',name: 'dispatch-alerts',desc: 'Live trip assignment & route status',    icon: Hash },
  { id: 'workshop-maint', name: 'workshop-maint', desc: 'Tyres, repairs & breakdown reports',     icon: Hash },
  { id: 'finance-billing',name: 'finance-billing',desc: 'POD collection, advance & billing',      icon: Hash },
  { id: 'urgent-alerts',  name: 'urgent-alerts',  desc: '🚨 Critical roadside & safety notices', icon: ShieldAlert },
];

export default function TaskManagerPage({ initialTab = 'tasks' }) {
  const { currentUser } = useAuth();
  const [activeMainTab, setActiveMainTab] = useState(initialTab);

  // ---------------- TASK STATE ----------------
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [taskSearch, setTaskSearch] = useState('');
  const [filterStaff, setFilterStaff] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [taskViewMode, setTaskViewMode] = useState('kanban'); // 'kanban' | 'list'

  // Staff Members List
  const [staffList, setStaffList] = useState([]);

  // Create / Edit Task Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assigned_to_name: '',
    assigned_to_phone: '',
    priority: 'High',
    category: 'Dispatch & Trips',
    status: 'To Do',
    due_date: format(new Date(), 'yyyy-MM-dd')
  });

  // ---------------- CHAT STATE ----------------
  const [activeChannel, setActiveChannel] = useState('general-ops');
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [msgPriorityTag, setMsgPriorityTag] = useState('normal'); // 'normal' | 'urgent' | 'announcement'
  const messagesEndRef = useRef(null);

  // Fetch Staff List
  useEffect(() => {
    const loadStaff = async () => {
      let users = [];
      try {
        users = await pb.collection('users').getFullList({ sort: 'name', $autoCancel: false });
      } catch (e) {}

      if (!users || users.length === 0) {
        // Fallback team list
        users = [
          { id: 'u1', name: 'Vinod Kumar Rathod', email: 'vinod@jaibhavanicargo.com', phone: '7794072244', role: 'Super Admin' },
          { id: 'u2', name: 'Ravi Kumar', email: 'ravi.dispatch@jaibhavanicargo.com', phone: '9848012345', role: 'Dispatcher' },
          { id: 'u3', name: 'Suresh Patil', email: 'suresh.maint@jaibhavanicargo.com', phone: '9848054321', role: 'Maintenance Supervisor' },
          { id: 'u4', name: 'Anil Sharma', email: 'anil.accounts@jaibhavanicargo.com', phone: '9848098765', role: 'Accounts Executive' },
          { id: 'u5', name: 'Ramesh Yadav', email: 'ramesh.driver@jaibhavanicargo.com', phone: '9123456789', role: 'Senior Driver' }
        ];
      }
      setStaffList(users);
    };
    loadStaff();
  }, []);

  // Fetch Tasks
  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      let remoteTodos = [];
      try {
        remoteTodos = await pb.collection('todos').getFullList({ sort: '-created', $autoCancel: false });
      } catch (e) {}

      let localTasks = [];
      try {
        localTasks = JSON.parse(localStorage.getItem('jbc_staff_tasks') || '[]');
      } catch (e) {}

      // Combine tasks
      const map = new Map();
      (remoteTodos || []).forEach(t => map.set(t.id, {
        id: t.id,
        title: t.title,
        description: t.description || '',
        assigned_to_name: t.assigned_to_name || t.assigned_to || 'General Team',
        assigned_to_phone: t.assigned_to_phone || '',
        priority: t.priority || 'Medium',
        category: t.category || 'General Operations',
        status: t.status === 'Completed' || t.completed ? 'Completed' : (t.status || 'To Do'),
        due_date: t.due_date ? t.due_date.split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
        created: t.created || new Date().toISOString()
      }));

      (localTasks || []).forEach(t => {
        if (!map.has(t.id)) map.set(t.id, t);
      });

      if (map.size === 0) {
        // Initial mock tasks
        const initialMock = [
          {
            id: 'task_01',
            title: 'Verify Fastag recharge for 5 North-bound container trucks',
            description: 'Ensure min ₹5,000 balance per vehicle before crossing toll plazas.',
            assigned_to_name: 'Ravi Kumar',
            assigned_to_phone: '9848012345',
            priority: 'High',
            category: 'RTO & FASTag Compliance',
            status: 'To Do',
            due_date: format(new Date(), 'yyyy-MM-dd'),
            created: new Date().toISOString()
          },
          {
            id: 'task_02',
            title: 'Arrange emergency tyre replacement for Truck MH12-AB-1234',
            description: 'Coordinate with Nagpur Tyre Shop for 295/80R22.5 tubeless radial tyre.',
            assigned_to_name: 'Suresh Patil',
            assigned_to_phone: '9848054321',
            priority: 'Critical',
            category: 'Maintenance & Workshop',
            status: 'In Progress',
            due_date: format(new Date(), 'yyyy-MM-dd'),
            created: new Date().toISOString()
          },
          {
            id: 'task_03',
            title: 'Collect original signed POD from Reliance Bhiwandi Hub',
            description: 'Invoice ₹4,20,000 pending submission upon POD upload.',
            assigned_to_name: 'Anil Sharma',
            assigned_to_phone: '9848098765',
            priority: 'High',
            category: 'Billing & Accounts',
            status: 'In Review',
            due_date: format(new Date(), 'yyyy-MM-dd'),
            created: new Date().toISOString()
          }
        ];
        initialMock.forEach(m => map.set(m.id, m));
        localStorage.setItem('jbc_staff_tasks', JSON.stringify(initialMock));
      }

      setTasks(Array.from(map.values()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Fetch / Sync Chat Messages
  const fetchMessages = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(`jbc_chat_${activeChannel}`) || '[]');
      if (stored.length === 0) {
        // Initial channel welcome message
        const welcome = [{
          id: 'msg_init',
          sender_name: 'System Fleet Dispatcher',
          sender_role: 'Operations Bot',
          channel: activeChannel,
          text: `👋 Welcome to #${activeChannel}. Use this channel for live operational updates, coordination, and urgent fleet notices.`,
          priority: 'announcement',
          timestamp: new Date().toISOString()
        }];
        setMessages(welcome);
        localStorage.setItem(`jbc_chat_${activeChannel}`, JSON.stringify(welcome));
      } else {
        setMessages(stored);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Save Task
  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return toast.error('Task title is required');

    const newTaskObj = {
      id: editingTask ? editingTask.id : `task_${Date.now()}`,
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      assigned_to_name: taskForm.assigned_to_name || 'General Team',
      assigned_to_phone: taskForm.assigned_to_phone || '',
      priority: taskForm.priority,
      category: taskForm.category,
      status: taskForm.status,
      due_date: taskForm.due_date,
      created: editingTask ? editingTask.created : new Date().toISOString()
    };

    // Save to local storage
    const local = JSON.parse(localStorage.getItem('jbc_staff_tasks') || '[]');
    const updatedLocal = editingTask 
      ? local.map(t => t.id === editingTask.id ? newTaskObj : t)
      : [newTaskObj, ...local];
    localStorage.setItem('jbc_staff_tasks', JSON.stringify(updatedLocal));

    // Try PocketBase
    try {
      if (editingTask && !editingTask.id.startsWith('task_')) {
        await pb.collection('todos').update(editingTask.id, {
          title: newTaskObj.title,
          description: newTaskObj.description,
          priority: newTaskObj.priority,
          category: newTaskObj.category,
          status: newTaskObj.status,
          due_date: newTaskObj.due_date
        }, { $autoCancel: false });
      } else if (!editingTask) {
        await pb.collection('todos').create({
          title: newTaskObj.title,
          description: newTaskObj.description,
          priority: newTaskObj.priority,
          category: newTaskObj.category,
          status: newTaskObj.status,
          user_id: currentUser?.id,
          created_by: currentUser?.id
        }, { $autoCancel: false }).catch(() => {});
      }
    } catch (e) {}

    setIsTaskModalOpen(false);
    setEditingTask(null);
    toast.success(editingTask ? 'Task updated' : 'New task assigned successfully');
    fetchTasks();
  };

  // Update Task Status
  const handleUpdateStatus = (taskId, newStatus) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) return { ...t, status: newStatus };
      return t;
    });
    setTasks(updated);
    localStorage.setItem('jbc_staff_tasks', JSON.stringify(updated));
    toast.success(`Task marked as "${newStatus}"`);

    // Background PocketBase sync
    if (!taskId.startsWith('task_')) {
      pb.collection('todos').update(taskId, { status: newStatus }, { $autoCancel: false }).catch(() => {});
    }
  };

  // WhatsApp Task Dispatch
  const sendWhatsAppTask = (task) => {
    const phoneClean = (task.assigned_to_phone || '').replace(/\D/g, '');
    const msg = `📌 *JAI BHAVANI CARGO - TASK ASSIGNMENT*\n\n📋 *Task:* ${task.title}\n📂 *Category:* ${task.category}\n⚠️ *Priority:* ${task.priority}\n📅 *Due Date:* ${task.due_date}\n\n📝 *Instructions:* ${task.description || 'Please complete and update status.'}\n\nPlease reply with *DONE* when finished.`;
    
    let url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    if (phoneClean && (phoneClean.length === 10 || phoneClean.length === 12)) {
      const target = phoneClean.length === 10 ? `91${phoneClean}` : phoneClean;
      url = `https://wa.me/${target}?text=${encodeURIComponent(msg)}`;
    }
    window.open(url, '_blank');
  };

  // Send Chat Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender_name: currentUser?.name || currentUser?.full_name || 'Dispatcher',
      sender_role: currentUser?.role || 'Staff',
      channel: activeChannel,
      text: newMessageText.trim(),
      priority: msgPriorityTag,
      timestamp: new Date().toISOString()
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem(`jbc_chat_${activeChannel}`, JSON.stringify(updated));
    setNewMessageText('');
    setMsgPriorityTag('normal');
  };

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const q = taskSearch.toLowerCase();
      const matchSearch = !q || 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) || 
        t.assigned_to_name.toLowerCase().includes(q);

      const matchStaff = filterStaff === 'all' || t.assigned_to_name === filterStaff;
      const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
      const matchCategory = filterCategory === 'all' || t.category === filterCategory;

      return matchSearch && matchStaff && matchPriority && matchCategory;
    });
  }, [tasks, taskSearch, filterStaff, filterPriority, filterCategory]);

  const taskCounts = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter(t => t.status === 'To Do').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    return { total, todo, inProgress, completed };
  }, [tasks]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      <Helmet>
        <title>Staff Tasks & Team Operations Chat | Jai Bhavani Cargo</title>
      </Helmet>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-2.5">
            <CheckSquare className="w-8 h-8 text-primary" /> Tasks & Team Operations Hub
          </h1>
          <p className="text-muted-foreground text-sm">
            Assign operations tasks to fleet managers, dispatchers, mechanics, and coordinate live via operations team chat.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button 
            onClick={() => {
              setEditingTask(null);
              setTaskForm({
                title: '',
                description: '',
                assigned_to_name: staffList[0]?.name || '',
                assigned_to_phone: staffList[0]?.phone || '',
                priority: 'High',
                category: 'Dispatch & Trips',
                status: 'To Do',
                due_date: format(new Date(), 'yyyy-MM-dd')
              });
              setIsTaskModalOpen(true);
            }}
            className="rounded-xl font-bold text-xs gap-1.5 shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Create & Assign Task
          </Button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full space-y-6">
        <TabsList className="bg-muted/50 p-1 w-full sm:w-auto inline-flex h-12">
          <TabsTrigger value="tasks" className="flex-1 sm:px-8 flex items-center gap-2 data-[state=active]:bg-background">
            <CheckSquare className="w-4 h-4" /> Task Management ({taskCounts.todo + taskCounts.inProgress})
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex-1 sm:px-8 flex items-center gap-2 data-[state=active]:bg-background">
            <MessageSquare className="w-4 h-4" /> Operations Team Chat
          </TabsTrigger>
        </TabsList>

        {/* ---------------- TAB 1: TASK MANAGEMENT ---------------- */}
        <TabsContent value="tasks" className="space-y-6 m-0 outline-none">
          
          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="bg-card/60 border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase">Total Tasks</p>
                  <p className="text-2xl font-black mt-0.5">{taskCounts.total}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <CheckSquare className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/60 border-slate-700 bg-slate-800/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-300 font-bold uppercase">To Do / Pending</p>
                  <p className="text-2xl font-black text-slate-200 mt-0.5">{taskCounts.todo}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center text-slate-300">
                  <Clock className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/60 border-blue-500/30 bg-blue-500/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-400 font-bold uppercase">In Progress</p>
                  <p className="text-2xl font-black text-blue-400 mt-0.5">{taskCounts.inProgress}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/60 border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-400 font-bold uppercase">Completed</p>
                  <p className="text-2xl font-black text-emerald-400 mt-0.5">{taskCounts.completed}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card/60 p-4 rounded-2xl border border-border">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search tasks, staff, descriptions..."
                value={taskSearch}
                onChange={e => setTaskSearch(e.target.value)}
                className="pl-9 bg-background text-xs h-9 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
              <Select value={filterStaff} onValueChange={setFilterStaff}>
                <SelectTrigger className="w-[150px] bg-background text-xs h-9 rounded-xl">
                  <SelectValue placeholder="Assigned Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff Members</SelectItem>
                  {staffList.map(s => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[140px] bg-background text-xs h-9 rounded-xl">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {TASK_PRIORITIES.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[160px] bg-background text-xs h-9 rounded-xl">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {TASK_CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Kanban Board Columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {TASK_STATUSES.map(statusCol => {
              const colTasks = filteredTasks.filter(t => t.status === statusCol.id);

              return (
                <div key={statusCol.id} className="bg-muted/20 border border-border/80 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <span className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      {statusCol.label}
                    </span>
                    <Badge variant="outline" className="text-xs font-bold px-2 py-0.5 bg-background">
                      {colTasks.length}
                    </Badge>
                  </div>

                  <div className="space-y-3 min-h-[300px]">
                    {colTasks.length === 0 ? (
                      <div className="text-center py-12 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                        No tasks in {statusCol.label}
                      </div>
                    ) : (
                      colTasks.map(task => {
                        const priorityObj = TASK_PRIORITIES.find(p => p.id === task.priority) || TASK_PRIORITIES[2];

                        return (
                          <Card key={task.id} className="bg-card border-border hover:border-primary/50 shadow-sm transition-all duration-200">
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5", priorityObj.badge)}>
                                  {priorityObj.label}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  {task.due_date}
                                </span>
                              </div>

                              <div>
                                <h4 className="font-bold text-xs text-foreground leading-snug">{task.title}</h4>
                                {task.description && (
                                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                                )}
                              </div>

                              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px]">
                                  <User className="w-3.5 h-3.5 text-primary" />
                                  <span className="truncate max-w-[110px]">{task.assigned_to_name}</span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <Button 
                                    size="sm"
                                    variant="outline"
                                    onClick={() => sendWhatsAppTask(task)}
                                    className="h-6 px-1.5 text-[10px] rounded-lg border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                                    title="Send task to WhatsApp"
                                  >
                                    <Share2 className="w-3 h-3" />
                                  </Button>

                                  {task.status !== 'Completed' ? (
                                    <Button
                                      size="sm"
                                      onClick={() => handleUpdateStatus(task.id, 'Completed')}
                                      className="h-6 px-2 text-[10px] rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                                    >
                                      <Check className="w-3 h-3 mr-0.5" /> Done
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleUpdateStatus(task.id, 'In Progress')}
                                      className="h-6 px-2 text-[10px] text-muted-foreground"
                                    >
                                      Reopen
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ---------------- TAB 2: OPERATIONS TEAM CHAT ---------------- */}
        <TabsContent value="chat" className="m-0 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-card border border-border rounded-2xl overflow-hidden shadow-lg min-h-[600px]">
            
            {/* Left Channels Sidebar */}
            <div className="bg-muted/20 border-r border-border p-4 space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Operations Channels
                </h3>
                <div className="space-y-1">
                  {CHAT_CHANNELS.map(ch => {
                    const Icon = ch.icon;
                    const isActive = activeChannel === ch.id;

                    return (
                      <button
                        key={ch.id}
                        onClick={() => setActiveChannel(ch.id)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left",
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-sm" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <div className="truncate">
                          <p className="font-semibold">{ch.name}</p>
                          <p className={cn("text-[10px] truncate font-normal", isActive ? "text-primary-foreground/80" : "text-muted-foreground")}>{ch.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Team Members Online
                </h3>
                <div className="space-y-2">
                  {staffList.map(st => (
                    <div key={st.id} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-background/50 border border-border/40">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-semibold text-foreground text-[11px] truncate max-w-[120px]">{st.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{st.role || 'Staff'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Chat Message Area */}
            <div className="md:col-span-3 flex flex-col justify-between bg-card p-4 sm:p-6 space-y-4">
              
              {/* Channel Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <Hash className="w-4 h-4 text-primary" /> #{activeChannel}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {CHAT_CHANNELS.find(c => c.id === activeChannel)?.desc}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold">
                  🟢 Live Operations
                </Badge>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto space-y-4 max-h-[420px] pr-2 scrollbar-thin">
                {messages.map(msg => {
                  const isMe = (currentUser?.name || '').toLowerCase() === (msg.sender_name || '').toLowerCase();

                  return (
                    <div key={msg.id} className={cn("flex flex-col space-y-1", isMe ? "items-end" : "items-start")}>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="font-bold text-foreground">{msg.sender_name}</span>
                        {msg.sender_role && (
                          <span className="px-1.5 py-0.2 rounded bg-muted text-[10px]">{msg.sender_role}</span>
                        )}
                        <span>{msg.timestamp ? format(new Date(msg.timestamp), 'hh:mm a') : 'Now'}</span>
                      </div>

                      <div className={cn(
                        "px-4 py-2.5 rounded-2xl text-xs max-w-[85%] shadow-sm",
                        msg.priority === 'urgent' ? "bg-red-500/20 text-red-200 border border-red-500/40" :
                        msg.priority === 'announcement' ? "bg-amber-500/20 text-amber-200 border border-amber-500/40" :
                        isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted/60 text-foreground rounded-tl-none border border-border"
                      )}>
                        {msg.priority === 'urgent' && <span className="block font-bold text-red-400 text-[10px] mb-1 uppercase tracking-wider">🚨 URGENT FLEET NOTICE</span>}
                        {msg.priority === 'announcement' && <span className="block font-bold text-amber-400 text-[10px] mb-1 uppercase tracking-wider">📢 FLEET ANNOUNCEMENT</span>}
                        <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-border space-y-2">
                <div className="flex items-center gap-2">
                  <Select value={msgPriorityTag} onValueChange={setMsgPriorityTag}>
                    <SelectTrigger className="w-[140px] bg-background text-xs h-8 rounded-xl border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal Message</SelectItem>
                      <SelectItem value="urgent">🚨 Urgent Notice</SelectItem>
                      <SelectItem value="announcement">📢 Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Input 
                    value={newMessageText}
                    onChange={e => setNewMessageText(e.target.value)}
                    placeholder={`Message #${activeChannel}...`}
                    className="bg-background text-xs rounded-xl h-10 flex-1"
                  />
                  <Button type="submit" className="rounded-xl h-10 px-4 font-bold text-xs gap-1.5 shadow-md">
                    <Send className="w-3.5 h-3.5" /> Send
                  </Button>
                </div>
              </form>

            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create / Edit Task Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Assign New Task to Staff'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveTask} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Task Title *</Label>
              <Input 
                value={taskForm.title}
                onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="e.g. Inspect fastag balance for vehicle RJ14-GB-9999"
                className="bg-background text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Assign to Staff Member *</Label>
              <Select 
                value={taskForm.assigned_to_name} 
                onValueChange={v => {
                  const staffObj = staffList.find(s => s.name === v);
                  setTaskForm({ 
                    ...taskForm, 
                    assigned_to_name: v, 
                    assigned_to_phone: staffObj?.phone || '' 
                  });
                }}
              >
                <SelectTrigger className="bg-background text-xs">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map(s => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name} ({s.role || 'Staff'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Priority</Label>
                <Select value={taskForm.priority} onValueChange={v => setTaskForm({ ...taskForm, priority: v })}>
                  <SelectTrigger className="bg-background text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Category</Label>
                <Select value={taskForm.category} onValueChange={v => setTaskForm({ ...taskForm, category: v })}>
                  <SelectTrigger className="bg-background text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Due Date</Label>
                <Input 
                  type="date"
                  value={taskForm.due_date}
                  onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })}
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Initial Status</Label>
                <Select value={taskForm.status} onValueChange={v => setTaskForm({ ...taskForm, status: v })}>
                  <SelectTrigger className="bg-background text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Task Instructions / Notes</Label>
              <Textarea 
                value={taskForm.description}
                onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Enter specific instructions, route details, vehicle number, or invoice details..."
                className="bg-background text-xs min-h-[70px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsTaskModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="font-bold">
                Save & Assign Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
