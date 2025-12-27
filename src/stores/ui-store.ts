import { create } from 'zustand'
import { trackEvent } from '../lib/posthog'

interface UIState {
  // Sidebar
  sidebarOpen: boolean
  sidebarMobileOpen: boolean

  // Modals
  weeklyOutlookOpen: boolean

  // Actions
  setSidebarOpen: (open: boolean) => void
  setSidebarMobileOpen: (open: boolean) => void
  toggleSidebar: () => void

  setWeeklyOutlookOpen: (open: boolean) => void
  openWeeklyOutlook: () => void
  closeWeeklyOutlook: () => void
}

export const useUIStore = create<UIState>()((set) => ({
  // Defaults
  sidebarOpen: true,
  sidebarMobileOpen: false,
  weeklyOutlookOpen: false,

  // Sidebar actions
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSidebarMobileOpen: (sidebarMobileOpen) => set({ sidebarMobileOpen }),
  toggleSidebar: () =>
    set((s) => ({
      sidebarOpen: !s.sidebarOpen,
    })),

  // Modal actions
  setWeeklyOutlookOpen: (weeklyOutlookOpen) => set({ weeklyOutlookOpen }),
  openWeeklyOutlook: () => {
    trackEvent('weekly_outlook_opened', {})
    set({ weeklyOutlookOpen: true })
  },
  closeWeeklyOutlook: () => set({ weeklyOutlookOpen: false }),
}))

// Selector hooks
export const useSidebarOpen = () => useUIStore((s) => s.sidebarOpen)
export const useSidebarMobileOpen = () => useUIStore((s) => s.sidebarMobileOpen)
export const useWeeklyOutlookOpen = () => useUIStore((s) => s.weeklyOutlookOpen)
