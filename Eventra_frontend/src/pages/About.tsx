import React from "react";
import { motion } from "framer-motion";
import { CalendarRange, Info, Users, Shield, Target } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <Info className="w-4 h-4" />
              About Eventra
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6">
              The Pulse of Campus, <span className="text-primary italic">Centralized.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Empowering students to discover, engage, and thrive within their campus community.
            </p>
          </motion.div>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-12 text-muted-foreground">
            <section className="bg-card p-8 rounded-3xl border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Target className="w-6 h-6 text-primary" />
                Our Platform
              </h2>
              <p>
                Eventra is a campus event discovery and registration platform that helps students explore university events such as hackathons, workshops, technical talks, and cultural activities.
              </p>
              <p>
                Users can browse events, register for participation, and receive event updates through the platform. We aim to bridge the gap between event organizers and participants, making campus life more vibrant and accessible.
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-3xl bg-secondary/50 border border-border">
                <Users className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">For Students</h3>
                <p className="text-sm">
                  Never miss an opportunity. From career fairs to music festivals, find everything that matters to you in one place.
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-secondary/50 border border-border">
                <CalendarRange className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">For Organizers</h3>
                <p className="text-sm">
                  Manage registrations, track attendance, and promote your events to the entire campus community with ease.
                </p>
              </div>
            </div>

            <section className="text-center py-12">
               <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
               <h3 className="text-2xl font-bold text-foreground mb-4">Secure & Reliable</h3>
               <p>
                 We prioritize user security and data privacy, ensuring that your participation in campus events is managed through a professional and transparent system.
               </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
