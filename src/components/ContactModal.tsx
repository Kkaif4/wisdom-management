"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Send, CheckCircle2 } from "lucide-react";
import { showToast } from "./shared/Toast";

interface ContactModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function ContactModal({ isOpen: controlledIsOpen, onClose: controlledOnClose }: ContactModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleOpen = () => setInternalIsOpen(true);
    window.addEventListener("open-contact-modal", handleOpen);
    return () => window.removeEventListener("open-contact-modal", handleOpen);
  }, []);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const onClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, schoolName, description }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        showToast("Registration request submitted successfully!", "success");
      } else {
        showToast(data.error || "Failed to submit request.", "error");
      }
    } catch (error) {
      showToast("An unexpected error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
      {/* Clickable Backdrop Area */}
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg border border-border bg-card p-8 shadow-2xl rounded-2xl animate-fade-in-up z-10 my-auto">
        {/* Decorative corner markers */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary -translate-x-[1px] -translate-y-[1px]" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary translate-x-[1px] -translate-y-[1px]" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary -translate-x-[1px] translate-y-[1px]" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary translate-x-[1px] translate-y-[1px]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close registration modal"
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>

        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-tight">Request Received</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your school registration request has been successfully queued. Our administrative team will reach out to verify your details and set up your organization space.
            </p>
            <button
              onClick={() => {
                onClose();
                setSuccess(false);
                setName("");
                setEmail("");
                setSchoolName("");
                setDescription("");
              }}
              className="mt-6 border border-border px-6 py-2 text-xs font-bold uppercase tracking-widest bg-card hover:bg-muted transition-colors rounded-xl"
            >
              Close Window
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary block mb-2">
                Join System
              </span>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">
                Register Organization
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Submit details to request listing your school on the Wisdom Finance ledger engine.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Principal Jane Doe"
                  className="w-full rounded-xl border border-border/80 bg-muted/30 p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. administrator@school.edu"
                  className="w-full rounded-xl border border-border/80 bg-muted/30 p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  School / Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. Wisdom International Academy"
                  className="w-full rounded-xl border border-border/80 bg-muted/30 p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your student volume or billing needs..."
                  rows={3}
                  className="w-full rounded-xl border border-border/80 bg-muted/30 p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 border-2 border-primary bg-primary text-primary-foreground py-3 text-xs font-bold uppercase tracking-widest hover:bg-transparent hover:text-primary transition-colors disabled:opacity-50 rounded-xl cursor-pointer mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Request
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
