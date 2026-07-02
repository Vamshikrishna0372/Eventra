import React from "react";
import { motion } from "framer-motion";
import { FileText, Scale, UserCheck, CreditCard, ShieldAlert } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const TermsAndConditions = () => {
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
              <Scale className="w-4 h-4" />
              Terms & Conditions
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6">
              Terms of <span className="text-primary italic">Service.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Welcome to Eventra. By using our platform, you agree to comply with the following terms and conditions.
            </p>
          </motion.div>

          <div className="space-y-12 mb-16">
            <section className="bg-card p-10 rounded-[2.5rem] border border-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <FileText className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">1. Platform Usage</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Eventra acts as a platform for event discovery and registration. We provide the infrastructure for campus event organizers to list their events and for students to discover and register for them.
              </p>
            </section>

            <section className="bg-card p-10 rounded-[2.5rem] border border-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">2. User Responsibilities</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Users are responsible for providing accurate information during registration. Any misuse of the platform, including but not limited to fraudulent registrations or unauthorized access, will lead to account termination.
              </p>
            </section>

            <section className="bg-card p-10 rounded-[2.5rem] border border-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">3. Payment & Registration</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Registration for paid events requires successful payment through our integrated payment gateway. Once registered, users must adhere to the event registration terms and payment/refund policies specified by the organizer and the platform.
              </p>
            </section>

            <section className="bg-card p-10 rounded-[2.5rem] border border-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">4. Limitation of Liability</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Eventra is not responsible for the quality, safety, or legality of the events listed. The responsibility for the execution and content of the event lies solely with the event organizer. Our liability is limited to the functionality of the platform itself.
              </p>
            </section>
          </div>

          <div className="text-center italic text-muted-foreground text-sm">
             By using Eventra, you acknowledge that you have read and understood these terms.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;
