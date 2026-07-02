import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, HelpCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <HelpCircle className="w-4 h-4" />
              Contact Us
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6">
              How can we <span className="text-primary italic">help you?</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions about an event or need technical support? Our team is here to assist you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-card p-8 rounded-3xl border border-border flex flex-col items-center text-center group hover:border-primary/50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Email Us</h3>
              <p className="text-sm text-muted-foreground mb-4">Our support team will get back to you within 24 hours.</p>
              <a href="mailto:support@eventra.com" className="text-primary font-bold hover:underline">support@eventra.com</a>
            </div>

            <div className="bg-card p-8 rounded-3xl border border-border flex flex-col items-center text-center group hover:border-primary/50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Call Us</h3>
              <p className="text-sm text-muted-foreground mb-4">Available Monday to Friday, 9:00 AM - 6:00 PM.</p>
              <a href="tel:+919988776655" className="text-primary font-bold hover:underline">+91-9988776655</a>
            </div>

            <div className="bg-card p-8 rounded-3xl border border-border flex flex-col items-center text-center group hover:border-primary/50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Our Office</h3>
              <p className="text-sm text-muted-foreground mb-4">Visit us at our campus headquarters.</p>
              <address className="not-italic text-foreground font-bold">
                Platform Name: Eventra<br />
                Campus Connect Hub, Sector 14
              </address>
            </div>
          </div>

          <div className="bg-card rounded-[2.5rem] border border-border overflow-hidden lg:flex">
             <div className="lg:w-1/2 p-10 bg-primary text-primary-foreground hidden lg:flex flex-col justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-6">Send us a message</h2>
                  <p className="text-primary-foreground/80 mb-8">
                    Fill out the form and our team will get in touch with you shortly. We love hearing from our community members.
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Mail className="w-5 h-5 text-primary-foreground/60" />
                    <span>support@eventra.com</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="w-5 h-5 text-primary-foreground/60" />
                    <span>+91 9988776655</span>
                  </div>
                </div>
             </div>
             
             <div className="lg:w-1/2 p-10">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Your Name</label>
                      <input type="text" className="w-full px-4 py-3 bg-secondary rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address</label>
                      <input type="email" className="w-full px-4 py-3 bg-secondary rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="john@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <input type="text" className="w-full px-4 py-3 bg-secondary rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="General Inquiry" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea rows={4} className="w-full px-4 py-3 bg-secondary rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="How can we help you?"></textarea>
                  </div>
                  <button type="submit" className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </form>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
