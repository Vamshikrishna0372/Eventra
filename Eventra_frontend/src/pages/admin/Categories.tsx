import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  LayoutGrid, Plus, MoreVertical, Loader2, Trash2, X, 
  Edit3, Eye, Code, Trophy, Users, GraduationCap, 
  Mic2, Palette, Info, Check, Search, Filter, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

const iconOptions = [
  { name: "LayoutGrid", icon: LayoutGrid },
  { name: "Code", icon: Code },
  { name: "Trophy", icon: Trophy },
  { name: "Users", icon: Users },
  { name: "GraduationCap", icon: GraduationCap },
  { name: "Mic2", icon: Mic2 },
];

const colorOptions = [
  "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444", "#6366F1"
];

const AdminCategories = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  // Forms
  const [form, setForm] = useState({ 
    id: "",
    name: "", 
    description: "", 
    color: "#8B5CF6", 
    icon: "LayoutGrid" 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get("/categories");
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post("/categories", form, token || undefined);
      if (response.success) {
        toast.success("Category created successfully");
        setCategories(prev => [...prev, response.data]);
        setIsAddModalOpen(false);
        resetForm();
      }
    } catch (error) {
      toast.error("Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.put(`/categories/${form.id}`, form, token || undefined);
      if (response.success) {
        toast.success("Category updated");
        setCategories(prev => prev.map(c => c.id === form.id ? response.data : c));
        setIsEditModalOpen(false);
        resetForm();
      }
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the "${name}" category? This may affect events linked to it.`)) return;
    
    try {
       const response = await api.delete(`/categories/${id}`, token || undefined);
       if (response.success) {
         toast.success("Category removed from system");
         setCategories(categories.filter(c => c.id !== id));
       } else {
         toast.error(response.message || "Delete failed");
       }
    } catch (e) {
       toast.error("An error occurred during deletion");
    } finally {
       setActiveMenu(null);
    }
  };

  const resetForm = () => {
    setForm({ id: "", name: "", description: "", color: "#8B5CF6", icon: "LayoutGrid" });
  };

  const openEdit = (cat: any) => {
    setForm({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      color: cat.color || "#8B5CF6",
      icon: cat.icon || "LayoutGrid"
    });
    setIsEditModalOpen(true);
    setActiveMenu(null);
  };

  const IconComponent = ({ name, className }: { name: string, className?: string }) => {
    const option = iconOptions.find(o => o.name === name) || iconOptions[0];
    const Icon = option.icon;
    return <Icon className={className} />;
  };

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="admin">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Event Categories</h1>
          <p className="text-sm text-muted-foreground mt-1 font-normal">Manage the structural classification of all campus events.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Add Category
        </button>
      </div>

      <div className="mb-8 relative max-w-xl group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Search categories by name or description..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center bg-card rounded-xl border border-gray-200">
           <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
           <p className="text-sm font-medium text-muted-foreground animate-pulse">Syncing Category Nodes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((c, i) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="group p-6 bg-card border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all relative flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 duration-300" style={{ backgroundColor: `${c.color || "#8B5CF6"}15`, color: c.color || "#8B5CF6" }}>
                    <IconComponent name={c.icon} className="w-6 h-6" />
                  </div>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === c.id ? null : c.id)}
                      className="p-2 hover:bg-muted rounded-lg transition-all"
                    >
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                    
                    <AnimatePresence>
                      {activeMenu === c.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 5 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden"
                          >
                             <button onClick={() => openEdit(c)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium hover:bg-muted transition-all">
                                <Edit3 className="w-4 h-4 text-primary" /> Edit Category
                             </button>
                             <button onClick={() => navigate(`/student/explore?category=${c.name}`)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium hover:bg-muted transition-all">
                                <Eye className="w-4 h-4 text-emerald-500" /> View Events
                             </button>
                             <div className="h-px bg-border mx-2" />
                             <button onClick={() => handleDelete(c.id, c.name)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium hover:bg-destructive/10 text-destructive transition-all">
                                <Trash2 className="w-4 h-4" /> Delete Category
                             </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground tracking-tight">{c.name}</h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2 font-normal leading-relaxed">
                    {c.description || "No description provided for this category."}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                         <LayoutGrid className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                         <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">Active Events</span>
                         <span className="text-sm font-semibold text-foreground">{c.eventCount || 0} Events</span>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Category Modal (Add/Edit) */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={(val) => { if(!val) { setIsAddModalOpen(false); setIsEditModalOpen(false); resetForm(); } }}>
        <DialogContent className="max-w-xl p-0 overflow-hidden bg-card border border-border rounded-xl shadow-lg">
          <div className="p-8 border-b border-border bg-muted/20">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl shadow-sm">
                   {isEditModalOpen ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                   <DialogTitle className="text-xl font-semibold tracking-tight">
                      {isEditModalOpen ? "Edit Category" : "Add New Category"}
                   </DialogTitle>
                   <p className="text-xs text-muted-foreground mt-0.5">Configure event structural classification node.</p>
                </div>
             </div>
          </div>

          <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} className="p-8 space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground ml-1">Category Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Workshops, Hackathons"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground ml-1">Description</label>
              <textarea
                required
                rows={3}
                placeholder="Brief description of this category..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm font-medium transition-all outline-none resize-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-2">
                     <Mic2 className="w-3.5 h-3.5" /> Select Icon
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                     {iconOptions.map((opt) => (
                       <button
                         key={opt.name}
                         type="button"
                         onClick={() => setForm({ ...form, icon: opt.name })}
                         className={`p-3 rounded-xl flex items-center justify-center transition-all ${form.icon === opt.name ? "bg-primary text-white shadow-sm scale-105" : "bg-muted/50 hover:bg-muted text-muted-foreground"}`}
                       >
                          <opt.icon className="w-5 h-5" />
                       </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-2">
                     <Palette className="w-3.5 h-3.5" /> Brand Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                     {colorOptions.map((c) => (
                       <button
                         key={c}
                         type="button"
                         onClick={() => setForm({ ...form, color: c })}
                         className={`w-8 h-8 rounded-full transition-all flex items-center justify-center relative ${form.color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-110"}`}
                         style={{ backgroundColor: c }}
                       >
                          {form.color === c && <Check className="w-3 h-3 text-white" />}
                       </button>
                     ))}
                  </div>
               </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); resetForm(); }}
                className="flex-1 px-4 py-2.5 bg-muted text-foreground rounded-xl text-xs font-semibold hover:bg-muted/80 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                type="submit"
                className="flex-[2] px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {isEditModalOpen ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminCategories;
