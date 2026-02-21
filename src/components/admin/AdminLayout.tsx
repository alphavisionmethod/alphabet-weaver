import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Workflow, Palette, Shield, Users, ScrollText,
  LogOut, ChevronLeft, ChevronRight, Menu
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import sitaLogo from '@/assets/sita-s-logo.jpeg';
import ThemeToggle from '@/components/ThemeToggle';

const NAV_ITEMS = [
  { path: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { path: '/admin/workflows', icon: Workflow, label: 'Workflows' },
  { path: '/admin/brand', icon: Palette, label: 'Brand' },
  { path: '/admin/investor', icon: Shield, label: 'Investor Access' },
  { path: '/admin/team', icon: Users, label: 'Team & Roles' },
  { path: '/admin/audit', icon: ScrollText, label: 'Audit Log' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) setAdminEmail(session.user.email);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out');
    navigate('/admin/login');
  };

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2 }}
        className="fixed top-0 left-0 h-screen z-50 flex flex-col border-r border-border/30 bg-card/80 backdrop-blur-xl"
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-border/20">
          <img src={sitaLogo} alt="SITA" className="w-8 h-8 rounded-lg shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="ml-3 font-bold text-foreground text-sm whitespace-nowrap overflow-hidden"
              >
                SITA Admin
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.path, item.end);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-border/20 p-3 space-y-2">
          {!collapsed && adminEmail && (
            <p className="text-[10px] text-muted-foreground truncate px-1">{adminEmail}</p>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all flex-1"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              {!collapsed && <span>Sign out</span>}
            </button>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div
        className="flex-1 transition-all duration-200"
        style={{ marginLeft: collapsed ? 64 : 240 }}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-6 border-b border-border/20 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors lg:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
          <ThemeToggle />
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
