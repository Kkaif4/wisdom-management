"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Shield,
  Building,
  Calendar,
  KeyRound,
  CheckCircle,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { showToast } from "@/components/shared/Toast";

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  roleName: string;
  organizationName: string;
  createdAt: string;
}

interface ProfileClientProps {
  user: ProfileUser;
}

export function ProfileClient({ user }: ProfileClientProps) {
  const { update } = useSession();
  const router = useRouter();

  // Profile fields state
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Initials for avatar
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Name is required", "error");
      return;
    }
    if (!email.trim()) {
      showToast("Email is required", "error");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      // Update NextAuth session data
      await update({
        name,
        email,
      });

      showToast("Profile updated successfully", "success");
      router.refresh();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast("Current password is required", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("New password must be at least 8 characters", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");

      showToast("Password updated successfully", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          My Profile
        </h1>
        <p className="text-muted-foreground font-medium mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-border/50 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-black shadow-inner mb-4">
              {initials}
            </div>

            <h2 className="text-lg font-black text-foreground">{user.name}</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {user.email}
            </p>

            <div className="w-full h-px bg-border/50 my-6" />

            {/* Badges and quick info */}
            <div className="w-full space-y-4 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  Role
                </span>
                <span className="font-black text-foreground capitalize bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg">
                  {user.roleName.toLowerCase()}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Building className="h-3.5 w-3.5 text-primary" />
                  Org
                </span>
                <span className="font-black text-foreground truncate max-w-[150px]">
                  {user.organizationName}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  Joined
                </span>
                <span className="font-bold text-foreground">
                  {new Date(user.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-primary" />
                  Status
                </span>
                <span
                  className={`font-black text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-lg ${
                    user.isActive
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-rose-500/10 text-rose-600"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Details Form */}
          <div className="bg-white dark:bg-zinc-900 border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-border/30 pb-4">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <User className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-md font-black text-foreground">
                  Account Details
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Update your display name and email address
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Display Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl pl-11 pr-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                      placeholder="Display Name"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl pl-11 pr-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                      placeholder="Email Address"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-2xl text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Details"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white dark:bg-zinc-900 border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-border/30 pb-4">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <KeyRound className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-md font-black text-foreground">
                  Security settings
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Update your account password regularly
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-muted/20 border border-border/50 rounded-2xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-60 hover:opacity-100 transition-opacity"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-60 hover:opacity-100 transition-opacity"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                      placeholder="Verify new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-60 hover:opacity-100 transition-opacity"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-2xl text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
                >
                  {savingPassword ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
