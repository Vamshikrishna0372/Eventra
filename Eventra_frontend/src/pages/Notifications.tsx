import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Bell, Info, Check, Loader2, Calendar, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { formatRelative } from "@/lib/utils";

const Notifications = () => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    if (user?.id) {
      try {
        const response = await api.get(`/notifications/user/${user.id}`, token || undefined);
        if (response.success) {
          setNotifications(response.data);
        }
      } catch (error) {
        console.error("Notifs fetch error", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [user?.id, token]);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/read/${id}`, {}, token || undefined);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readStatus: true } : n));
      toast.success("Notification marked as read");
    } catch (error) {
       toast.error("Failed to update notification");
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.readStatus).map(n => n.id);
    if (unreadIds.length === 0) return;
    
    try {
      await Promise.all(unreadIds.map(id => api.put(`/notifications/read/${id}`, {}, token || undefined)));
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to update all notifications");
    }
  };

  return (
    <DashboardLayout role={user?.role || "student"}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">Stay updated with the latest event activities.</p>
        </div>
        {notifications.some(n => !n.readStatus) && (
          <button 
            onClick={markAllAsRead}
            className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Mark all as read
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground animate-pulse font-medium">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-surface"
          >
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <Bell className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No notifications yet</h2>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              We'll notify you when there's an update on your registrations, new events matching your interests, or campus announcements.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {notifications.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`group p-5 rounded-2xl border transition-all hover:shadow-md flex gap-5 ${
                  !n.readStatus 
                    ? "bg-primary/5 border-primary/20 hover:border-primary/30" 
                    : "bg-card border-border hover:border-border-hover shadow-sm"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  !n.readStatus ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}>
                  <Bell className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest ${
                      !n.readStatus ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {n.type || 'Announcement'}
                    </span>
<span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {formatRelative(n.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm sm:text-base leading-relaxed ${!n.readStatus ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                    {n.message}
                  </p>
                  {!n.readStatus && (
                    <button 
                      onClick={() => markAsRead(n.id)}
                      className="mt-3 text-xs font-bold text-primary hover:underline flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark as read
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Notifications;
