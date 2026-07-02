import { useEffect, useState, useRef } from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
  delay?: number;
  suffix?: string;
}

const AnimatedNumber = ({ target, duration = 1200 }: { target: number; duration?: number }) => {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Explicitly handle NaN to avoid React console warnings
    const targetVal = isNaN(target) ? 0 : target;
    const startTime = performance.now();
    
    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = eased * targetVal;
      setCurrent(Math.floor(value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }, [target, duration]);

  return <span ref={ref}>{current}</span>;
};

const StatCard = ({ title, value, icon: Icon, trend, color = "text-primary", delay = 0, suffix = "" }: StatCardProps) => {
  // Ensure value is a valid number before passing to AnimatedNumber
  const numericValue = typeof value === "number" ? value : parseInt(String(value));
  const safeValue = isNaN(numericValue) ? 0 : numericValue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-card rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-semibold text-foreground mt-2 tabular-nums">
            <AnimatedNumber target={safeValue} />
            {suffix}
          </p>
          {trend && (
            <p className="text-[10px] text-emerald-500 font-semibold mt-3 flex items-center gap-1">
              <span className="flex items-center justify-center w-3 h-3 rounded-full bg-emerald-100">
                <svg className="w-2 h-2" viewBox="0 0 12 12" fill="none"><path d="M6 2L10 7H2L6 2Z" fill="currentColor" /></svg>
              </span>
              {trend}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-xl bg-muted/50 ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
