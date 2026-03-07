"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    error: <AlertCircle className="h-5 w-5 text-rose-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const colors = {
    success: "border-emerald-100 bg-emerald-50 text-emerald-900",
    error: "border-rose-100 bg-rose-50 text-rose-900",
    info: "border-blue-100 bg-blue-50 text-blue-900",
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-2xl border p-4 shadow-xl transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } ${colors[type]}`}
    >
      {icons[type]}
      <p className="text-sm font-bold tracking-tight">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-4 rounded-lg p-1 hover:bg-black/5 transition-colors"
      >
        <X className="h-4 w-4 opacity-50" />
      </button>
    </div>
  );
};

// Simple global event system for toasts
type ToastEvent = { message: string; type: ToastType };
let toastListeners: ((event: ToastEvent | null) => void)[] = [];

export const showToast = (message: string, type: ToastType = "info") => {
  toastListeners.forEach((listener) => listener({ message, type }));
};

export const ToastContainer = () => {
  const [toast, setToast] = useState<ToastEvent | null>(null);

  const hideToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    const listener = (event: ToastEvent | null) => setToast(event);
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  if (!toast) return null;

  return (
    <Toast message={toast.message} type={toast.type} onClose={hideToast} />
  );
};
