import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  FileText,
  Printer,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building,
  Scale,
  ChevronDown,
  Layers,
  Boxes,
  List,
  ShieldCheck,
  ShieldAlert,
  Tag,
  Package,
} from 'lucide-react';
import { InspectionRecord, LanguageCode, ComplianceStatus } from '../types';
import { useTranslation } from '../lib/translations';

interface InspectionHistoryViewProps {
  inspections: InspectionRecord[];
  onViewRecord: (record: InspectionRecord) => void;
  language: LanguageCode;
}

export const InspectionHistoryView: React.FC<InspectionHistoryViewProps> = ({
  inspections,
  onViewRecord,
  language,
}) => {
  const t = useTranslation(language);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [batchFilter, setBatchFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'batch' | 'list'>('batch');
  const [expandedBatches, setExpandedBatches] = useState<{ [key: string]: boolean }>({});

  // Extract all distinct batches
  const distinctBatches = useMemo(() => {
    const set = new Set<string>();
    inspections.forEach((item) => {
      set.add(item.batchNumber || 'Unassigned / Lot-N/A');
    });
    return Array.from(set);
  }, [inspections]);

  // Filter list
  const filtered = useMemo(() => {
    return inspections.filter((item) => {
      const bNo = item.batchNumber || 'Unassigned / Lot-N/A';
      const matchSearch =
        item.commodityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.memoNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bNo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchBatch = batchFilter === 'ALL' || bNo === batchFilter;

      return matchSearch && matchStatus && matchCategory && matchBatch;
    });
  }, [inspections, searchTerm, statusFilter, categoryFilter, batchFilter]);

  // Group records by Batch Number for Batch Segregation View
  const batchGroups = useMemo(() => {
    const groups: {
      [key: string]: {
        batchNumber: string;
        manufacturer: string;
        category: string;
        records: InspectionRecord[];
        totalInspected: number;
        compliantCount: number;
        violationCount: number;
        reviewCount: number;
        avgScore: number;
        lotSize?: number;
        samplesTested?: number;
        batchStatus: ComplianceStatus;
      };
    } = {};

    filtered.forEach((rec) => {
      const bNo = rec.batchNumber || 'Unassigned / Lot-N/A';
      if (!groups[bNo]) {
        groups[bNo] = {
          batchNumber: bNo,
          manufacturer: rec.manufacturer || 'Unknown Manufacturer',
          category: rec.category,
          records: [],
          totalInspected: 0,
          compliantCount: 0,
          violationCount: 0,
          reviewCount: 0,
          avgScore: 0,
          lotSize: rec.lotSize,
          samplesTested: rec.samplesTested,
          batchStatus: 'COMPLIANT',
        };
      }

      groups[bNo].records.push(rec);
      groups[bNo].totalInspected += 1;
      if (rec.status === 'COMPLIANT') groups[bNo].compliantCount += 1;
      else if (rec.status === 'NON_COMPLIANT') groups[bNo].violationCount += 1;
      else groups[bNo].reviewCount += 1;
    });

    // Compute metrics per batch
    Object.values(groups).forEach((g) => {
      const sumScore = g.records.reduce((acc, r) => acc + (r.score || 0), 0);
      g.avgScore = Math.round(sumScore / g.records.length);

      if (g.violationCount > 0) {
        g.batchStatus = 'NON_COMPLIANT';
      } else if (g.reviewCount > 0) {
        g.batchStatus = 'REVIEW_REQUIRED';
      } else {
        g.batchStatus = 'COMPLIANT';
      }
    });

    return groups;
  }, [filtered]);

  const toggleBatchExpand = (batchKey: string) => {
    setExpandedBatches((prev) => ({
      ...prev,
      [batchKey]: prev[batchKey] === undefined ? false : !prev[batchKey],
    }));
  };

  const totalBatchesCount = Object.keys(batchGroups).length;
  const compliantBatchesCount = Object.values(batchGroups).filter(
    (b) => b.batchStatus === 'COMPLIANT'
  ).length;
  const violationBatchesCount = Object.values(batchGroups).filter(
    (b) => b.batchStatus === 'NON_COMPLIANT'
  ).length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner with Batch Segregation Metrics */}
      <div className="bg-gradient-to-br from-[#102A56] via-[#1a3d75] to-[#2563EB] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider border border-cyan-400/30">
              <Boxes className="w-3.5 h-3.5" />
              <span>Batch Identification & Segregation Registry</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {t('inspection_history')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200/90 max-w-2xl leading-relaxed">
              Track statutory declarations, identify individual product Batch Numbers (B.No.), and segregate consignment batches under Legal Metrology Rules, 2011.
            </p>
          </div>

          {/* Quick View Toggle */}
          <div className="flex items-center bg-black/30 p-1 rounded-2xl border border-white/10 backdrop-blur-sm self-start md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('batch')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                viewMode === 'batch'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Segregate by Batch</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List View</span>
            </button>
          </div>
        </div>

        {/* Batch KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="text-[11px] font-semibold text-cyan-200 uppercase tracking-wider">
              Total Monitored Batches
            </div>
            <div className="text-2xl font-extrabold mt-1">{totalBatchesCount} Batches</div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              {filtered.length} total inspection memo records
            </div>
          </div>

          <div className="bg-emerald-500/10 backdrop-blur-md rounded-2xl p-4 border border-emerald-400/20">
            <div className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Fully Compliant Batches</span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-300 mt-1">
              {compliantBatchesCount} Batches
            </div>
            <div className="text-[11px] text-emerald-200/80 mt-0.5">
              Passed all Rule 6 statutory clauses
            </div>
          </div>

          <div className="bg-rose-500/10 backdrop-blur-md rounded-2xl p-4 border border-rose-400/20">
            <div className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Batches with Violations</span>
            </div>
            <div className="text-2xl font-extrabold text-rose-300 mt-1">
              {violationBatchesCount} Batches
            </div>
            <div className="text-[11px] text-rose-200/80 mt-0.5">
              Section 36 notices dispatched
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Filter & Segregate Inspections
            </h3>
          </div>

          <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded-lg border border-blue-200 w-fit">
            {filtered.length} Package Record(s) across {totalBatchesCount} Batch(es)
          </span>
        </div>

        {/* Search & Select Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search by Text / Batch */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Batch No, Memo, Commodity..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-all font-medium"
            />
          </div>

          {/* Batch Selector Dropdown */}
          <div>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none font-medium"
            >
              <option value="ALL">All Batch Numbers ({distinctBatches.length})</option>
              {distinctBatches.map((b) => (
                <option key={b} value={b}>
                  Batch: {b}
                </option>
              ))}
            </select>
          </div>

          {/* Compliance Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none font-medium"
            >
              <option value="ALL">All Compliance Statuses</option>
              <option value="COMPLIANT">Statutorily Compliant</option>
              <option value="REVIEW_REQUIRED">Needs Review / Advisory</option>
              <option value="NON_COMPLIANT">Non-Compliant / Violation</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="Food & Beverages">Food & Beverages</option>
              <option value="Cosmetics & Personal Care">Cosmetics & Personal Care</option>
              <option value="Pharmaceuticals & Health">Pharmaceuticals & Health</option>
              <option value="Household Products">Household Products</option>
              <option value="General Pre-Packaged">General Pre-Packaged</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: BATCH SEGREGATION VIEW */}
      {viewMode === 'batch' && (
        <div className="space-y-4">
          {Object.keys(batchGroups).length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 space-y-2">
              <Boxes className="w-10 h-10 mx-auto text-slate-400" />
              <h4 className="font-bold text-sm text-slate-800">No Batches Matching Filter</h4>
              <p className="text-xs text-slate-400">Try adjusting your search keyword or clearing the filters.</p>
            </div>
          ) : (
            Object.values(batchGroups).map((group) => {
              const isExpanded = expandedBatches[group.batchNumber] !== false; // default expanded

              return (
                <div
                  key={group.batchNumber}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all"
                >
                  {/* Batch Header Bar */}
                  <div
                    onClick={() => toggleBatchExpand(group.batchNumber)}
                    className="p-5 cursor-pointer hover:bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 transition-colors"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm">
                        <Tag className="w-5 h-5 text-blue-600" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-extrabold text-sm sm:text-base text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            Batch No: {group.batchNumber}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {group.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">
                          Manufacturer: <strong className="text-slate-900">{group.manufacturer}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Batch Summary Stats & Badge */}
                    <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
                      <div className="text-right text-xs mr-2 hidden sm:block">
                        <div className="text-slate-500 font-medium">
                          Tested: <strong>{group.records.length} package(s)</strong>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Batch Quality Score: <strong>{group.avgScore}%</strong>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {group.batchStatus === 'COMPLIANT' ? (
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>BATCH COMPLIANT</span>
                        </span>
                      ) : group.batchStatus === 'REVIEW_REQUIRED' ? (
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>ADVISORY / REVIEW</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>BATCH VIOLATIONS ({group.violationCount})</span>
                        </span>
                      )}

                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Segregated Product Package Records in this Batch */}
                  {isExpanded && (
                    <div className="bg-slate-50/50 p-4 sm:p-5 space-y-3">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between px-1">
                        <span>Segregated Products Inspected under Batch #{group.batchNumber}</span>
                        <span className="text-[11px] font-normal text-slate-400">
                          {group.records.length} unit(s) sampled
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {group.records.map((record) => {
                          const isLatest = record.id === inspections[0]?.id;
                          return (
                            <div
                              key={record.id}
                              className={`p-3.5 sm:p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                                isLatest
                                  ? 'bg-blue-50/40 border-blue-300 ring-2 ring-blue-500/20'
                                  : 'bg-white border-slate-200 hover:border-blue-400'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                                    {record.commodityName}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    ({record.memoNumber})
                                  </span>
                                  {isLatest && (
                                    <span className="px-1.5 py-0.5 bg-blue-600 text-white font-extrabold text-[9px] rounded uppercase tracking-wider animate-pulse">
                                      Latest
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                  <span>Qty: <strong className="text-slate-700">{record.netQuantity}</strong></span>
                                  <span>MRP: <strong className="text-slate-700">{record.mrp}</strong></span>
                                  <span>Mfg Date: <strong className="text-slate-700">{record.mfgDate || 'N/A'}</strong></span>
                                  <span>Store: <strong className="text-slate-700">{record.storeName}</strong></span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3 self-end sm:self-auto">
                                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                  record.status === 'COMPLIANT'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : record.status === 'REVIEW_REQUIRED'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                  {record.status === 'COMPLIANT' ? 'Passed' : record.status === 'REVIEW_REQUIRED' ? 'Review' : 'Offense'}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => onViewRecord(record)}
                                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold text-xs transition-colors inline-flex items-center space-x-1"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Memo</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW MODE 2: STANDARD LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Memo Reference</th>
                  <th className="px-5 py-3.5">Batch / Lot No.</th>
                  <th className="px-5 py-3.5">Inspected Commodity</th>
                  <th className="px-5 py-3.5">Manufacturer / Brand</th>
                  <th className="px-5 py-3.5">Compliance Status</th>
                  <th className="px-5 py-3.5">Score</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((record) => {
                  const isLatest = record.id === inspections[0]?.id;
                  return (
                    <tr
                      key={record.id}
                      className={`transition-colors ${
                        isLatest ? 'bg-blue-50/50 hover:bg-blue-50/70' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-900">{record.memoNumber}</span>
                          {isLatest && (
                            <span className="px-1.5 py-0.5 bg-blue-600 text-white font-extrabold text-[9px] rounded uppercase tracking-wider">
                              Latest
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center space-x-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {record.batchNumber || 'N/A'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-900">{record.commodityName}</div>
                      <div className="text-[11px] text-slate-500">{record.category}</div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-900 truncate max-w-xs">{record.manufacturer}</div>
                      <div className="text-[10px] text-slate-500">{record.brand || 'N/A'}</div>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {record.status === 'COMPLIANT' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Compliant</span>
                        </span>
                      ) : record.status === 'REVIEW_REQUIRED' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Needs Review</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Non-Compliant</span>
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap font-bold text-slate-900">
                      {record.score}%
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        id={`btn-history-view-${record.id}`}
                        type="button"
                        onClick={() => onViewRecord(record)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold text-xs transition-colors inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Memo</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
};

