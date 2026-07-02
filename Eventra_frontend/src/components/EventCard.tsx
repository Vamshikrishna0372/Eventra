import { Calendar, MapPin, Clock, Building } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Event, categoryColors } from "@/data/mockData";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { formatDateTime } from "@/lib/utils";

interface EventCardProps {
  event: Event;
  index?: number;
  onRegister?: (id: string) => void;
  showPrice?: boolean;
  isRegistered?: boolean;
}

const EventCard = ({ event, index = 0, onRegister, showPrice = true, isRegistered = false }: EventCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const eventId = event.id || (event as { _id?: string })._id || "";
  const currentRegistered = event.registeredCount ?? event.registered ?? 0;
  const spotsLeft = event.maxParticipants - currentRegistered;
  const capacityPercent = (currentRegistered / event.maxParticipants) * 100;
  const isAlmostFull = capacityPercent >= 90;

  const displayImage = event.imageUrl || event.image || event.thumbnailUrl || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=400&fit=crop";
  const organizerDisplay = event.organizerName || event.organizer || "Campus Club";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group bg-card rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md flex flex-col h-full"
    >
      <Link to={`/events/${eventId}`} className="block relative">
        <div className="aspect-[16/9] relative overflow-hidden">
            <img
              src={displayImage}
              alt={event.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600";
              }}
            />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <span className={`${categoryColors[typeof event.category === 'string' ? event.category : event.category?.name] || "bg-muted text-muted-foreground"} px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase shadow-sm backdrop-blur-md`}>
              {typeof event.category === 'string' ? event.category : event.category?.name || "Event"}
            </span>
            {showPrice && (
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase shadow-sm backdrop-blur-md ${event.isPaidEvent ? "bg-primary text-white" : "bg-emerald-500 text-white"}`}>
                {event.isPaidEvent ? `₹${event.price}` : "Free"}
              </span>
            )}
          </div>
          {isAlmostFull && event.status === "open" && (
            <div className="absolute bottom-3 right-3">
              <span className="bg-destructive text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase shadow-sm">
                Almost Full
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <Link to={`/events/${eventId}`}>
          <h3 className="text-lg font-semibold text-foreground leading-snug hover:text-primary transition-colors mb-3 line-clamp-2">
            {event.title}
          </h3>
        </Link>
        
        <div className="space-y-2 mb-6 flex-1">
          <div className="flex items-center text-xs font-medium text-gray-500 gap-2">
            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{formatDateTime(event.date)}</span>
          </div>
          <div className="flex items-center text-xs font-medium text-gray-500 gap-2">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center text-xs font-medium text-gray-500 gap-2">
            <Building className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{organizerDisplay}</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-[10px] font-semibold text-gray-400 uppercase mb-1.5">
            <span>{currentRegistered} / {event.maxParticipants} Registered</span>
            <span className={isAlmostFull && event.status === "open" ? "text-destructive" : ""}>
              {event.status === "open" ? `${spotsLeft} spots left` : event.status.toUpperCase()}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${capacityPercent}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className={`h-full rounded-full ${isAlmostFull && event.status === "open" ? "bg-destructive" : "bg-primary"}`}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
          <Link
            to={`/events/${eventId}`}
            className="flex-1 text-center bg-muted text-foreground px-4 py-2 rounded-xl text-xs font-semibold hover:bg-muted/80 transition-all active:scale-[0.98]"
          >
            Details
          </Link>
          <button
            onClick={(e) => { 
                e.preventDefault(); 
                if (!user) {
                  navigate("/login", { state: { from: { pathname: window.location.pathname } } });
                  return;
                }
                if (isRegistered) return;
                if(onRegister) {
                   onRegister(eventId);
                } else {
                   navigate(`/events/${eventId}`);
                }
            }}
            disabled={event.status !== "open" || currentRegistered >= event.maxParticipants || isRegistered}
            className={`flex-1 text-center px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50 ${
              isRegistered 
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default" 
                : "bg-primary text-white hover:bg-primary/90 shadow-sm"
            }`}
          >
            {isRegistered ? "Registered" : event.status !== "open" ? "Closed" : "Register"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
