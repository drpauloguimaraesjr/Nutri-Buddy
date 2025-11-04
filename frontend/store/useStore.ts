import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Selected date for data views
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;

  // Water intake today
  waterIntakeToday: number;
  addWater: (amount: number) => void;
  resetWater: () => void;

  // Fasting
  fastingActive: boolean;
  fastingStartTime: Date | null;
  startFasting: () => void;
  stopFasting: () => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'light',
      setTheme: (theme) => set({ theme }),

      // Sidebar
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Selected date
      selectedDate: new Date(),
      setSelectedDate: (date) => set({ selectedDate: date }),

      // Water
      waterIntakeToday: 0,
      addWater: (amount) =>
        set((state) => ({ waterIntakeToday: state.waterIntakeToday + amount })),
      resetWater: () => set({ waterIntakeToday: 0 }),

      // Fasting
      fastingActive: false,
      fastingStartTime: null,
      startFasting: () =>
        set({ fastingActive: true, fastingStartTime: new Date() }),
      stopFasting: () =>
        set({ fastingActive: false, fastingStartTime: null }),

      // Notifications
      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: Date.now().toString(),
            },
          ],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
    }),
    {
      name: 'nutribuddy-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

