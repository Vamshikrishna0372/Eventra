export interface Event {
  id: string;
  title: string;
  description: string;
  category: any;
  date: string;
  time: string;
  venue: string;
  organizer?: string;
  organizerName?: string;
  maxParticipants: number;
  registered: number;
  registeredCount?: number;
  image?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  status: "open" | "closed" | "completed";
  trending?: boolean;
  isPaidEvent?: boolean;
  price?: number;
}

export interface Registration {
  id: string;
  eventId: string;
  eventName: string;
  studentName: string;
  studentEmail: string;
  registrationDate: string;
  status: "confirmed" | "cancelled" | "waitlisted";
}

export const events: Event[] = [];

export const registrations: Registration[] = [];

export const categoryColors: Record<string, string> = {
  Technical: "bg-primary/10 text-primary",
  Cultural: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  Sports: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  Workshops: "bg-accent/10 text-accent",
  Workshop: "bg-accent/10 text-accent",
  Placement: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Hackathon: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Seminars: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  Seminar: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
};

export const categoryIcons: Record<string, string> = {
  Technical: "💻",
  Cultural: "🎭",
  Sports: "⚽",
  Workshops: "🔧",
  Workshop: "🔧",
  Placement: "💼",
  Hackathon: "⚡",
  Seminars: "📚",
  Seminar: "📚",
};

export const monthlyTrendsData = [
  { month: "Jan", events: 3, registrations: 45 },
  { month: "Feb", events: 5, registrations: 78 },
  { month: "Mar", events: 8, registrations: 156 },
  { month: "Apr", events: 12, registrations: 234 },
  { month: "May", events: 6, registrations: 89 },
  { month: "Jun", events: 4, registrations: 67 },
];
