import React, { useState, useEffect } from 'react';
import {
  Camera,
  Plus,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Search,
  Eye,
  CheckCircle2,
  Scale,
  Sparkles,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  ChevronRight,
  Building,
} from 'lucide-react';
import { InspectionRecord, LanguageCode } from '../types';
import { useTranslation } from '../lib/translations';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

interface DashboardViewProps {
  inspections: InspectionRecord[];
  onStartNewInspection: () => void;
  onViewInspection: (record: InspectionRecord) => void;
  onOpenQuickCamera: () => void;
  language: LanguageCode;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  inspections,
  onStartNewInspection,
  onViewInspection,
  onOpenQuickCamera,
  language,
}) => {
  const t = useTranslation(language);

  // Compute metrics
  const total = inspections.length;
  const compliantCount = inspections.filter((i) => i.status === 'COMPLIANT').length;
  const reviewCount = inspections.filter((i) => i.status === 'REVIEW_REQUIRED').length;
  const nonCompliantCount = inspections.filter((i) => i.status === 'NON_COMPLIANT').length;
  const complianceRate = total > 0 ? Math.round((compliantCount / total) * 100) : 0;

  // Pie chart data
  const pieData = [
    { name: 'Compliant', value: compliantCount, color: '#10B981' },
    { name: 'Needs Review', value: reviewCount, color: '#F59E0B' },
    { name: 'Non-Compliant', value: nonCompliantCount, color: '#EF4444' },
  ];

  // Activity trend data
  const activityData = [
    { day: 'Mon', compliant: 4, nonCompliant: 1 },
    { day: 'Tue', compliant: 7, nonCompliant: 2 },
    { day: 'Wed', compliant: 5, nonCompliant: 3 },
    { day: 'Thu', compliant: 8, nonCompliant: 1 },
    { day: 'Fri', compliant: 6, nonCompliant: 2 },
    { day: 'Sat', compliant: 9, nonCompliant: 2 },
    { day: 'Sun', compliant: total > 5 ? compliantCount : 5, nonCompliant: nonCompliantCount },
  ];

  // Violation categories data
  const violationCategories = [
    { category: 'Rule 6(11) Unit Sale Price (USP)', count: 18, percentage: 38, color: 'bg-rose-500' },
    { category: 'Rule 6(10) Country of Origin', count: 14, percentage: 30, color: 'bg-amber-500' },
    { category: 'Rule 7 Font Size & PDP', count: 9, percentage: 19, color: 'bg-cyan-500' },
    { category: 'Rule 6(1)(g) Consumer Care Details', count: 6, percentage: 13, color: 'bg-blue-500' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Hero Banner with Government & AI Theme */}
      <div
        id="dashboard-hero-banner"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#102A56] via-[#16366f] to-[#2563EB] text-white p-6 sm:p-8 shadow-2xl border border-blue-800/40"
      >
        {/* Subtle decorative background circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin-slow" />
              <span>AI-Powered Legal Metrology Enforcement</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {t('hero_title')}
            </h1>

            <p className="text-slate-200 text-xs sm:text-sm sm:leading-relaxed leading-normal text-opacity-90 max-w-xl">
              {t('hero_desc')}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-cyan-200/90 font-medium">
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>PCR 2011 Rules</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>2022 USP Mandate</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Section 36 Offenses</span>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:self-center">
            <button
              id="btn-hero-new-inspection"
              type="button"
              onClick={onStartNewInspection}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm transition-all flex items-center justify-center space-x-2.5 shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-blue-600 font-extrabold" />
              <span>{t('btn_new_inspection')}</span>
            </button>

            <button
              id="btn-hero-quick-camera"
              type="button"
              onClick={onOpenQuickCamera}
              className="px-5 py-3 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 font-semibold text-sm transition-all flex items-center justify-center space-x-2.5 backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <Camera className="w-4 h-4 text-cyan-300" />
              <span>{t('btn_quick_scan')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Total Inspections */}
        <div
          id="kpi-total-inspections"
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all border-t-4 border-t-blue-600 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('total_inspections')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{total}</div>
            <div className="flex items-center space-x-1 mt-1 text-[11px] text-emerald-600 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+12% this week</span>
            </div>
          </div>
        </div>

        {/* Card 2: Compliant */}
        <div
          id="kpi-compliant"
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all border-t-4 border-t-emerald-500 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('compliant')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{compliantCount}</div>
            <div className="flex items-center space-x-1 mt-1 text-[11px] text-slate-500 font-medium">
              <span>{Math.round((compliantCount / (total || 1)) * 100)}% of total verified</span>
            </div>
          </div>
        </div>

        {/* Card 3: Needs Review */}
        <div
          id="kpi-needs-review"
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all border-t-4 border-t-amber-500 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('needs_review')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">{reviewCount}</div>
            <div className="flex items-center space-x-1 mt-1 text-[11px] text-amber-600 font-semibold">
              <span>Technical Advisories</span>
            </div>
          </div>
        </div>

        {/* Card 4: Non-Compliant */}
        <div
          id="kpi-non-compliant"
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all border-t-4 border-t-rose-500 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('non_compliant')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">{nonCompliantCount}</div>
            <div className="flex items-center space-x-1 mt-1 text-[11px] text-rose-600 font-semibold">
              <span>Notice / Seizure</span>
            </div>
          </div>
        </div>

        {/* Card 5: Compliance Rate */}
        <div
          id="kpi-compliance-rate"
          className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all border-t-4 border-t-cyan-500 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('compliance_rate')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{complianceRate}%</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${complianceRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modern Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Donut Overview */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Compliance Overview</h3>
              <p className="text-xs text-slate-500">Statutory breakdown of inspected commodities</p>
            </div>
            <PieChartIcon className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex-1 flex items-center justify-center py-4 min-h-[220px]">
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} Inspections`, 'Count']}
                  contentStyle={{
                    borderRadius: '12px',
                    backgroundColor: '#0f172a',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend chips */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
              <div className="text-xs font-bold">{compliantCount}</div>
              <div className="text-[10px] text-emerald-600">Compliant</div>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800">
              <div className="text-xs font-bold">{reviewCount}</div>
              <div className="text-[10px] text-amber-600">Review</div>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-800">
              <div className="text-xs font-bold">{nonCompliantCount}</div>
              <div className="text-[10px] text-rose-600">Violations</div>
            </div>
          </div>
        </div>

        {/* Weekly Inspection Activity Bar Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Inspection & Enforcement Activity</h3>
              <p className="text-xs text-slate-500">Weekly trend of compliant vs non-compliant packages</p>
            </div>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex-1 py-3 min-h-[220px]">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    backgroundColor: '#0f172a',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="compliant" name="Compliant Packages" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="nonCompliant" name="Statutory Violations" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Violation Categories Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Frequent Violation Categories (PCR 2011)</h3>
            <p className="text-xs text-slate-500">Aggregated breakdown of non-compliance causes detected by AI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {violationCategories.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 truncate pr-2">{item.category}</span>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {item.count} cases ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`${item.color} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Package Inspections Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">{t('recent_inspections')}</h3>
            <p className="text-xs text-slate-500">Real-time enforcement logs with inspection memorandum records</p>
          </div>

          <button
            id="btn-dashboard-view-all"
            type="button"
            onClick={onStartNewInspection}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1"
          >
            <span>Start Fresh Audit</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">{t('memo_number')}</th>
                <th className="px-5 py-3.5">{t('commodity')}</th>
                <th className="px-5 py-3.5">{t('status')}</th>
                <th className="px-5 py-3.5">{t('score')}</th>
                <th className="px-5 py-3.5">Officer / Location</th>
                <th className="px-5 py-3.5 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inspections.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                    {record.memoNumber}
                    <span className="block text-[10px] text-slate-400 font-normal">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-900 max-w-xs truncate">{record.commodityName}</div>
                    <div className="text-[11px] text-slate-500">{record.category}</div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {record.status === 'COMPLIANT' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Compliant</span>
                      </span>
                    ) : record.status === 'REVIEW_REQUIRED' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Needs Review</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        <span>Non-Compliant</span>
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{record.score}%</span>
                      <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            record.score >= 85
                              ? 'bg-emerald-500'
                              : record.score >= 60
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${record.score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-slate-900 font-medium">{record.officerName}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-xs">
                      {record.storeName || record.inspectionLocation}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <button
                      id={`btn-view-inspection-${record.id}`}
                      type="button"
                      onClick={() => onViewInspection(record)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold text-xs transition-colors inline-flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Report</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
