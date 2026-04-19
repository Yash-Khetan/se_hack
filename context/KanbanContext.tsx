import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext';

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface KanbanTask {
  id: string;
  title: string;
  status: TaskStatus;
  assigneeId?: string;
  assigneeName?: string;
  roomId?: string; // If imported from a room
  createdAt: number;
}

interface KanbanContextType {
  tasks: KanbanTask[];
  addTask: (title: string, status?: TaskStatus) => void;
  updateTask: (updatedTask: KanbanTask) => void;
  deleteTask: (taskId: string) => void;
  importTasks: (newTasks: KanbanTask[]) => void;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);
const STORAGE_KEY = '@lumina_kanban_tasks';

export function KanbanProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const { profile } = useUser();
  
  // Hackathon shortcut: using email as unique ID
  const userId = profile?.email || 'user-miti-001';
  const SERVER_URL = 'http://10.10.72.244:3005';

  useEffect(() => {
    loadTasks();
  }, [userId]);

  const loadTasks = async () => {
    try {
      // Opt 1: Load from server
      const res = await fetch(`${SERVER_URL}/api/kanban/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
        // Cache locally
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data.tasks || []));
        return;
      }
    } catch (e) {
      console.warn('Backend fetch failed, falling back to local storage', e);
    }
    
    // Opt 2: Fallback local cache
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setTasks(JSON.parse(stored));
    } catch (e) {
      console.warn('Failed to load Kanban tasks', e);
    }
  };

  const saveTasks = async (newTasks: KanbanTask[]) => {
    setTasks(newTasks);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
      // Background sync to SQL
      await fetch(`${SERVER_URL}/api/kanban/${userId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: newTasks }),
      });
    } catch (e) {
      console.warn('Failed to save Kanban tasks to server', e);
    }
  };

  const addTask = (title: string, status: TaskStatus = 'todo') => {
    if (!title.trim()) return;
    const newTask: KanbanTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: title.trim(),
      status,
      createdAt: Date.now(),
    };
    saveTasks([newTask, ...tasks]);
  };

  const updateTask = (updatedTask: KanbanTask) => {
    const updated = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    saveTasks(updated);
  };

  const deleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    saveTasks(updated);
  };

  const importTasks = (newTasks: KanbanTask[]) => {
    // Only import tasks that are not already present (based on ID)
    const existingIds = new Set(tasks.map(t => t.id));
    const toImport = newTasks.filter(t => !existingIds.has(t.id));
    
    if (toImport.length > 0) {
      saveTasks([...toImport, ...tasks]);
    }
  };

  return (
    <KanbanContext.Provider value={{ tasks, addTask, updateTask, deleteTask, importTasks }}>
      {children}
    </KanbanContext.Provider>
  );
}

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (context === undefined) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
};
