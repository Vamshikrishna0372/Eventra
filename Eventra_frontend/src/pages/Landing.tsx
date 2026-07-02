import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, Zap, MousePointerClick, BarChart3, Shield, 
  Calendar, MapPin, Users, TrendingUp, Star, ChevronRight,
  Check, CalendarRange, Mail
} from "lucide-react";
import { events as mockEvents, categoryColors, categoryIcons } from "@/data/mockData";
import heroImage from "@/assets/hero-illustration.png";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatDateTime, formatDate } from "@/lib/utils";

const features = [
  { icon: Zap, title: "Event Discovery", description: "Students can easily browse upcoming events, filter by categories, and find what interests them." },
  { icon: MousePointerClick, title: "Quick Registration", description: "Register for events with a single click. Get instant confirmation sent to your student email." },
  { icon: BarChart3, title: "Organizer Management", description: "Admins can manage events and participants efficiently with powerful dashboard tools." },
  { icon: Shield, title: "Event Tracking", description: "Track registrations and event participation in real time with detailed analytics." },
];

const stats = [
  { value: "10,000+", label: "Students" },
  { value: "500+", label: "Events Hosted" },
  { value: "50+", label: "Colleges" },
  { value: "98%", label: "Satisfaction" },
];

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : "/student", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.hash]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, catsRes] = await Promise.all([
          api.get("/events"),
          api.get("/categories")
        ]);
        
        if (eventsRes.success) setEvents(eventsRes.data);
        if (catsRes.success) setCategories(catsRes.data);
      } catch (error) {
        console.error("Failed to fetch landing data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const trendingEvents = events.filter((e) => (e.registeredCount || 0) > 0).slice(0, 2);
  const displayEvents = events.slice(0, 6);
  const dashboardLink = user?.role === "admin" ? "/admin" : "/student";
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <Zap className="w-3.5 h-3.5" />
                Campus Event Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-foreground leading-[1.08] mb-6">
                Eventra – Discover <span className="text-gradient">Campus Events</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
                Find and register for technical, cultural, and sports events happening across your campus.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <Link
                  to={user ? dashboardLink : "/login"}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-[0_4px_14px_0_hsl(var(--primary)/39%)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  {user ? "Go to Dashboard" : "Explore Events"} <ArrowRight className="w-4 h-4" />
                </Link>
                {!user && (
                   <Link
                    to="/admin/create"
                    className="inline-flex items-center gap-2 bg-card text-card-foreground border border-border px-6 py-3 rounded-xl text-sm font-semibold hover:bg-muted transition-all active:scale-[0.97] shadow-surface hover:-translate-y-0.5"
                  >
                    Create Event
                  </Link>
                )}
              </div>
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl blur-2xl" />
                <img
                  src={heroImage}
                  alt="Campus event discovery platform illustration"
                  className="relative rounded-2xl shadow-surface-elevated w-full"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Everything you need</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">A complete platform for students and organizers to make campus events seamless and efficient.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                className="bg-card rounded-xl shadow-surface p-6 hover:shadow-surface-hover transition-all duration-300 group hover-lift"
              >
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-110">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-card-foreground mb-2 text-base">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Events */}
      <section className="py-20 border-t border-border bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="p-2 bg-destructive/10 text-destructive rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Trending Now</h2>
              <p className="text-sm text-muted-foreground">Most popular events this month</p>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/events/${event.id}`}
                  className="group flex gap-4 bg-card rounded-xl shadow-surface p-4 hover:shadow-surface-hover transition-all duration-300 hover-lift"
                >
                  <img
                    src={event.imageUrl || event.image || event.thumbnailUrl || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=400&fit=crop"}
                    alt={event.title}
                    className="w-28 h-28 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className={`${categoryColors[event.category]} px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider inline-block mb-2`}>
                      {event.category}
                    </span>
                    <h3 className="font-bold text-card-foreground group-hover:text-primary transition-colors mb-1 truncate">{event.title}</h3>
                    <div className="flex items-center text-xs text-muted-foreground gap-3 mb-2">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(event.date)}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(event.registered / event.maxParticipants) * 100}%` }} />
                      </div>
                      <span className="text-[11px] text-muted-foreground font-medium tabular-nums">{event.registered}/{event.maxParticipants}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground self-center shrink-0 group-hover:text-primary transition-colors" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section id="categories" className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">Categories</span>
            <h2 className="text-3xl font-bold text-foreground mb-3">Popular Categories</h2>
            <p className="text-muted-foreground">Explore events across different categories</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => {
              const catName = typeof cat === 'string' ? cat : cat.name;
              const count = events.filter((e) => {
                const eCatName = typeof e.category === 'string' ? e.category : e.category?.name;
                return eCatName === catName;
              }).length;
              return (
                <motion.div
                  key={catName}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    to="/student/explore"
                    className="group bg-card rounded-xl shadow-surface p-5 text-center hover:shadow-surface-hover transition-all duration-300 hover-lift block"
                  >
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {categoryIcons[String(catName)] || "✨"}
                    </div>
                    <h3 className="font-bold text-card-foreground text-sm mb-1">{String(catName)}</h3>
                    <p className="text-[10px] text-muted-foreground font-medium">{count} event{count !== 1 ? "s" : ""}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section id="events" className="py-20 border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="inline-block bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">Upcoming</span>
              <h2 className="text-3xl font-bold text-foreground mb-2">Upcoming Events</h2>
              <p className="text-muted-foreground">Don't miss out on what's happening on campus.</p>
            </motion.div>
            <Link to="/student/explore" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              View all events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
                className="group bg-card rounded-xl shadow-surface overflow-hidden hover:shadow-surface-hover transition-all duration-300 hover-lift"
              >
                <Link to={`/events/${event.id}`}>
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <img 
                      src={event.imageUrl || event.image || event.thumbnailUrl || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=400&fit=crop"} 
                      alt={event.title} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out" 
                      loading="lazy" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`${categoryColors[event.category]} px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm`}>
                        {event.category}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="p-5">
                  <Link to={`/events/${event.id}`}>
                    <h3 className="font-bold text-card-foreground leading-tight group-hover:text-primary transition-colors duration-200 mb-2">{event.title}</h3>
                  </Link>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center text-xs text-muted-foreground gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="tabular-nums">{formatDateTime(event.date)} • {event.time}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{event.venue}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      <span className="tabular-nums">{event.registeredCount || 0} registered</span>
                    </div>
                    <Link
                      to={`/events/${event.id}`}
                      className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      Details <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10 sm:hidden">
            <Link to="/student/explore" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              View all events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-secondary rounded-2xl p-10 sm:p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
            <div className="relative">
              <Star className="w-10 h-10 text-primary mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold text-secondary-foreground mb-4">Ready to get started?</h2>
              <p className="text-secondary-foreground/70 max-w-md mx-auto mb-8">
                Join thousands of students already using Eventra to discover and register for campus events.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to={user ? dashboardLink : "/register"}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-[0.97]"
                >
                  {user ? "Go to Dashboard" : "Create Account"} <ArrowRight className="w-4 h-4" />
                </Link>
                {!user && (
                   <Link
                    to="/student/explore"
                    className="inline-flex items-center gap-2 bg-secondary-foreground/10 text-secondary-foreground border border-secondary-foreground/20 px-8 py-3 rounded-xl text-sm font-semibold hover:bg-secondary-foreground/20 transition-all active:scale-[0.97]"
                  >
                    Explore Events
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold mb-6">About Eventra</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Eventra was born out of a simple need: making campus life more vibrant and organized. We believe that every student should have easy access to the amazing workshops, cultural festivals, and sports events that define the university experience.
              </p>
              <div className="space-y-4">
                {[
                  "Centralized hub for all campus activities",
                  "Simplified registration and tracking",
                  "Real-time notifications for event updates",
                  "Powerful tools for student organizers"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <div className="bg-muted rounded-3xl aspect-video relative overflow-hidden flex items-center justify-center">
              <CalendarRange className="w-24 h-24 text-primary/20" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 border-t border-border bg-muted/20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Questions? Contact Us</h2>
          <p className="text-muted-foreground mb-10">We're here to help campus organizers and students. Reach out to our support team.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <a href="mailto:support@eventra.edu" className="flex items-center gap-3 px-8 py-4 bg-background border border-border rounded-2xl font-bold hover:shadow-lg transition-all">
               <Mail className="w-5 h-5 text-primary" /> support@eventra.edu
             </a>
             <div className="flex items-center gap-3 px-8 py-4 bg-background border border-border rounded-2xl font-bold">
               <MapPin className="w-5 h-5 text-primary" /> Student Union, Block B
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
