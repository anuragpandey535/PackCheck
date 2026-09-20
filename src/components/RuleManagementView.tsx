import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Scale,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { LEGAL_METROLOGY_RULES } from '../lib/metrologyRules';
import { LanguageCode } from '../types';
import { useTranslation } from '../lib/translations';

interface RuleManagementViewProps {
  language: LanguageCode;
}

export const RuleManagementView: React.FC<RuleManagementViewProps> = ({ language }) => {
  const t = useTranslation(language);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(LEGAL_METROLOGY_RULES[0]?.id || null);

  const categories = [
    'ALL',
    'Manufacturer Identity',
    'Commodity Identity',
    'Quantity & Units',
    'Pricing',
    'Unit Pricing',
    'Origin',
    'Consumer Grievance',
    'Legibility & Area',
  ];

  const filteredRules = LEGAL_METROLOGY_RULES.filter((r) => {
    const matchSearch =
      r.ruleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.applicableActSection.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory = selectedCategory === 'ALL' || r.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#102A56] via-[#1a3d75] to-[#2563EB] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800/40">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider border border-cyan-400/30">
              <span>Statutory Rule Catalog</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Legal Metrology (Packaged Commodities) Rules, 2011
            </h1>
            <p className="text-xs sm:text-sm text-slate-200/90 max-w-2xl leading-relaxed">
              Enforcement statutory rules including mandatory declarations (Rule 6), font height matrices (Rule 7), net quantity standards (Rule 12), unit sale price mandate (2022 amendment), and Section 36 penalties.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search rule number, keyword (e.g. Unit Sale Price, MRP, Font Size)..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rules List Accordion */}
      <div className="space-y-3">
        {filteredRules.map((rule) => {
          const isExpanded = expandedRuleId === rule.id;

          return (
            <div
              key={rule.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all"
            >
              <div
                onClick={() => setExpandedRuleId(isExpanded ? null : rule.id)}
                className="p-5 cursor-pointer hover:bg-slate-50 flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {rule.ruleNumber}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border">
                        {rule.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-xs sm:text-sm text-slate-800 mt-0.5">
                      {rule.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                    aria-label="Toggle rule details"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Rule Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Statutory Description & Mandate:</h4>
                    <p className="text-slate-700 leading-relaxed">{rule.description}</p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-blue-100">
                    <span className="font-bold text-slate-900 block text-[11px] uppercase">
                      Mandatory Requirement Details
                    </span>
                    <p className="text-slate-700 mt-1 font-medium">{rule.mandatoryRequirement}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 block text-[11px] uppercase">
                        Legal Metrology Act Clause
                      </span>
                      <p className="text-slate-700 mt-1 font-medium">{rule.applicableActSection}</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-rose-200 bg-rose-50/30">
                      <span className="font-bold text-rose-900 block text-[11px] uppercase">
                        Penal Compounding & Punishment
                      </span>
                      <p className="text-rose-800 mt-1 font-medium">
                        1st Offense: {rule.penaltyFirstOffense}
                        <br />
                        Subsequent: {rule.penaltySubsequent}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
