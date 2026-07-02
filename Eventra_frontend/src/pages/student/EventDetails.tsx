import { useParams, Link, useNavigate } from "react-router-dom";
import { categoryColors } from "@/data/mockData";
import { Calendar, Clock, MapPin, Users, User, ArrowLeft, Share2, Heart, CheckCircle2, Loader2, MessageSquare, Send, Mail, Shield, ShieldCheck, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

const EventDetails = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [coordinators, setCoordinators] = useState<any[]>([]);

  const fetchEventData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [eventRes, allRes, commentsRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get("/events"),
        api.get(`/comments/event/${id}`)
      ]);
      
      if (eventRes.success) {
        setEvent(eventRes.data);
      }
      
      if (allRes.success) {
        setAllEvents(allRes.data);
      }
      
      if (commentsRes.success) {
        setComments(commentsRes.data);
      }
      
      const coordRes = await api.get(`/events/${id}/coordinators`, token || undefined);
      if (coordRes.success) {
        setCoordinators(coordRes.data);
      }
      
      if (user?.id) {
        const [regsRes, wishRes] = await Promise.all([
           api.get(`/registrations/user/${user.id}`, token || undefined),
           api.get(`/wishlist/user/${user.id}`, token || undefined)
        ]);

        if (regsRes.success) {
          const isReg = regsRes.data.some((r: any) => r.eventId === id && (r.status === "confirmed" || r.registrationStatus === "confirmed"));
          setRegistered(isReg);
        }

        if (wishRes.success) {
          const isWish = wishRes.data.some((w: any) => (w.id || w._id) === id);
          setIsWishlisted(isWish);
        }

        if (user.role === "admin" || user.id === eventRes.data?.organizerId) {
          const partRes = await api.get(`/events/${id}/participants`, token || undefined);
          if (partRes.success) {
            setParticipants(partRes.data);
          }
        }
      }
    } catch (error) {
      toast.error("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [id, user?.id, token]);

  useEffect(() => {
    if (!event) return;
    const target = new Date(event.date.includes("T") ? event.date : event.date + "T" + (event.time.includes("AM") || event.time.includes("PM") ? "10:00:00" : event.time));
    const interval = setInterval(() => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) { 
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval); 
        return; 
      }
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [event]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Synchronizing event data...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">Event not found</h2>
          <Link to="/student/explore" className="text-primary text-sm font-semibold hover:underline flex items-center gap-2 justify-center">
            <ArrowLeft className="w-4 h-4" /> Back to events
          </Link>
        </div>
      </div>
    );
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    
    setCommentLoading(true);
    try {
      const response = await api.post("/comments", { eventId: id, text: newComment }, token || undefined);
      if (response.success) {
        setComments([response.data, ...comments]);
        setNewComment("");
        toast.success("Comment posted");
      }
    } catch (error) {
      toast.error("Failed to post comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const currentRegistered = event.registeredCount ?? event.registered ?? 0;
  const spotsLeft = event.maxParticipants - currentRegistered;
  const capacityPercent = (currentRegistered / event.maxParticipants) * 100;

  const handleRegister = async () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    
    if (registered) {
      toast.error("You are already registered.");
      return;
    }

    if (spotsLeft <= 0) {
      toast.error("Event is fully booked.");
      return;
    }

    setActionLoading(true);

    // If it's a paid event, handle Razorpay
    if (event.isPaidEvent) {
      try {
        // 1. Create Order on Backend
        const orderRes = await api.post("/payments/create-order", { eventId: event.id || event._id }, token || undefined);
        if (!orderRes.success) {
          toast.error(orderRes.message || "Failed to initiate payment");
          setActionLoading(false);
          return;
        }

        const order = orderRes.data;

        // 2. Open Razorpay Checkout
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
          amount: order.amount,
          currency: order.currency,
          name: "Eventra",
          description: `Registration for ${event.title}`,
          order_id: order.id,
          handler: async (response: any) => {
            // 3. Verify Payment on Backend
            try {
              setActionLoading(true);
              const verifyRes = await api.post("/payments/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                eventId: event.id || event._id
              }, token || undefined);

              if (verifyRes.success) {
                setRegistered(true);
                toast.success("Payment successful! You're registered.");
                fetchEventData();
              } else {
                toast.error(verifyRes.message || "Payment verification failed");
              }
            } catch (err) {
              toast.error("An error occurred during verification");
            } finally {
              setActionLoading(false);
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phoneNumber || ""
          },
          theme: {
            color: "#6D28D9"
          },
          modal: {
            ondismiss: () => setActionLoading(false)
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        
      } catch (error) {
        toast.error("Payment initialization failed");
        setActionLoading(false);
      }
      return;
    }

    // Free registration flow
    try {
      const response = await api.post("/registrations", { eventId: event.id || event._id }, token || undefined);
      
      if (response.success) {
        setRegistered(true);
        toast.success("Successfully registered!");
        fetchEventData(); 
      } else {
        toast.error(response.message || "Registration failed");
      }
    } catch (error) {
      toast.error("An error occurred during registration");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        const res = await api.delete(`/wishlist/remove?eventId=${id}`, token || undefined);
        if (res.success) {
          setIsWishlisted(false);
          toast.success("Removed from wishlist");
        }
      } else {
        const res = await api.post("/wishlist/add", { eventId: id }, token || undefined);
        if (res.success) {
          setIsWishlisted(true);
          toast.success("Added to wishlist");
        }
      }
    } catch (error) {
      toast.error("Wishlist update failed");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const displayImage = event.imageUrl || event.image || event.thumbnailUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200";
  const organizerDisplay = event.organizerName || event.organizer || "Campus Admin";
  const eventCatName = typeof event.category === 'string' ? event.category : (event.category?.name || "Events");

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/student/explore" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-primary transition-all font-medium group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
          </Link>
          <div className="hidden sm:block">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground opacity-60">Event Intelligence</h2>
          </div>
          <button onClick={handleShare} className="p-2 hover:bg-muted rounded-lg transition-all text-gray-500">
             <Share2 className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Hero Section */}
          <div className="rounded-xl overflow-hidden shadow-sm mb-10 relative aspect-[21/9]">
            <img 
              src={displayImage} 
              alt={event.title} 
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className={`${categoryColors[typeof event.category === 'string' ? event.category : event.category?.name] || "bg-primary text-white"} px-3 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider inline-block mb-3 shadow-sm`}>
                {typeof event.category === 'string' ? event.category : event.category?.name || "Event"}
              </span>
              <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight leading-tight">{event.title}</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Quick Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Calendar, label: "Date", value: formatDateTime(event.date) },
                  { icon: Clock, label: "Time", value: event.time },
                  { icon: MapPin, label: "Venue", value: event.venue },
                  { icon: Mail, label: "Organizer", value: event.organizerEmail || "support@eventra.com" },
                ].map((item, idx) => (
                  <div key={item.label} className="bg-card rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                       <item.icon className="w-3.5 h-3.5" />
                    </div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5 block">{item.label}</label>
                    <p className="text-xs font-semibold text-foreground truncate">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center gap-4 py-6 border-y border-border">
                 <button 
                   onClick={handleRegister}
                   disabled={actionLoading || registered || event.status !== "open" || spotsLeft <= 0}
                   className={`flex-1 min-w-[180px] h-12 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm ${
                    registered 
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default"
                      : "bg-primary text-white hover:bg-primary/90"
                   }`}
                 >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : registered ? <CheckCircle2 className="w-4 h-4" /> : null}
                    {registered ? "Confirmed Registration" : "Join Event"}
                 </button>

                 <button 
                   onClick={handleWishlist}
                   disabled={wishlistLoading}
                   className={`h-12 px-6 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 border border-border ${
                    isWishlisted 
                      ? "bg-rose-50 border-rose-100 text-rose-500"
                      : "bg-card hover:bg-muted"
                   }`}
                 >
                    {wishlistLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />}
                    {isWishlisted ? "Saved" : "Save"}
                 </button>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground tracking-tight">About this Event</h2>
                <div className="text-gray-500 leading-relaxed text-sm font-normal">
                  {event.description}
                </div>
              </div>

              {/* Coordinators Section */}
              {coordinators && coordinators.length > 0 && (
                <div className="space-y-6 pt-10 border-t border-border">
                  <h2 className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" /> Event Coordinators
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {coordinators.map((coord: any) => (
                      <div key={coord.id} className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary/20 transition-all group shadow-sm">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 flex items-center justify-center text-primary font-bold text-lg group-hover:rotate-6 transition-all">
                          {coord.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{coord.name}</p>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{coord.email.split('@')[0]}</p>
                          <p className="text-[9px] text-muted-foreground/70 font-mono mt-0.5">{coord.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Organizer Section */}
              <div className="bg-primary/5 rounded-xl p-8 border border-primary/10">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> Logistics & Organizer Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">Point of Contact</label>
                    <p className="font-semibold text-foreground">{organizerDisplay}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{event.organizerEmail || "support@eventra.com"}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">Campus Guidelines</label>
                    <p className="text-xs text-gray-400 font-normal leading-relaxed">
                      Participants are expected to follow code of conduct. For specific event queries, please reach out via official campus channels.
                    </p>
                  </div>
                </div>
              </div>

              {/* Discussion */}
              <div className="pt-10 border-t border-border">
                <h2 className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2 mb-8">
                  <MessageSquare className="w-5 h-5 text-primary" /> Hub Discussion
                </h2>

                {user ? (
                  <form onSubmit={handleCommentSubmit} className="mb-8 relative">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Post a query or feedback..."
                      className="w-full bg-muted/30 border border-border rounded-xl p-4 pr-14 resize-none focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium transition-all"
                      rows={3}
                    />
                    <button 
                      type="submit"
                      disabled={commentLoading || !newComment.trim()}
                      className="absolute bottom-4 right-4 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-95"
                    >
                      {commentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </form>
                ) : (
                  <div className="mb-8 p-6 bg-muted/20 rounded-xl text-center border border-dashed border-border">
                    <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Authentication Required</p>
                    <Link to="/login" className="text-primary text-xs font-bold hover:underline">Log in to participate</Link>
                  </div>
                )}

                <div className="space-y-4">
                  {comments.length > 0 ? comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 p-5 bg-card border border-gray-100 rounded-xl shadow-sm">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center font-semibold text-xs text-primary shrink-0 overflow-hidden">
                        {comment.userPicture ? <img src={comment.userPicture} alt="" className="w-full h-full object-cover" /> : (comment.userName?.charAt(0) || 'U')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm text-foreground">{comment.userName}</h4>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {formatDateTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-normal leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center py-6 text-xs text-gray-400 font-medium">No discussions yet. Start the conversation!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-gray-200 p-6 shadow-sm sticky top-24">
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-border">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 block">Live Status</span>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-tight ${
                       event.status === "completed" ? "text-gray-400" :
                       event.status === "closed" || spotsLeft <= 0 ? "text-destructive" :
                       "text-emerald-500"
                    }`}>
                       <div className={`w-1.5 h-1.5 rounded-full ${
                         event.status === "completed" ? "bg-gray-400" :
                         event.status === "closed" || spotsLeft <= 0 ? "bg-destructive" :
                         "bg-emerald-500 animate-pulse"
                       }`} />
                       {event.status === "completed" ? "Ended" : event.status === "closed" || spotsLeft <= 0 ? "Booked" : "Open"}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 block">Registration</span>
                    <div className={`text-xl font-semibold tracking-tight ${event.isPaidEvent ? "text-primary" : "text-emerald-500"}`}>
                       {event.isPaidEvent ? `₹${event.price}` : "FREE"}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-end">
                     <span className="text-[10px] font-semibold text-gray-400 uppercase">Capacity</span>
                     <span className="text-sm font-semibold text-foreground">{currentRegistered} / {event.maxParticipants}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${capacityPercent}%` }}
                      className={`h-full rounded-full ${capacityPercent >= 90 ? "bg-destructive" : "bg-primary"}`}
                    />
                  </div>
                  <p className="text-[10px] font-semibold text-gray-400 text-center uppercase tracking-widest">{spotsLeft} spots available</p>
                </div>
                
                <div className="p-5 bg-muted/20 rounded-xl border border-border text-center mb-6">
                   <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Live Countdown</p>
                   <div className="flex justify-center gap-4">
                      {[{v: countdown.days, l:'D'}, {v: countdown.hours, l:'H'}, {v: countdown.minutes, l:'M'}, {v: countdown.seconds, l:'S'}].map(c => (
                        <div key={c.l} className="flex flex-col">
                           <span className="text-lg font-semibold text-primary tabular-nums">{String(c.v).padStart(2,'0')}</span>
                           <span className="text-[8px] font-semibold text-gray-400">{c.l}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="pt-6 border-t border-border flex flex-col gap-3">
                   <Link to={`/student/explore?category=${eventCatName}`} className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1 justify-center uppercase tracking-widest">
                      More in {eventCatName} <ChevronRight className="w-3 h-3" />
                   </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EventDetails;
