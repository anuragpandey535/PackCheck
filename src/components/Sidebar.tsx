import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Camera,
  History,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  FileText,
  FileDown,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Scale,
  Sparkles,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { useTranslation } from '../lib/translations';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  language: LanguageCode;
  inspectionsCount?: number;
  violationsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  language,
  inspectionsCount,
  violationsCount,
}) => {
  const t = useTranslation(language);

  interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }

  interface NavGroup {
    title: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      title: t('main_section'),
      items: [
        { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
      ],
    },
    {
      title: t('inspections_section'),
      items: [
        { id: 'new-inspection', label: t('new_inspection'), icon: Camera, badge: 'AI Scan' },
        {
          id: 'history',
          label: t('inspection_history'),
          icon: History,
          badge: typeof inspectionsCount === 'number' ? `${inspectionsCount}` : undefined,
        },
      ],
    },
    {
      title: t('compliance_section'),
      items: [
        {
          id: 'compliance',
          label: t('compliance_results'),
          icon: ShieldCheck,
          badge: typeof violationsCount === 'number' && violationsCount > 0 ? `${violationsCount} Violations` : undefined,
        },
        { id: 'rules', label: t('rule_management'), icon: BookOpen },
      ],
    },
    {
      title: t('reports_section'),
      items: [
        { id: 'reports', label: t('inspection_reports'), icon: FileText },
      ],
    },
    {
      title: t('system_section'),
      items: [
        { id: 'officers', label: t('officers'), icon: Users },
        { id: 'settings', label: t('settings'), icon: Settings },
      ],
    },
  ];

  const handleItemClick = (id: string) => {
    onTabChange(id);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#102A56] text-slate-200 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-blue-900/60 bg-[#0c2246]">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-teal-400 p-0.5 shadow-lg shadow-blue-500/20 flex-shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-[#102A56] rounded-[10px] flex items-center justify-center">
              <Scale className="w-5 h-5 text-cyan-400" />
            </div>
          </div>

          {!isCollapsed && (
            <div className="min-w-0 transition-opacity duration-200">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">
                  PACKCHECK
                </span>
                <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/30 text-cyan-300 font-semibold rounded border border-cyan-400/30">
                  GOV
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                Legal Metrology Enforcement
              </p>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        {isMobileOpen && (
          <button
            id="btn-close-mobile-sidebar"
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!isCollapsed ? (
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {group.title}
              </div>
            ) : (
              <div className="h-px bg-blue-900/40 my-2 mx-1" />
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <div key={item.id} className="relative group">
                    <button
                      id={`nav-item-${item.id}`}
                      type="button"
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center rounded-xl transition-all text-xs sm:text-sm font-medium ${
                        isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 space-x-3'
                      } ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border-l-4 border-cyan-300 pl-2.5'
                          : 'text-slate-300 hover:text-white hover:bg-blue-900/40 border-l-4 border-transparent'
                      }`}
                    >
                      <IconComponent
                        className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-300'
                        }`}
                      />

                      {!isCollapsed && (
                        <span className="flex-1 text-left truncate">{item.label}</span>
                      )}

                      {!isCollapsed && item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-blue-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>

                    {/* Tooltip for collapsed desktop mode */}
                    {isCollapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-700 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                        {item.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info / Desktop Collapse Toggle */}
      <div className="p-3 border-t border-blue-900/60 bg-[#0c2246] flex items-center justify-between">
        {!isCollapsed && (
          <div className="text-[10px] text-slate-400 leading-tight">
            <p className="font-semibold text-slate-300">PCR 2011 • Sec 36</p>
            <p className="text-slate-500">Legal Metrology Act</p>
          </div>
        )}

        <button
          id="btn-sidebar-collapse-toggle"
          type="button"
          onClick={onToggleCollapse}
          className={`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-blue-900/60 transition-colors hidden lg:flex items-center justify-center ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label="Toggle sidebar collapse"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        id="desktop-sidebar-container"
        className={`hidden lg:block h-screen sticky top-0 flex-shrink-0 transition-all duration-300 ease-in-out z-30 shadow-xl ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Drawer */}
      {isMobileOpen && (
        <div
          id="mobile-sidebar-drawer-overlay"
          className="lg:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Container */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
