import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { CheckSquare, Plus, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { usePageData } from '@/hooks/usePageData.js';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import TodoTaskModal from '@/components/TodoTaskModal.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const TodoListPage = () => {
  const { data: todos, loading, error, retry } = usePageData('todos', { sort: '-created' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

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
      const newStatus = task.is_completed ? 'Pending' : 'Completed';
      await pb.collection('todos').update(task.id, { 
        is_completed: !task.is_completed,
        status: newStatus
      }, { $autoCancel: false });
      retry();
    } catch (err) {
      console.error('Failed to toggle task status:', err);
      toast.error('Failed to update task status');
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

  if (loading) return <LoadingSpinner text="Loading tasks..." />;

  if (error) {
    return (
      <div className="p-12 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Failed to load tasks</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={retry}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>To-Do List | Dashboard</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">To-Do List</h1>
          <p className="text-muted-foreground mt-1">Manage your daily tasks and assignments.</p>
        </div>
        <Button onClick={handleAddTask} className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </Button>
      </div>

      <Card className="shadow-sm border-border">
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {todos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>All caught up! No tasks found.</p>
              <Button variant="link" onClick={handleAddTask} className="mt-2">Create your first task</Button>
            </div>
          ) : (
            todos.map((todo) => (
              <div key={todo.id} className="flex items-start space-x-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors group">
                <Checkbox 
                  id={`todo-${todo.id}`} 
                  checked={todo.is_completed} 
                  onCheckedChange={() => handleToggleComplete(todo)}
                  className="mt-1" 
                />
                <div className="flex-1">
                  <label 
                    htmlFor={`todo-${todo.id}`} 
                    className={`text-base font-medium cursor-pointer transition-all ${todo.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                  >
                    {todo.title}
                  </label>
                  {todo.description && (
                    <p className={`text-sm mt-1 ${todo.is_completed ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                      {todo.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    {todo.priority && (
                      <Badge variant={todo.priority === 'High' ? 'destructive' : 'secondary'} className="text-xs font-medium">
                        {todo.priority}
                      </Badge>
                    )}
                    {todo.category && (
                      <Badge variant="outline" className="text-xs font-medium bg-background">{todo.category}</Badge>
                    )}
                    {todo.status && !todo.is_completed && (
                      <Badge variant="outline" className="text-xs font-medium bg-background text-muted-foreground border-dashed">
                        {todo.status}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => handleEditTask(todo)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(todo.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

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