import React from 'react';
import {
  AlertTriangle,
  XCircle,
  FileWarning,
  Scale,
  ShieldAlert,
  ArrowRight,
  Download,
  Building,
  Calendar,
} from 'lucide-react';
import { InspectionRecord, LanguageCode } from '../types';
import { useTranslation } from '../lib/translations';

interface ViolationsViewProps {
  inspections: InspectionRecord[];
  onViewRecord: (record: InspectionRecord) => void;
  language: LanguageCode;
}

export const ViolationsView: React.FC<ViolationsViewProps> = ({
  inspections,
  onViewRecord,
  language,
}) => {
  const t = useTranslation(language);

  // Filter only records with non-compliant or review status
  const violationRecords = inspections.filter((i) => i.status !== 'COMPLIANT');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-red-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-700/50">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-rose-200 flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-200 text-xs font-bold uppercase tracking-wider border border-rose-400/30">
              <span>Statutory Offenses Docket</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Section 36 & PCR 2011 Non-Compliance Violations
            </h1>
            <p className="text-xs sm:text-sm text-rose-100/90 max-w-2xl leading-relaxed">
              Active enforcement registry for packaged commodities violating mandatory statutory declarations, non-standard unit sizes, misleading pricing, or absent USP declarations.
            </p>
          </div>
        </div>
      </div>

      {/* Violations Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Offenses Logged</span>
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600 mt-2">{violationRecords.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Requiring legal notice or compounding</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Unit Sale Price Violations</span>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">18</div>
          <p className="text-[11px] text-slate-500 mt-1">PCR Rule 6(11) mandatory unit rates</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Penal compounding rate</span>
            <Scale className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">₹ 25,000</div>
          <p className="text-[11px] text-slate-500 mt-1">Section 36(1) standard fine per offense</p>
        </div>
      </div>

      {/* Violations List */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm sm:text-base text-slate-900">
          Logged Offenses & Seizure Notices
        </h3>

        <div className="space-y-4">
          {violationRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-extrabold text-xs">
                    {record.memoNumber}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{record.commodityName}</h4>
                    <p className="text-xs text-slate-500">{record.category} • {record.manufacturer}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onViewRecord(record)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl transition-colors inline-flex items-center space-x-1"
                >
                  <span>View Full Memo & Evidence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Specific Findings List */}
              <div className="space-y-2">
                {record.findings?.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{f.ruleNumber} — {f.ruleTitle}</span>
                      <span className="text-[10px] text-rose-600 font-bold uppercase">
                        {f.penaltySection}
                      </span>
                    </div>
                    <p className="text-slate-600">
                      <strong>Observed Violation:</strong> {f.evidence}
                    </p>
                    <p className="text-slate-600">
                      <strong>Prescribed Legal Clause:</strong> {f.legalClause}
                    </p>
                  </div>
                ))}
              </div>

              {/* Establishment Footer */}
              <div className="pt-2 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
                <span>
                  <strong>Store / Location:</strong> {record.storeName} ({record.inspectionLocation})
                </span>
                <span>
                  <strong>Inspecting Officer:</strong> {record.officerName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
