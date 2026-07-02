import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Bell, Palette, Shield, ChevronRight, Save, Eye, EyeOff,
  Camera, Loader2, Check, X, AlertTriangle, LogOut, Trash2,
  Lock, Smartphone, Monitor, Moon, Sun, Globe, Layout,
  Link as LinkIcon, Github, Linkedin, Phone, Building,
  Mail, MessageSquare, Wifi, Volume2, Vibrate, AtSign,
  SlidersHorizontal, Zap, Brush, ToggleLeft, ToggleRight,
  ShieldCheck, Key, RefreshCw, Activity, Clock, MapPin,
  BarChart3, FileText, UserX, Info, ChevronDown
} from "lucide-react";

// ΓöÇΓöÇ Reusable Toggle ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
      enabled ? "bg-primary shadow-lg shadow-primary/30" : "bg-muted border border-border"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all duration-300 ${
        enabled ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

// ΓöÇΓöÇ Section Card ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const SectionCard = ({ title, description, icon: Icon, children, accent = "primary" }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm"
  >
    <div className="flex items-center gap-4 p-6 border-b border-border/50 bg-muted/20">
      <div className={`w-10 h-10 rounded-2xl bg-${accent}/10 text-${accent} flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h2 className="font-black text-foreground tracking-tight">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
    <div className="p-6 space-y-5">{children}</div>
  </motion.div>
);

// ΓöÇΓöÇ Setting Row ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const SettingRow = ({ label, description, children, icon: Icon }: any) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-border/30 last:border-0">
    <div className="flex items-center gap-3 min-w-0">
      {Icon && <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground shrink-0"><Icon className="w-4 h-4" /></div>}
      <div className="min-w-0">
        <p className="text-sm font-bold text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>}
      </div>
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

// ΓöÇΓöÇ Input Field ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const InputField = ({ label, icon: Icon, ...props }: any) => (
  <div>
    <label className="block text-xs font-black text-foreground uppercase tracking-wider mb-2 opacity-70">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
      <input
        className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-3 bg-muted/30 border border-border/60 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all`}
        {...props}
      />
    </div>
  </div>
);

// ΓöÇΓöÇ Radio Option ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const RadioOption = ({ value, current, onChange, label, icon: Icon, description }: any) => (
  <button
    type="button"
    onClick={() => onChange(value)}
    className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
      current === value
        ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
        : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
    }`}
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${current === value ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
      {Icon && <Icon className="w-4 h-4" />}
    </div>
    <div className="flex-1">
      <p className={`text-sm font-bold ${current === value ? "text-primary" : "text-foreground"}`}>{label}</p>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
    {current === value && <Check className="w-4 h-4 text-primary shrink-0" />}
  </button>
);

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const TABS = [
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "privacy", label: "Privacy", icon: Eye },
  { id: "security", label: "Security", icon: Shield },
  { id: "integrations", label: "Integrations", icon: LinkIcon },
  { id: "accessibility", label: "Accessibility", icon: SlidersHorizontal },
];

const SettingsPage = () => {
  const { user, token, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Account
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phoneNumber: "",
    department: "",
    bio: "",
    profileImage: user?.picture || "",
    website: "",
    linkedIn: "",
    github: "",
  });

  // Notifications
  const [notifSettings, setNotifSettings] = useState({
    emailNotifications: true,
    eventReminders: true,
    newEventAlerts: true,
    adminMessages: true,
    systemNotifications: true,
    registrationConfirmations: true,
    weeklyDigest: false,
    pushNotifications: false,
  });

  // Appearance
  const [appearance, setAppearance] = useState({
    theme: "system",
    dashboardLayout: "comfortable",
    cardStyle: "rounded",
    sidebarDefault: "collapsed",
    accentColor: "purple",
    fontSize: "medium",
    animationsEnabled: true,
    densityMode: "normal",
  });

  // Privacy
  const [privacy, setPrivacy] = useState({
    showProfileInParticipants: true,
    allowProfileViewing: true,
    showParticipationHistory: true,
    showEmail: false,
    showPhone: false,
    allowDirectMessages: true,
  });

  // Security
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPwd, setShowPwd] = useState({ current: false, newPwd: false, confirm: false });
  const [sessions, setSessions] = useState<any[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  // Load all settings
  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const [profRes, notifRes, appRes, privRes, sessRes] = await Promise.all([
          api.get("/users/profile", token),
          api.get("/users/notification-settings", token),
          api.get("/users/appearance-settings", token),
          api.get("/users/privacy-settings", token),
          api.get("/users/sessions", token),
        ]);

        if (profRes.success && profRes.data) {
          const d = profRes.data;
          setProfile({
            name: d.name || "",
            email: d.email || "",
            phoneNumber: d.phoneNumber || "",
            department: d.department || "",
            bio: d.bio || "",
            profileImage: d.profileImage || d.picture || "",
            website: d.website || "",
            linkedIn: d.linkedIn || "",
            github: d.github || "",
          });
        }
        if (notifRes.success) setNotifSettings(notifRes.data);
        if (appRes.success) setAppearance(appRes.data);
        if (privRes.success) setPrivacy(privRes.data);
        if (sessRes.success) setSessions(sessRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const save = async (endpoint: string, data: any, successMsg = "Settings saved!") => {
    setSaving(true);
    try {
      const res = await api.put(endpoint, data, token || undefined);
      if (res.success) {
        toast.success(successMsg, { description: "Your changes have been saved to your account." });
        if (endpoint === "/users/update-profile") {
          updateUser(data);
        }
      }
      else toast.error(res.message || "Save failed");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTheme = (theme: string) => {
    setAppearance(prev => ({ ...prev, theme }));
    if (theme === "dark") document.documentElement.classList.add("dark");
    else if (theme === "light") document.documentElement.classList.remove("dark");
    else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches)
        document.documentElement.classList.add("dark");
      else
        document.documentElement.classList.remove("dark");
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error("Passwords do not match"); return; }
    if (passwords.newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setSaving(true);
    try {
      const res = await api.post("/users/change-password", passwords, token || undefined);
      if (res.success) { toast.success("Password changed successfully!"); setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" }); }
      else toast.error(res.message || "Password change failed");
    } catch { toast.error("Failed to change password"); }
    finally { setSaving(false); }
  };

  const handleLogoutAll = async () => {
    try {
      const res = await api.post("/users/logout-all", {}, token || undefined);
      if (res.success) { toast.success("All sessions terminated"); logout(); }
    } catch { toast.error("Failed to logout all sessions"); }
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== "DELETE") { toast.error('Please type "DELETE" to confirm'); return; }
    try {
      const res = await api.delete("/users/delete-account", token || undefined);
      if (res.success) { toast.success("Account deleted"); logout(); }
    } catch { toast.error("Failed to delete account"); }
  };

  const passwordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };
  const strength = passwordStrength(passwords.newPassword);
  const strengthLabel = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"][strength];
  const strengthColor = ["", "bg-destructive", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-500"][strength];

  if (loading) return (
    <DashboardLayout role={user?.role || "student"}>
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading your settings...</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role={user?.role || "student"}>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground tracking-tighter">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account, preferences and security settings.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="lg:w-64 shrink-0">
          <div className="bg-card border border-border/50 rounded-3xl p-2 shadow-sm sticky top-24">
            {/* User Preview */}
            <div className="flex items-center gap-3 p-4 mb-2 border-b border-border/30">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary font-black flex items-center justify-center overflow-hidden shrink-0">
                {profile.profileImage
                  ? <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
                  : profile.name?.charAt(0) || "U"
                }
              </div>
              <div className="min-w-0">
                <p className="font-black text-sm text-foreground truncate">{profile.name || user?.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{user?.role}</p>
              </div>
            </div>

            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all mb-0.5 ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {tab.label}
                {activeTab === tab.id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {/* ΓöÇΓöÇ ACCOUNT ΓöÇΓöÇ */}
            {activeTab === "account" && (
              <motion.div key="account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <SectionCard title="Profile Information" description="Your personal details visible on your profile" icon={User}>
                  {/* Avatar Upload */}
                  <div className="flex items-center gap-6 pb-5 border-b border-border/30">
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary font-black text-2xl flex items-center justify-center overflow-hidden border-2 border-primary/20 shadow-lg">
                        {profile.profileImage
                          ? <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
                          : profile.name?.charAt(0) || "U"
                        }
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-lg hover:bg-primary/90 transition-all active:scale-95"
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setProfile(p => ({ ...p, profileImage: reader.result as string }));
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Profile Photo</h4>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB. Square images recommended.</p>
                      <button onClick={() => setProfile(p => ({ ...p, profileImage: "" }))} className="text-xs text-destructive hover:underline font-bold mt-2">Remove photo</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Full Name" icon={User} value={profile.name} onChange={(e: any) => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" />
                    <InputField label="Email Address" icon={Mail} value={profile.email} type="email" disabled placeholder="john@university.edu" className="opacity-60 cursor-not-allowed" />
                    <InputField label="Phone Number" icon={Phone} value={profile.phoneNumber} onChange={(e: any) => setProfile(p => ({ ...p, phoneNumber: e.target.value }))} placeholder="+91 98765 43210" />
                    <InputField label="Department" icon={Building} value={profile.department} onChange={(e: any) => setProfile(p => ({ ...p, department: e.target.value }))} placeholder="Computer Science" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-foreground uppercase tracking-wider mb-2 opacity-70">Bio / About Me</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
                      rows={3}
                      placeholder="Tell others about yourself..."
                      className="w-full px-4 py-3 bg-muted/30 border border-border/60 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition-all"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1 text-right">{profile.bio.length}/200 characters</p>
                  </div>
                  <button
                    onClick={() => save("/users/update-profile", profile, "Profile updated!")}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-primary/20"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Profile
                  </button>
                </SectionCard>

                <SectionCard title="Social & Online Presence" description="Links to your professional profiles and portfolio" icon={Globe}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Personal Website" icon={Globe} value={profile.website} onChange={(e: any) => setProfile(p => ({ ...p, website: e.target.value }))} placeholder="https://yoursite.com" type="url" />
                    <InputField label="LinkedIn Profile" icon={Linkedin} value={profile.linkedIn} onChange={(e: any) => setProfile(p => ({ ...p, linkedIn: e.target.value }))} placeholder="linkedin.com/in/username" />
                    <InputField label="GitHub Profile" icon={Github} value={profile.github} onChange={(e: any) => setProfile(p => ({ ...p, github: e.target.value }))} placeholder="github.com/username" />
                    <InputField label="Profile URL Slug" icon={AtSign} value="" onChange={() => {}} placeholder="eventra.edu/@username" disabled />
                  </div>
                  <button
                    onClick={() => save("/users/update-profile", { website: profile.website, linkedIn: profile.linkedIn, github: profile.github }, "Links saved!")}
                    disabled={saving}
                    className="flex items-center gap-2 bg-muted border border-border hover:bg-card text-foreground px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Links
                  </button>
                </SectionCard>
              </motion.div>
            )}

            {/* ΓöÇΓöÇ NOTIFICATIONS ΓöÇΓöÇ */}
            {activeTab === "notifications" && (
              <motion.div key="notif" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <SectionCard title="Email Notifications" description="Control which emails you receive from Eventra" icon={Mail}>
                  {[
                    { key: "emailNotifications", label: "All Email Notifications", desc: "Master toggle for all email communications", icon: Mail },
                    { key: "registrationConfirmations", label: "Registration Confirmations", desc: "When you successfully register for an event", icon: Check },
                    { key: "eventReminders", label: "Event Reminders", desc: "24 hours before an upcoming registered event", icon: Clock },
                    { key: "newEventAlerts", label: "New Event Announcements", desc: "When new events are published on the platform", icon: Bell },
                    { key: "adminMessages", label: "Admin Messages", desc: "Important updates from campus administration", icon: MessageSquare },
                    { key: "weeklyDigest", label: "Weekly Digest", desc: "A summary of upcoming events every Monday", icon: FileText },
                  ].map(({ key, label, desc, icon }) => (
                    <SettingRow key={key} label={label} description={desc} icon={icon}>
                      <Toggle
                        enabled={(notifSettings as any)[key]}
                        onChange={() => setNotifSettings(p => ({ ...p, [key]: !(p as any)[key] }))}
                      />
                    </SettingRow>
                  ))}
                </SectionCard>

                <SectionCard title="In-App & Push Notifications" description="Instant alerts within the Eventra platform" icon={Smartphone}>
                  {[
                    { key: "systemNotifications", label: "System Notifications", desc: "Platform updates, maintenance alerts", icon: Monitor },
                    { key: "pushNotifications", label: "Browser Push Notifications", desc: "Receive alerts even when not on the platform", icon: Wifi },
                  ].map(({ key, label, desc, icon }) => (
                    <SettingRow key={key} label={label} description={desc} icon={icon}>
                      <Toggle
                        enabled={(notifSettings as any)[key]}
                        onChange={() => setNotifSettings(p => ({ ...p, [key]: !(p as any)[key] }))}
                      />
                    </SettingRow>
                  ))}
                </SectionCard>

                <button
                  onClick={() => save("/users/notification-settings", notifSettings, "Notification preferences saved!")}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-primary/20"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Notification Preferences
                </button>
              </motion.div>
            )}

            {/* ΓöÇΓöÇ APPEARANCE ΓöÇΓöÇ */}
            {activeTab === "appearance" && (
              <motion.div key="appear" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <SectionCard title="Theme" description="Choose your preferred visual mode" icon={Brush}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <RadioOption value="light" current={appearance.theme} onChange={handleApplyTheme} label="Light Mode" icon={Sun} description="Clean and bright interface" />
                    <RadioOption value="dark" current={appearance.theme} onChange={handleApplyTheme} label="Dark Mode" icon={Moon} description="Easy on the eyes at night" />
                    <RadioOption value="system" current={appearance.theme} onChange={handleApplyTheme} label="System Default" icon={Monitor} description="Follows your OS preference" />
                  </div>
                </SectionCard>

                <SectionCard title="Accent Color" description="Choose your preferred highlight color" icon={Palette}>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: "purple", label: "Purple", color: "bg-violet-500" },
                      { value: "blue", label: "Blue", color: "bg-blue-500" },
                      { value: "green", label: "Green", color: "bg-emerald-500" },
                      { value: "orange", label: "Orange", color: "bg-orange-500" },
                      { value: "rose", label: "Rose", color: "bg-rose-500" },
                      { value: "cyan", label: "Cyan", color: "bg-cyan-500" },
                    ].map(({ value, label, color }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAppearance(p => ({ ...p, accentColor: value }))}
                        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                          appearance.accentColor === value ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full ${color}`} />
                        {label}
                        {appearance.accentColor === value && <Check className="w-3.5 h-3.5 text-primary ml-1" />}
                      </button>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Layout & Density" description="Customize how content is displayed" icon={Layout}>
                  <SettingRow label="Dashboard Layout" description="How content cards are arranged" icon={BarChart3}>
                    <select
                      value={appearance.dashboardLayout}
                      onChange={(e) => setAppearance(p => ({ ...p, dashboardLayout: e.target.value }))}
                      className="px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="comfortable">Comfortable</option>
                      <option value="compact">Compact</option>
                    </select>
                  </SettingRow>
                  <SettingRow label="Card Style" description="Shape and style of content cards" icon={Layout}>
                    <select
                      value={appearance.cardStyle}
                      onChange={(e) => setAppearance(p => ({ ...p, cardStyle: e.target.value }))}
                      className="px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="rounded">Rounded</option>
                      <option value="sharp">Sharp Edges</option>
                    </select>
                  </SettingRow>
                  <SettingRow label="Sidebar Default" description="Sidebar state when page loads" icon={SlidersHorizontal}>
                    <select
                      value={appearance.sidebarDefault}
                      onChange={(e) => setAppearance(p => ({ ...p, sidebarDefault: e.target.value }))}
                      className="px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="collapsed">Collapsed</option>
                      <option value="expanded">Expanded</option>
                    </select>
                  </SettingRow>
                  <SettingRow label="Font Size" description="Text size across the application" icon={FileText}>
                    <select
                      value={appearance.fontSize}
                      onChange={(e) => setAppearance(p => ({ ...p, fontSize: e.target.value }))}
                      className="px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </SettingRow>
                  <SettingRow label="Motion & Animations" description="Reduce motion for accessibility" icon={Zap}>
                    <Toggle enabled={appearance.animationsEnabled} onChange={() => setAppearance(p => ({ ...p, animationsEnabled: !p.animationsEnabled }))} />
                  </SettingRow>
                </SectionCard>

                <button
                  onClick={() => save("/users/appearance-settings", appearance, "Appearance saved!")}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-primary/20"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Appearance
                </button>
              </motion.div>
            )}

            {/* ΓöÇΓöÇ PRIVACY ΓöÇΓöÇ */}
            {activeTab === "privacy" && (
              <motion.div key="privacy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <SectionCard title="Profile Visibility" description="Control who can see your profile and activity" icon={Eye}>
                  {[
                    { key: "allowProfileViewing", label: "Allow Profile Viewing", desc: "Other students can view your full profile page", icon: Eye },
                    { key: "showProfileInParticipants", label: "Show in Participant Lists", desc: "Your name appears in event participant lists", icon: User },
                    { key: "showParticipationHistory", label: "Show Participation History", desc: "Others can see which events you've attended", icon: Activity },
                    { key: "showEmail", label: "Show Email Address", desc: "Display your email on your public profile", icon: Mail },
                    { key: "showPhone", label: "Show Phone Number", desc: "Display your phone number on your profile", icon: Phone },
                    { key: "allowDirectMessages", label: "Allow Direct Messages", desc: "Other users can send you direct messages", icon: MessageSquare },
                  ].map(({ key, label, desc, icon }) => (
                    <SettingRow key={key} label={label} description={desc} icon={icon}>
                      <Toggle
                        enabled={(privacy as any)[key]}
                        onChange={() => setPrivacy(p => ({ ...p, [key]: !(p as any)[key] }))}
                      />
                    </SettingRow>
                  ))}
                </SectionCard>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-5 flex gap-4">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-300">About Privacy</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 leading-relaxed">
                      Your privacy is important to us. Eventra never shares your personal data with third parties. You can request a full data export or account deletion at any time.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => save("/users/privacy-settings", privacy, "Privacy settings saved!")}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-primary/20"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Privacy Settings
                </button>
              </motion.div>
            )}

            {/* ΓöÇΓöÇ SECURITY ΓöÇΓöÇ */}
            {activeTab === "security" && (
              <motion.div key="sec" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

                {/* Change Password */}
                <SectionCard title="Change Password" description="Update your password to keep your account secure" icon={Key}>
                  {user?.authProvider === "google" ? (
                    <div className="flex items-center gap-4 p-5 bg-muted/30 rounded-2xl border border-border/50">
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-8 h-8" alt="" />
                      <div>
                        <p className="font-bold text-sm text-foreground">Google Managed Password</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Your password is managed through your Google account. Visit myaccount.google.com to make changes.</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {[
                          { key: "current", label: "Current Password", stateKey: "currentPassword", show: "current" },
                          { key: "newPwd", label: "New Password", stateKey: "newPassword", show: "newPwd" },
                          { key: "confirm", label: "Confirm New Password", stateKey: "confirmPassword", show: "confirm" },
                        ].map(({ key, label, stateKey, show }) => (
                          <div key={key}>
                            <label className="block text-xs font-black text-foreground uppercase tracking-wider mb-2 opacity-70">{label}</label>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <input
                                type={(showPwd as any)[key] ? "text" : "password"}
                                value={(passwords as any)[stateKey]}
                                onChange={(e) => setPasswords(p => ({ ...p, [stateKey]: e.target.value }))}
                                placeholder="ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó"
                                className="w-full pl-10 pr-12 py-3 bg-muted/30 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPwd(p => ({ ...p, [key]: !(p as any)[key] }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {(showPwd as any)[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Password Strength */}
                      {passwords.newPassword && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-bold text-muted-foreground">Password Strength</p>
                            <p className={`text-xs font-black ${strength >= 4 ? "text-green-500" : strength >= 3 ? "text-yellow-500" : "text-destructive"}`}>{strengthLabel}</p>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-muted"}`} />
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-1 pt-1">
                            {[
                              { check: passwords.newPassword.length >= 8, label: "At least 8 characters" },
                              { check: /[A-Z]/.test(passwords.newPassword), label: "Uppercase letter" },
                              { check: /[0-9]/.test(passwords.newPassword), label: "Number" },
                              { check: /[^A-Za-z0-9]/.test(passwords.newPassword), label: "Special character" },
                            ].map(({ check, label }) => (
                              <div key={label} className={`flex items-center gap-1.5 text-[10px] font-bold ${check ? "text-green-500" : "text-muted-foreground"}`}>
                                {check ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                {label}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleChangePassword}
                        disabled={saving || !passwords.currentPassword || !passwords.newPassword}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-primary/20"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        Update Password
                      </button>
                    </>
                  )}
                </SectionCard>

                {/* Active Sessions */}
                <SectionCard title="Active Sessions" description="Devices where you are currently signed in" icon={Smartphone}>
                  {sessions.length > 0 ? (
                    <div className="space-y-3">
                      {sessions.map((session) => (
                        <div key={session.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50">
                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0"><Monitor className="w-5 h-5 text-muted-foreground" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm">{session.device || "Unknown Device"}</p>
                            <p className="text-xs text-muted-foreground">{session.ip || "Unknown IP"} ┬╖ {session.browser || "Unknown Browser"}</p>
                          </div>
                          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-500/10 px-2 py-1 rounded-lg">Active</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <Smartphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground font-medium">No active sessions tracked</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Sessions are recorded when you log in via the API.</p>
                    </div>
                  )}

                  <button
                    onClick={handleLogoutAll}
                    className="flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-destructive/20 transition-all active:scale-95"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out of All Devices
                  </button>
                </SectionCard>

                {/* Two Factor */}
                <SectionCard title="Two-Factor Authentication" description="Add an extra layer of security to your account" icon={ShieldCheck}>
                  <div className="flex items-center gap-5 p-5 bg-muted/20 rounded-2xl border border-border/50">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground">2FA Not Enabled</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Protect your account with an authenticator app. This feature is coming soon.</p>
                    </div>
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded-lg shrink-0">Soon</span>
                  </div>
                </SectionCard>

                {/* Danger Zone */}
                <div className="bg-destructive/5 border border-destructive/20 rounded-3xl overflow-hidden">
                  <div className="p-6 border-b border-destructive/20 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-black text-foreground">Danger Zone</h2>
                      <p className="text-xs text-muted-foreground">Irreversible and destructive actions</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-4 p-4 bg-background rounded-2xl border border-destructive/20">
                      <div className="flex items-center gap-3">
                        <UserX className="w-5 h-5 text-destructive shrink-0" />
                        <div>
                          <p className="font-bold text-sm text-foreground">Delete Account</p>
                          <p className="text-xs text-muted-foreground">Permanently delete your account and all data. This cannot be undone.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setDeleteConfirm(true)}
                        className="shrink-0 px-4 py-2 bg-destructive text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-destructive/90 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ΓöÇΓöÇ INTEGRATIONS ΓöÇΓöÇ */}
            {activeTab === "integrations" && (
              <motion.div key="integ" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <SectionCard title="Connected Accounts" description="Manage your linked social and productivity accounts" icon={LinkIcon}>
                  {[
                    { name: "Google", icon: "G", color: "bg-red-500", connected: user?.authProvider === "google", desc: user?.authProvider === "google" ? user?.email : "Connect to enable Google login" },
                    { name: "GitHub", icon: <Github />, color: "bg-gray-900", connected: !!profile.github, desc: profile.github || "Connect for hackathon event tracking" },
                    { name: "LinkedIn", icon: <Linkedin />, color: "bg-blue-600", connected: !!profile.linkedIn, desc: profile.linkedIn || "Import your professional profile" },
                  ].map(({ name, icon, color, connected, desc }) => (
                    <div key={name} className="flex items-center gap-4 p-5 bg-muted/20 rounded-2xl border border-border/50">
                      <div className={`w-10 h-10 rounded-xl ${color} text-white font-black text-sm flex items-center justify-center shrink-0`}>
                        {typeof icon === "string" ? icon : icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">{name}</p>
                        <p className="text-xs text-muted-foreground truncate">{desc}</p>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${connected ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
                        {connected ? "Connected" : "Not Connected"}
                      </span>
                    </div>
                  ))}
                </SectionCard>

                <SectionCard title="Calendar Integration" description="Sync your event registrations with external calendars" icon={Clock}>
                  {[
                    { name: "Google Calendar", icon: "≡ƒôà", status: "Available Soon" },
                    { name: "Apple Calendar (.ics)", icon: "≡ƒìÄ", status: "Export Now" },
                    { name: "Outlook Calendar", icon: "≡ƒôå", status: "Available Soon" },
                  ].map(({ name, icon, status }) => (
                    <div key={name} className="flex items-center gap-4 p-4 bg-muted/20 rounded-2xl border border-border/50">
                      <span className="text-2xl">{icon}</span>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{name}</p>
                        <p className="text-xs text-muted-foreground">Sync event registrations automatically</p>
                      </div>
                      <button className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${status === "Export Now" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {status}
                      </button>
                    </div>
                  ))}
                </SectionCard>
              </motion.div>
            )}

            {/* ΓöÇΓöÇ ACCESSIBILITY ΓöÇΓöÇ */}
            {activeTab === "accessibility" && (
              <motion.div key="access" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <SectionCard title="Display & Readability" description="Adjust settings to improve readability and usability" icon={Eye}>
                  <SettingRow label="Motion & Animations" description="Reduce or disable UI animations for comfort" icon={Zap}>
                    <Toggle enabled={appearance.animationsEnabled} onChange={() => setAppearance(p => ({ ...p, animationsEnabled: !p.animationsEnabled }))} />
                  </SettingRow>
                  <SettingRow label="High Contrast Mode" description="Increase contrast for better visibility" icon={Monitor}>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-2.5 py-1 rounded-lg">Coming Soon</span>
                  </SettingRow>
                  <SettingRow label="Screen Reader Mode" description="Optimize for screen reader compatibility" icon={Volume2}>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-2.5 py-1 rounded-lg">Coming Soon</span>
                  </SettingRow>
                  <SettingRow label="Keyboard Navigation" description="Enhanced keyboard shortcuts for power users" icon={Vibrate}>
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-500/10 px-2.5 py-1 rounded-lg">Enabled</span>
                  </SettingRow>
                </SectionCard>

                <SectionCard title="Data & Storage" description="Manage your local application data" icon={RefreshCw}>
                  <div className="flex items-center gap-4 p-5 bg-muted/20 rounded-2xl border border-border/50">
                    <Activity className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-bold text-sm">Clear Application Cache</p>
                      <p className="text-xs text-muted-foreground">This will reset locally stored preferences and reload the page.</p>
                    </div>
                    <button
                      onClick={() => { localStorage.clear(); toast.success("Cache cleared!"); window.location.reload(); }}
                      className="text-xs font-black uppercase tracking-widest px-4 py-2 bg-muted hover:bg-card border border-border rounded-xl text-foreground transition-all"
                    >
                      Clear Cache
                    </button>
                  </div>
                  <div className="flex items-center gap-4 p-5 bg-muted/20 rounded-2xl border border-border/50">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-bold text-sm">Export My Data</p>
                      <p className="text-xs text-muted-foreground">Download all your event history and profile data as JSON.</p>
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-2.5 py-1 rounded-lg">Soon</span>
                  </div>
                </SectionCard>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-md z-[200]"
              onClick={() => setDeleteConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-[201] flex items-center justify-center p-4"
            >
              <div className="bg-card border border-destructive/30 rounded-3xl shadow-2xl p-8 max-w-md w-full">
                <div className="w-14 h-14 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-center text-foreground mb-2">Delete Account</h3>
                <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                  This will permanently delete your account, all registrations, and event history. This action <strong>cannot be reversed</strong>.
                </p>
                <div className="mb-6">
                  <label className="block text-xs font-black text-foreground uppercase tracking-wider mb-2">Type <span className="text-destructive">DELETE</span> to confirm</label>
                  <input
                    value={deleteText}
                    onChange={(e) => setDeleteText(e.target.value)}
                    placeholder='Type "DELETE" here'
                    className="w-full px-4 py-3 bg-muted/30 border border-destructive/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-destructive/40 text-center font-black tracking-widest"
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setDeleteConfirm(false); setDeleteText(""); }} className="flex-1 py-3 bg-muted font-black text-sm rounded-2xl hover:bg-card border border-border transition-all">Cancel</button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteText !== "DELETE"}
                    className="flex-1 py-3 bg-destructive text-white font-black text-sm rounded-2xl hover:bg-destructive/90 transition-all disabled:opacity-40"
                  >
                    Delete Forever
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

const Settings = SettingsPage;
export default Settings;
