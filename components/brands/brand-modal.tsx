"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Building2, Globe, FileText, Briefcase, Users, MessageSquare, Target, Mail, MousePointer2, ExternalLink, Loader2, Zap } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingBrand: any | null;
}

export function BrandModal({ isOpen, onClose, onSuccess, editingBrand }: BrandModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    brandName: "",
    websiteUrl: "",
    companyDescription: "",
    industry: "",
    targetAudience: "",
    tone: "",
    primaryGoal: "",
  });

  useEffect(() => {
    if (editingBrand) {
      setFormData({
        brandName: editingBrand.brandName || "",
        websiteUrl: editingBrand.websiteUrl || "",
        companyDescription: editingBrand.companyDescription || "",
        industry: editingBrand.industry || "",
        targetAudience: editingBrand.targetAudience || "",
        tone: editingBrand.tone || "",
        primaryGoal: editingBrand.primaryGoal || "",
      });
    } else {
      setFormData({
        brandName: "",
        websiteUrl: "",
        companyDescription: "",
        industry: "",
        targetAudience: "",
        tone: "",
        primaryGoal: "",
      });
    }
  }, [editingBrand, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingBrand) {
        await axios.patch(`/api/brands/${editingBrand.id}`, formData);
        toast.success("Brand profile updated successfully");
      } else {
        await axios.post("/api/brands", formData);
        toast.success("Brand profile created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save brand", error);
      toast.error("Failed to save brand profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-3xl shadow-2xl custom-scrollbar"
          >
            <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {editingBrand ? "Edit Brand Profile" : "Create Brand Profile"}
                  </h2>
                  <p className="text-xs text-muted-foreground">Configure your brand identity and AI preferences</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Basic Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary opacity-80">
                  <FileText className="w-4 h-4" />
                  Core Identity
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      Brand Name <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        required
                        value={formData.brandName}
                        onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-input border border-border text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="e.g. Acme Corp"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website URL</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        value={formData.websiteUrl}
                        onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-input border border-border text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="acme.com"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Description</label>
                  <textarea
                    value={formData.companyDescription}
                    onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-input border border-border text-sm focus:ring-2 focus:ring-primary/50 outline-none min-h-[100px] resize-none"
                    placeholder="Briefly describe what your company does and your unique value proposition..."
                  />
                </div>
              </div>

              {/* AI Strategy */}
              <div className="space-y-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-accent opacity-80">
                  <Target className="w-4 h-4" />
                  AI Personalization Strategy
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Industry</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-input border border-border text-sm focus:ring-2 focus:ring-accent/50 outline-none"
                        placeholder="e.g. SaaS, FinTech, Real Estate"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Audience</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        value={formData.targetAudience}
                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-input border border-border text-sm focus:ring-2 focus:ring-accent/50 outline-none"
                        placeholder="e.g. Marketing Managers, Founders"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preferred Tone</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        value={formData.tone}
                        onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-input border border-border text-sm focus:ring-2 focus:ring-accent/50 outline-none"
                        placeholder="e.g. Professional yet friendly, Direct, witty"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Primary Goal</label>
                    <div className="relative">
                      <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        value={formData.primaryGoal}
                        onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-input border border-border text-sm focus:ring-2 focus:ring-accent/50 outline-none"
                        placeholder="e.g. Book a demo, trial signups"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-8 flex items-center justify-end gap-4 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl bg-secondary text-foreground font-semibold hover:bg-secondary/80 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {editingBrand ? "Update Profile" : "Create Profile"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
