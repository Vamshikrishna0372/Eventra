import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CalendarPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const categories = ["Technical", "Cultural", "Sports", "Workshops", "Placement", "Seminars"];

const CreateEvent = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", 
    description: "", 
    date: "", 
    time: "", 
    venue: "", 
    category: "Technical", 
    maxParticipants: "",
    imageUrl: "",
    isFeatured: false,
    organizerName: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post("/events", {
        ...form,
        maxParticipants: parseInt(form.maxParticipants),
        organizerName: user?.name || "Campus Organizer",
        isFeatured: form.isFeatured
      }, token || undefined);
      
      if (response.success) {
        toast.success("Event created successfully!", { 
          description: `"${form.title}" is now live on the platform.` 
        });
        navigate("/admin/manage");
      } else {
        toast.error(response.message || "Failed to create event");
      }
    } catch (error) {
      toast.error("An error occurred while creating the event");
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const inputCls = "w-full px-4 py-3 bg-background border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all shadow-sm";

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Create Event</h1>
        <p className="text-sm text-muted-foreground mt-1">Set up a new campus event for students.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
        <div className="bg-card rounded-xl shadow-surface p-8">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-card-foreground">Event Details</h2>
              <p className="text-xs text-muted-foreground">Fill in the information below to create your event</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Event Title *</label>
              <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g., AI & Machine Learning Summit" className={inputCls} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Description *</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe the event, what attendees can expect..." rows={4} className={`${inputCls} resize-none`} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Event Image URL</label>
              <input type="url" value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="https://example.com/image.jpg" className={inputCls} />
              <p className="text-[10px] text-muted-foreground mt-1">Provide an online link for the event thumbnail.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Date *</label>
                <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className={inputCls} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Time *</label>
                <input type="time" value={form.time} onChange={(e) => update("time", e.target.value)} className={inputCls} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Venue *</label>
              <input type="text" value={form.venue} onChange={(e) => update("venue", e.target.value)} placeholder="e.g., Auditorium A, Main Campus" className={inputCls} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Category *</label>
                <select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputCls}>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Max Participants *</label>
                <input type="number" value={form.maxParticipants} onChange={(e) => update("maxParticipants", e.target.value)} placeholder="e.g., 100" className={inputCls} required min="1" />
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <input 
                type="checkbox" 
                id="isFeatured" 
                checked={form.isFeatured} 
                onChange={(e) => setForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                className="w-5 h-5 rounded border-input text-primary focus:ring-primary/20"
              />
              <label htmlFor="isFeatured" className="text-sm font-bold text-foreground cursor-pointer">
                Mark as Featured Event
                <span className="block text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Will be highlighted on the main dashboard banner</span>
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <CalendarPlus className="w-4 h-4" />
                    Create Event
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default CreateEvent;
