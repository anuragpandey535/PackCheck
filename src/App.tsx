import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { NewInspectionView } from './components/NewInspectionView';
import { InspectionHistoryView } from './components/InspectionHistoryView';
import { ViolationsView } from './components/ViolationsView';
import { RuleManagementView } from './components/RuleManagementView';
import { OfficersView } from './components/OfficersView';
import { SettingsView } from './components/SettingsView';
import { StatutoryReportDocument } from './components/StatutoryReportDocument';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { ToastContainer } from './components/ToastContainer';
import { INITIAL_INSPECTIONS } from './lib/mockData';
import { InspectionRecord, LanguageCode, ToastMessage, LabelType } from './types';
import { ArrowLeft } from 'lucide-react';

const STORAGE_KEY = 'packcheck_inspections_v2';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedRecord, setSelectedRecord] = useState<InspectionRecord | null>(null);

  // App Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Global Quick Camera Modal
  const [isQuickCameraOpen, setIsQuickCameraOpen] = useState<boolean>(false);

  // Inspections Registry Data with Persistent LocalStorage Initializer
  const [inspections, setInspections] = useState<InspectionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read inspections from localStorage:', e);
    }
    return INITIAL_INSPECTIONS;
  });

  // Sync with Server Filesystem Storage on startup
  useEffect(() => {
    const syncWithServer = async () => {
      try {
        const response = await fetch('/api/inspections');
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.inspections) && data.inspections.length > 0) {
            setInspections(data.inspections);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.inspections));
            return;
          }
        }

        // If server store is empty, seed it with current inspections
        await fetch('/api/inspections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ records: inspections }),
        });
      } catch (err) {
        console.warn('Server filesystem sync unavailable, operating in offline browser storage mode:', err);
      }
    };

    syncWithServer();
  }, []);

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    type: 'success' | 'warning' | 'error' | 'info',
    title: string,
    message: string
  ) => {
    const newToast: ToastMessage = {
      id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      message,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Add newly sealed inspection record (Persisted to LocalStorage and Server Disk)
  const handleSaveInspection = (newRecord: InspectionRecord) => {
    setInspections((prev) => {
      const updated = [newRecord, ...prev.filter((r) => r.id !== newRecord.id)];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed writing to localStorage:', e);
      }
      return updated;
    });

    setSelectedRecord(newRecord);

    // Persist to Server Disk asynchronously
    fetch('/api/inspections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ record: newRecord }),
    })
      .then((res) => res.json())
      .then(() => {
        showToast(
          'success',
          'Record Permanently Archived',
          `Memo #${newRecord.memoNumber} stored to legal metrology history registry.`
        );
      })
      .catch((err) => {
        console.warn('Could not persist to server storage, preserved in browser storage:', err);
      });
  };

  // Handle Quick Camera Capture
  const handleQuickCapture = (file: File, previewUrl: string, labelType: LabelType) => {
    setIsQuickCameraOpen(false);
    setActiveTab('new-inspection');
    showToast('success', 'Photo Captured', 'Opening New Inspection with captured photo.');
  };

  // View full statutory report for a selected record
  const handleViewInspection = (record: InspectionRecord) => {
    setSelectedRecord(record);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col lg:flex-row antialiased font-sans">
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Global Quick Camera Modal */}
      <CameraCaptureModal
        isOpen={isQuickCameraOpen}
        onClose={() => setIsQuickCameraOpen(false)}
        onCapture={handleQuickCapture}
        defaultLabelType="front"
      />

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar
        activeTab={selectedRecord ? 'reports' : activeTab}
        onTabChange={(tab) => {
          setSelectedRecord(null);
          setActiveTab(tab === 'overview' ? 'dashboard' : tab === 'violations' ? 'compliance' : tab);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        language={language}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header */}
        <Header
          activeTab={selectedRecord ? 'reports' : activeTab}
          onTabChange={(tab) => {
            setSelectedRecord(null);
            setActiveTab(tab === 'overview' ? 'dashboard' : tab === 'violations' ? 'compliance' : tab);
          }}
          language={language}
          onLanguageChange={(l) => {
            setLanguage(l);
            showToast('info', 'Language Updated', `Display language switched.`);
          }}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          searchQuery={searchQuery}
          onSearchQuery={setSearchQuery}
        />

        {/* Dynamic Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Individual Report View when a record is selected */}
          {selectedRecord ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="no-print px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors flex items-center space-x-1.5 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Inspection List</span>
              </button>

              <StatutoryReportDocument
                record={selectedRecord}
                onPrint={() => window.print()}
              />
            </div>
          ) : (
            <>
              {/* Tab: Dashboard */}
              {activeTab === 'dashboard' && (
                <DashboardView
                  inspections={inspections}
                  onStartNewInspection={() => setActiveTab('new-inspection')}
                  onViewInspection={handleViewInspection}
                  onOpenQuickCamera={() => setIsQuickCameraOpen(true)}
                  language={language}
                />
              )}

              {/* Tab: New Inspection Workflow */}
              {activeTab === 'new-inspection' && (
                <NewInspectionView
                  onSaveInspection={handleSaveInspection}
                  onCancel={() => setActiveTab('dashboard')}
                  language={language}
                  onShowToast={showToast}
                  initialCameraOpen={false}
                />
              )}

              {/* Tab: History */}
              {activeTab === 'history' && (
                <InspectionHistoryView
                  inspections={inspections}
                  onViewRecord={handleViewInspection}
                  language={language}
                />
              )}

              {/* Tab: Reports & Documents */}
              {activeTab === 'reports' && (
                <InspectionHistoryView
                  inspections={inspections}
                  onViewRecord={handleViewInspection}
                  language={language}
                />
              )}

              {/* Tab: Rule Management */}
              {activeTab === 'rules' && <RuleManagementView language={language} />}

              {/* Tab: Compliance Results */}
              {activeTab === 'compliance' && (
                <ViolationsView
                  inspections={inspections}
                  onViewRecord={handleViewInspection}
                  language={language}
                />
              )}

              {/* Tab: Officers */}
              {activeTab === 'officers' && <OfficersView language={language} />}

              {/* Tab: Settings */}
              {activeTab === 'settings' && (
                <SettingsView language={language} onShowToast={showToast} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
