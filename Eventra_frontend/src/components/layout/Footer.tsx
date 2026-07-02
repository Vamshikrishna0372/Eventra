import React from "react";
import { Link } from "react-router-dom";
import { CalendarRange, Mail, Phone, MapPin, Github, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand section */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:rotate-6 transition-all duration-500">
                <CalendarRange className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-foreground italic">Eventra</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              The pulse of campus, centralized. Discover, register, and manage campus events in one place.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-foreground mb-6 uppercase tracking-wider text-xs">Platform</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">Contact Support</Link>
              </li>
              <li>
                <Link to="/student/explore" className="text-muted-foreground hover:text-primary transition-colors text-sm">Explore Events</Link>
              </li>
            </ul>
          </div>

          {/* Compliance Links */}
          <div>
            <h3 className="font-bold text-foreground mb-6 uppercase tracking-wider text-xs">Legal</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors text-sm">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="text-muted-foreground hover:text-primary transition-colors text-sm">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-muted-foreground hover:text-primary transition-colors text-sm">Refund Policy</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-foreground mb-6 uppercase tracking-wider text-xs">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground text-sm">support@eventra.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground text-sm">+91 9988776655</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground text-sm">Campus Connect Hub, Sector 14</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs font-medium">
            © {currentYear} Eventra Platform. All rights reserved.
          </p>
          <div className="flex gap-6">
             <span className="text-muted-foreground text-xs">Designed for students, by students.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
