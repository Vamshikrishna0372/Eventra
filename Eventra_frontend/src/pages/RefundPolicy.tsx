import React from "react";
import { motion } from "framer-motion";
import { RefreshCw, Clock, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const RefundPolicy = () => {
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
              <RefreshCw className="w-4 h-4" />
              Refund Policy
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6">
              Transparent <span className="text-primary italic">Refunds.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our policy on cancellations and refunds for paid events on the Eventra platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-card p-10 rounded-[2.5rem] border border-border shadow-sm group hover:border-primary/30 transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Event Cancellation</h2>
              <p className="text-muted-foreground leading-relaxed">
                If an event is cancelled by the organizer, users will receive a full refund within 5–7 business days to their original payment method.
              </p>
            </div>

            <div className="bg-card p-10 rounded-[2.5rem] border border-border shadow-sm group hover:border-primary/30 transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <Clock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">User-Initiated</h2>
              <p className="text-muted-foreground leading-relaxed">
                If a user cancels registration after payment, refunds may depend on the specific event organizer’s policy as mentioned on the event page.
              </p>
            </div>
          </div>

          <div className="bg-secondary/30 p-10 rounded-[2.5rem] border border-border mb-12">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              Detailed Conditions
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-1" />
                <span className="text-muted-foreground">Original Ticket/Booking confirmation must be valid.</span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-1" />
                <span className="text-muted-foreground">Convenience fees (if any) are generally non-refundable.</span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-1" />
                <span className="text-muted-foreground">Refunds will be processed through the same payment gateway used during registration.</span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-1" />
                <span className="text-muted-foreground">Eventra acts as a facilitator; the final decision on discretionary refunds rests with the event organizer.</span>
              </li>
            </ul>
          </div>

          <div className="text-center bg-card p-8 rounded-3xl border border-dashed border-border">
            <p className="text-muted-foreground">
              For any refund-related queries, please write to us at{" "}
              <a href="mailto:support@eventra.com" className="text-primary font-bold hover:underline">support@eventra.com</a> 
              with your transaction ID.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RefundPolicy;
