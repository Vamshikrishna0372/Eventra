import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  LayoutGrid, Sparkles, Zap, Target, Trophy, 
  Flame, Laptop, Music, Dumbbell, Users, 
  ChevronRight, ArrowRight, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { toast } from "sonner";

const categoryIcons: Record<string, any> = {
  Hackathons: Zap,
  Workshops: Laptop,
  "Tech Talks": Sparkles,
  "Cultural Events": Music,
  Sports: Dumbbell,
  Competitions: Trophy,
  Seminars: Users,
  Technical: Laptop,
  Cultural: Music,
  Workshop: Laptop,
  Seminar: Users,
};

const categoryColors: Record<string, string> = {
  Hackathons: "from-blue-500 to-indigo-600",
  Workshops: "from-emerald-500 to-teal-600",
  "Tech Talks": "from-purple-500 to-pink-600",
  "Cultural Events": "from-rose-500 to-pink-600",
  Sports: "from-orange-500 to-amber-600",
  Competitions: "from-yellow-500 to-orange-600",
  Seminars: "from-cyan-500 to-blue-600",
  Technical: "from-blue-500 to-indigo-600",
  Cultural: "from-rose-500 to-pink-600",
  Workshop: "from-emerald-500 to-teal-600",
  Seminar: "from-cyan-500 to-blue-600",
};

const Categories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
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
    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/student/explore?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <DashboardLayout role="student">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Explore by Category
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-2xl font-normal">
          Find exactly what you're looking for. Browse our curated categories and discover events that match your interests.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-gray-200">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Syncing categories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, idx) => {
            const Icon = categoryIcons[category.name] || LayoutGrid;
            const colorGradient = categoryColors[category.name] || "from-slate-500 to-slate-600";
            
            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleCategoryClick(category.name)}
                className="group relative bg-card border border-gray-200 rounded-xl p-6 text-left hover:shadow-md transition-all flex flex-col items-start overflow-hidden h-full shadow-sm"
              >
                {/* Background Accent */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorGradient} opacity-[0.03] group-hover:opacity-[0.08] rounded-full -mr-8 -mt-8 transition-opacity`} />
                
                {/* Icon Box */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorGradient} flex items-center justify-center text-white mb-5 transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground tracking-tight mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6 font-normal line-clamp-2">
                  {category.description || "Browse exciting events and opportunities in this category."}
                </p>
                
                {/* Meta */}
                <div className="mt-auto w-full flex items-center justify-between border-t border-border pt-5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                      Active Events
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {category.eventCount || 0} Events
                    </span>
                  </div>
                  
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Categories Empty State */}
      {!loading && categories.length === 0 && (
        <div className="text-center py-20 bg-card rounded-xl border border-gray-200">
           <LayoutGrid className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
           <h3 className="text-lg font-semibold text-foreground">No categories found</h3>
           <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
             We couldn't find any categories at the moment. Please check back later.
           </p>
        </div>
      )}
      
      {/* Featured Banner / CTA */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-16 bg-slate-900 rounded-xl p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm"
      >
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#3b82f60d,transparent)] pointer-events-none" />
         <div className="relative z-10 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-3">
              Can't find what you're looking for?
            </h2>
            <p className="text-slate-400 font-normal max-w-xl text-sm">
              Our campus ecosystem is always growing. Browse all upcoming events to see everything currently scheduled.
            </p>
         </div>
         <button 
           onClick={() => navigate("/student/explore")}
           className="relative z-10 px-8 py-3 bg-primary text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-primary/90 transition-all shadow-sm active:scale-95 flex items-center gap-2"
         >
           View All Events <ChevronRight className="w-4 h-4" />
         </button>
      </motion.div>
    </DashboardLayout>
  );
};

export default Categories;
