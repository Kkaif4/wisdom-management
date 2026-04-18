"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const variantStyles = {
    danger: {
      icon: "bg-destructive/10 text-destructive",
      btn: "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 hover:bg-destructive/90",
    },
    warning: {
      icon: "bg-amber-500/10 text-amber-600",
      btn: "bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600",
    },
    default: {
      icon: "bg-primary/10 text-primary",
      btn: "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
      <div className="bg-card border shadow-2xl rounded-3xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${styles.icon}`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-black tracking-tight text-foreground">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground font-medium mt-1.5 leading-relaxed">
                {message}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted rounded-2xl transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-sm font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-95 ${styles.btn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
