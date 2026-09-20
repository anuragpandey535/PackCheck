import React from 'react';
import {
  Users,
  Shield,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Award,
  Plus,
} from 'lucide-react';
import { INITIAL_OFFICERS } from '../lib/mockData';
import { LanguageCode } from '../types';
import { useTranslation } from '../lib/translations';

interface OfficersViewProps {
  language: LanguageCode;
}

export const OfficersView: React.FC<OfficersViewProps> = ({ language }) => {
  const t = useTranslation(language);

  const officers = [
    {
      id: 'lm-1',
      name: 'Insp. Aniket Verma',
      badgeId: 'LM-DEL-8942',
      designation: 'Senior Legal Metrology Officer',
      zone: 'Northern Enforcement Zone (Delhi NCR)',
      jurisdiction: 'District Central & Connaught Place',
      phone: '+91 98112 34567',
      email: 'a.verma.lm@gov.in',
      activeInspections: 48,
      status: 'Active Duty',
      avatar: 'AV',
    },
    {
      id: 'lm-2',
      name: 'Insp. Priya Sundaram',
      badgeId: 'LM-MAH-4412',
      designation: 'Inspector of Legal Metrology',
      zone: 'Western Enforcement Zone (Mumbai)',
      jurisdiction: 'BKC, Andheri East & West Marts',
      phone: '+91 98201 98765',
      email: 'p.sundaram.lm@gov.in',
      activeInspections: 36,
      status: 'Active Duty',
      avatar: 'PS',
    },
    {
      id: 'lm-3',
      name: 'Insp. Rajeshwar Rao',
      badgeId: 'LM-KAR-7719',
      designation: 'Assistant Controller of Metrology',
      zone: 'Southern Enforcement Zone (Bengaluru)',
      jurisdiction: 'Electronic City & Whitefield',
      phone: '+91 98450 11223',
      email: 'r.rao.lm@gov.in',
      activeInspections: 52,
      status: 'Active Duty',
      avatar: 'RR',
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#102A56] to-[#2563EB] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-cyan-300 flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Enforcement Officers & Jurisdiction Roster
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl">
                Authorized Legal Metrology inspectors, badge credentials, and territorial enforcement zones.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5 shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Add Enforcement Officer</span>
          </button>
        </div>
      </div>

      {/* Officers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {officers.map((officer) => (
          <div
            key={officer.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                  {officer.avatar}
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  {officer.status}
                </span>
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-sm text-slate-900">{officer.name}</h3>
                <p className="text-xs text-blue-600 font-semibold">{officer.designation}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Badge: {officer.badgeId}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{officer.zone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{officer.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{officer.email}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Audits Completed</span>
              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                {officer.activeInspections} Memos
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
