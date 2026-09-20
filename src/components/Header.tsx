import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Globe,
  ChevronDown,
  ShieldCheck,
  User,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { LANGUAGES, useTranslation } from '../lib/translations';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onToggleMobileSidebar: () => void;
  onSearchQuery?: (q: string) => void;
  searchQuery?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  language,
  onLanguageChange,
  onToggleMobileSidebar,
  onSearchQuery,
  searchQuery = '',
}) => {
  const t = useTranslation(language);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard':
        return { section: 'MAIN', page: t('dashboard') };
      case 'new-inspection':
        return { section: 'INSPECTIONS', page: t('new_inspection') };
      case 'history':
        return { section: 'INSPECTIONS', page: t('inspection_history') };
      case 'compliance':
        return { section: 'COMPLIANCE', page: t('compliance_results') };
      case 'violations':
        return { section: 'COMPLIANCE', page: t('violations') };
      case 'rules':
        return { section: 'COMPLIANCE', page: t('rule_management') };
      case 'reports':
        return { section: 'REPORTS', page: t('inspection_reports') };
      case 'officers':
        return { section: 'SYSTEM', page: t('officers') };
      case 'settings':
        return { section: 'SYSTEM', page: t('settings') };
      default:
        return { section: 'MAIN', page: t('dashboard') };
    }
  };

  const breadcrumb = getBreadcrumb();
  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5 sm:py-3 transition-all"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Hamburger & Breadcrumb */}
        <div className="flex items-center space-x-3">
          <button
            id="btn-sidebar-hamburger"
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <span className="text-slate-600 font-medium hidden sm:inline tracking-wider uppercase text-[11px]">
              {breadcrumb.section}
            </span>
            <span className="text-slate-600 hidden sm:inline">/</span>
            <span className="font-semibold text-slate-900 flex items-center space-x-1.5">
              <span>{breadcrumb.page}</span>
            </span>
          </div>

          {/* System Status Pill */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[11px] font-medium text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t('system_online')}</span>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="header-global-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQuery && onSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Right Side: Actions, Language & Officer Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="btn-header-notifications"
              type="button"
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsLangOpen(false);
                setIsProfileOpen(false);
              }}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
            </button>

            {isNotifOpen && (
              <div
                id="header-notifications-dropdown"
                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-40 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900">Enforcement Alerts</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded-full">
                    2 New
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  <div className="p-3 hover:bg-slate-50 transition-colors flex items-start space-x-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-slate-900">Missing USP Alert</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Inspection #0889 identified missing Unit Sale Price on cosmetics stock.
                      </p>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-slate-50 transition-colors flex items-start space-x-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-slate-900">Compliance Audit Approved</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Memo #0891 organic honey package certified 100% PCR compliant.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Regional Language Switcher */}
          <div className="relative">
            <button
              id="btn-header-language-toggle"
              type="button"
              onClick={() => {
                setIsLangOpen(!isLangOpen);
                setIsNotifOpen(false);
                setIsProfileOpen(false);
              }}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-all"
              aria-label="Change language"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">{currentLangObj.native}</span>
              <span className="sm:hidden">{currentLangObj.code.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isLangOpen && (
              <div
                id="header-language-dropdown"
                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Select Regional Language
                </div>
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    id={`btn-lang-${l.code}`}
                    type="button"
                    onClick={() => {
                      onLanguageChange(l.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      language === l.code ? 'bg-blue-50/70 text-blue-700 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{l.native}</span>
                      <span className="text-slate-600 text-[11px]">({l.label})</span>
                    </span>
                    {language === l.code && <CheckCircle className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Officer Profile Badge */}
          <div className="relative">
            <button
              id="btn-header-profile-toggle"
              type="button"
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotifOpen(false);
                setIsLangOpen(false);
              }}
              className="flex items-center space-x-2 p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-slate-100 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-blue-700/20">
                AV
              </div>
              <div className="hidden xl:block">
                <div className="text-xs font-semibold text-slate-900 leading-tight">Insp. A. Verma</div>
                <div className="text-[10px] text-slate-500 leading-tight">Legal Metrology Officer</div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
            </button>

            {isProfileOpen && (
              <div
                id="header-profile-dropdown"
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-40 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-sm">
                    AV
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Insp. Aniket Verma</h4>
                    <p className="text-[11px] text-slate-500">Badge: LM-DEL-8942</p>
                    <p className="text-[10px] text-blue-600 font-medium">Northern Zone • Active</p>
                  </div>
                </div>

                <div className="pt-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('officers');
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Officer Roster & Zone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Enforcement Settings</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
