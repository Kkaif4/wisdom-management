"use client";

import React from "react";

interface ContactTriggerProps {
  label: string;
  className?: string;
}

export function ContactTrigger({ label, className }: ContactTriggerProps) {
  const handleClick = () => {
    window.dispatchEvent(new Event("open-contact-modal"));
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      type="button"
    >
      {label}
    </button>
  );
}
