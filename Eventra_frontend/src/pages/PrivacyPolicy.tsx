import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, Cookie } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const PrivacyPolicy = () => {
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
              <Shield className="w-4 h-4" />
              Privacy Policy
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6">
              Your Privacy <span className="text-primary italic">is Priority.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              This Privacy Policy explains how Eventra collects, uses, and safeguards your information.
            </p>
          </motion.div>

          <div className="space-y-12">
            <section className="bg-card p-10 rounded-[2.5rem] border border-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">1. User Account Information</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                When you create an account on Eventra, we collect information such as your name, email address, university department, and profile picture. This information is used to personalize your experience and manage your account securely.
              </p>
            </section>

            <section className="bg-card p-10 rounded-[2.5rem] border border-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Database className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">2. Event Registration Data</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                When you register for an event, we collect registration details which may include your role (student/organizer), registration time, and any payment information if applicable. This data is shared with the event organizer to facilitate your participation.
              </p>
            </section>

            <section className="bg-card p-10 rounded-[2.5rem] border border-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Shield className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">3. Data Protection and Storage</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We implement a variety of security measures to maintain the safety of your personal information. Your data is securely stored in MongoDB and is protected by industry-standard encryption protocols.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Mention that user information is securely stored and used only for event participation and platform functionality. We do not sell or trade your personal information to third parties.
              </p>
            </section>

            <section className="bg-card p-10 rounded-[2.5rem] border border-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Cookie className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">4. Use of Cookies and Analytics</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Eventra uses cookies and session management to keep you logged in and to analyze platform performance. We use basic analytics to understand how users interact with our platform to improve user experience.
              </p>
            </section>

            <section className="bg-card p-10 rounded-[2.5rem] border border-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Eye className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">5. Your Choices</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                You can update your profile information or delete your account at any time through the settings page. If you have any questions about your data, please contact our support team.
              </p>
            </section>

            <div className="text-center pt-8 italic text-muted-foreground text-sm">
              Last updated: March 15, 2026
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
