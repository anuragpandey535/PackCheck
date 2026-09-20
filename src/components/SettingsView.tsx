import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Cpu,
  Sliders,
  Bell,
  Save,
  CheckCircle2,
  Database,
  Lock,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { useTranslation } from '../lib/translations';

interface SettingsViewProps {
  language: LanguageCode;
  onShowToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ language, onShowToast }) => {
  const t = useTranslation(language);

  const [ocrConfidenceThreshold, setOcrConfidenceThreshold] = useState<number>(85);
  const [autoFlagViolations, setAutoFlagViolations] = useState<boolean>(true);
  const [enforceUspMandate, setEnforceUspMandate] = useState<boolean>(true);
  const [strictFontHeightAudit, setStrictFontHeightAudit] = useState<boolean>(true);
  const [defaultJurisdiction, setDefaultJurisdiction] = useState<string>('Northern Enforcement Zone');

  const handleSave = () => {
    onShowToast('success', 'Settings Saved', 'Legal Metrology enforcement parameters updated successfully.');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#102A56] to-[#2563EB] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800/40">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-cyan-300 flex-shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {t('settings')} & Compliance Engine Configuration
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl">
              Configure OCR thresholds, Legal Metrology (PCR 2011) compliance rules, and digital memorandum seals.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Compliance & AI Parameters */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Cpu className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">AI Vision & OCR Engine</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                <span>OCR Confidence Score Threshold</span>
                <span className="text-blue-600 font-bold">{ocrConfidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min={60}
                max={99}
                value={ocrConfidenceThreshold}
                onChange={(e) => setOcrConfidenceThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Declarations below this threshold will be flagged for mandatory officer manual verification.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Automatic Rule 6 Violation Flagging
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Instantly tag missing declarations as offenses under Section 36.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoFlagViolations}
                  onChange={(e) => setAutoFlagViolations(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Strict Unit Sale Price (USP) Mandate (2022 Amendment)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Require ₹ per g / ml for all packages exceeding standard net quantities.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enforceUspMandate}
                  onChange={(e) => setEnforceUspMandate(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Font Height & Area Matrix Audit (Rule 7)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Verify font height against Principal Display Panel (PDP) area standards.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={strictFontHeightAudit}
                  onChange={(e) => setStrictFontHeightAudit(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Security & Enforcement Zone */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Lock className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Enforcement Authority & Digital Stamp</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Default Enforcement Zone
              </label>
              <select
                value={defaultJurisdiction}
                onChange={(e) => setDefaultJurisdiction(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-medium"
              >
                <option value="Northern Enforcement Zone">Northern Enforcement Zone (Delhi NCR / UP / Haryana)</option>
                <option value="Western Enforcement Zone">Western Enforcement Zone (Maharashtra / Gujarat)</option>
                <option value="Southern Enforcement Zone">Southern Enforcement Zone (Karnataka / TN / Telangana)</option>
                <option value="Eastern Enforcement Zone">Eastern Enforcement Zone (West Bengal / Odisha)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Digital Inspection Memo Prefix
              </label>
              <input
                type="text"
                readOnly
                value="LM/ENF/2026/[XXXX]"
                className="w-full px-3 py-2 bg-slate-100 rounded-xl border border-slate-200 font-mono text-slate-700"
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900">
              <span className="font-bold block text-[11px] uppercase">
                Legal Metrology Act, 2009 Standards
              </span>
              <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                Inspections conducted through this system conform to statutory evidentiary guidelines under Section 15 (Power of Inspection, Search & Seizure).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
};
