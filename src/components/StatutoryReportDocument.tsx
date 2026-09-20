import React from 'react';
import { InspectionRecord } from '../types';
import { Scale, CheckCircle, AlertTriangle, XCircle, Printer, Download, Share2, Shield, Calendar, MapPin, User, Building } from 'lucide-react';

interface StatutoryReportDocumentProps {
  record: InspectionRecord;
  onPrint?: () => void;
  onDownloadPdf?: () => void;
  showActions?: boolean;
}

export const StatutoryReportDocument: React.FC<StatutoryReportDocumentProps> = ({
  record,
  onPrint,
  onDownloadPdf,
  showActions = true,
}) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs rounded-md">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>STATUTORILY COMPLIANT</span>
          </div>
        );
      case 'REVIEW_REQUIRED':
        return (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-md">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>RECTIFICATION / REVIEW REQUIRED</span>
          </div>
        );
      case 'NON_COMPLIANT':
      default:
        return (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-rose-100 text-rose-900 border border-rose-300 font-bold text-xs rounded-md">
            <XCircle className="w-3.5 h-3.5 text-rose-700" />
            <span>VIOLATION DETECTED • NON-COMPLIANT</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar (hidden in print) */}
      {showActions && (
        <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Statutory Memo Reference
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">{record.memoNumber}</h2>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              id="btn-print-statutory-report"
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center space-x-2 shadow-md shadow-slate-900/20"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
            <button
              id="btn-download-pdf-report"
              type="button"
              onClick={onDownloadPdf || handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center space-x-2 shadow-md shadow-blue-600/20"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* Official Statutory Government Document Layout (A4 formatted) */}
      <div
        id="statutory-government-document"
        className="bg-white border border-slate-300 shadow-xl rounded-2xl p-6 sm:p-10 max-w-4xl mx-auto text-slate-900 font-serif leading-relaxed"
      >
        {/* National Emblem & Department Header */}
        <div className="text-center border-b-2 border-slate-900 pb-5 mb-6">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Scale className="w-7 h-7 text-slate-900" />
          </div>
          <h1 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-950 font-sans">
            Government of India
          </h1>
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-slate-800 font-sans">
            Ministry of Consumer Affairs, Food and Public Distribution
          </h2>
          <h3 className="text-xs font-semibold text-slate-700 font-sans">
            Department of Consumer Affairs • Legal Metrology Division
          </h3>
          <p className="text-[11px] text-slate-600 font-sans mt-0.5">
            [Statutory Inspection Memo under The Legal Metrology Act, 2009 & Packaged Commodities Rules, 2011]
          </p>
        </div>

        {/* Memo Metadata Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-300 p-3 rounded-lg text-xs font-sans mb-6">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Inspection Memo No.</span>
            <span className="font-bold text-slate-900">{record.memoNumber}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Date & Time</span>
            <span className="font-semibold text-slate-900">
              {new Date(record.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Inspecting Officer</span>
            <span className="font-semibold text-slate-900">{record.officerName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Statutory Compliance</span>
            <div>{getStatusBadge(record.status)}</div>
          </div>
        </div>

        {/* Section 1: Establishment & Commodity Details */}
        <div className="mb-6 font-sans">
          <h4 className="text-xs font-bold uppercase tracking-wider bg-slate-200 text-slate-900 px-3 py-1.5 rounded mb-3 border-l-4 border-slate-900">
            1. Particulars of Pre-Packaged Commodity & Establishment Inspected
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="border border-slate-200 p-3 rounded-lg bg-white space-y-1.5">
              <div className="font-bold text-slate-900 text-sm">{record.commodityName}</div>
              <div>
                <span className="text-slate-500">Category: </span>
                <span className="font-medium">{record.category}</span>
              </div>
              <div>
                <span className="text-slate-500">Package Type: </span>
                <span className="font-medium">{record.packageType}</span>
              </div>
              <div>
                <span className="text-slate-500">Brand / Trademark: </span>
                <span className="font-medium">{record.brand || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500">Declared Net Quantity: </span>
                <span className="font-bold text-blue-700">{record.netQuantity}</span>
              </div>
              <div>
                <span className="text-slate-500">Declared MRP: </span>
                <span className="font-bold text-slate-900">{record.mrp}</span>
              </div>
              <div>
                <span className="text-slate-500">Unit Sale Price (USP): </span>
                <span className="font-bold text-slate-900">{record.unitSalePrice || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500">Batch / Lot No. (B.No.): </span>
                <span className="font-bold font-mono text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{record.batchNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500">Mfg / Expiry Date: </span>
                <span className="font-semibold text-slate-900">{record.mfgDate || 'N/A'} {record.expiryDate ? `| Use By: ${record.expiryDate}` : ''}</span>
              </div>
            </div>

            <div className="border border-slate-200 p-3 rounded-lg bg-white space-y-1.5">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Inspected Location / Store</span>
                <span className="font-semibold text-slate-900">{record.storeName}</span>
                <p className="text-slate-600 mt-0.5">{record.storeAddress || record.inspectionLocation}</p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Manufacturer / Packer / Importer</span>
                <span className="font-semibold text-slate-900">{record.manufacturer}</span>
                <p className="text-slate-600 mt-0.5">{record.mfgAddress}</p>
              </div>
              <div>
                <span className="text-slate-500">Country of Origin: </span>
                <span className="font-semibold">{record.countryOfOrigin || 'Not Declared'}</span>
              </div>
              {record.lotSize !== undefined && record.lotSize > 0 && (
                <div className="pt-2 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-500 block font-bold uppercase text-[10px]">PCR 2011 Sampling Audit (Fifth Schedule)</span>
                  <p className="text-slate-700 mt-0.5">
                    Batch Stock: <strong>{record.lotSize} units</strong> | Samples Tested: <strong>{record.samplesTested || 1} units</strong>
                  </p>
                  <p className={record.sampleSufficient ? "text-emerald-700 font-semibold mt-0.5" : "text-amber-700 font-semibold mt-0.5"}>
                    {record.sampleSufficient ? "✓ Statutorily compliant sample size drawn." : "⚠ Sample size below standard PCR 2011 minimum."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Photographic Evidence */}
        {record.images && record.images.length > 0 && (
          <div className="mb-6 font-sans avoid-break">
            <h4 className="text-xs font-bold uppercase tracking-wider bg-slate-200 text-slate-900 px-3 py-1.5 rounded mb-3 border-l-4 border-slate-900">
              2. Photographic Evidence of Pre-Packaged Label(s)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {record.images.map((img, idx) => (
                <div key={img.id || idx} className="border border-slate-300 rounded-lg p-1.5 bg-slate-50 text-center">
                  <img
                    src={img.previewUrl}
                    alt={`Package label ${img.labelType}`}
                    className="w-full h-28 object-contain bg-white rounded border border-slate-200"
                  />
                  <span className="text-[10px] uppercase font-bold text-slate-700 block mt-1">
                    Exhibit {String.fromCharCode(65 + idx)}: {img.labelType} Panel
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Declarations Compliance Audit Table */}
        <div className="mb-6 font-sans">
          <h4 className="text-xs font-bold uppercase tracking-wider bg-slate-200 text-slate-900 px-3 py-1.5 rounded mb-3 border-l-4 border-slate-900">
            3. Mandatory Declarations Audit (Rule 6, Legal Metrology Rules 2011)
          </h4>

          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 border-b border-slate-300 text-[11px] font-bold text-slate-900">
                <tr>
                  <th className="p-2 border-r border-slate-300">Statutory Provision</th>
                  <th className="p-2 border-r border-slate-300">Mandatory Requirement</th>
                  <th className="p-2 border-r border-slate-300">Extracted Package Value</th>
                  <th className="p-2 text-center">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {record.declarations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="p-2 font-bold text-slate-900 border-r border-slate-200">
                      {d.ruleReference}
                      <span className="block font-normal text-[10px] text-slate-500">{d.fieldName}</span>
                    </td>
                    <td className="p-2 text-slate-700 border-r border-slate-200 text-[11px]">
                      {d.legalNote || 'Mandatory as per PCR 2011'}
                    </td>
                    <td className="p-2 font-medium text-slate-900 border-r border-slate-200">
                      {d.extractedValue || 'MISSING'}
                    </td>
                    <td className="p-2 text-center">
                      {d.status === 'passed' ? (
                        <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded">
                          COMPLIANT
                        </span>
                      ) : d.status === 'warning' ? (
                        <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded">
                          ADVISORY
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 bg-rose-100 text-rose-800 font-bold text-[10px] rounded">
                          VIOLATION
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Specific Statutory Findings & Offense Details */}
        {record.findings && record.findings.length > 0 && (
          <div className="mb-6 font-sans avoid-break">
            <h4 className="text-xs font-bold uppercase tracking-wider bg-slate-200 text-slate-900 px-3 py-1.5 rounded mb-3 border-l-4 border-slate-900">
              4. Inspection Findings & Legal Provisions
            </h4>

            <div className="space-y-3">
              {record.findings.map((f, idx) => (
                <div
                  key={f.id || idx}
                  className={`p-3 rounded-lg border text-xs ${
                    f.status === 'failed'
                      ? 'bg-rose-50 border-rose-300'
                      : f.status === 'needs_review'
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-emerald-50 border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                    <span>
                      {f.ruleNumber} — {f.ruleTitle}
                    </span>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-white font-bold border">
                      {f.severity.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-700 mt-1">
                    <strong className="text-slate-900">Observed Evidence: </strong>
                    {f.evidence}
                  </p>
                  <p className="text-slate-700 mt-0.5">
                    <strong className="text-slate-900">Statutory Provision & Penalty: </strong>
                    {f.legalClause} ({f.penaltySection})
                  </p>
                  <p className="text-slate-700 mt-0.5">
                    <strong className="text-slate-900">Enforcement Directive: </strong>
                    {f.recommendedAction}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 5: Officer Certification & Remarks */}
        <div className="mt-8 pt-6 border-t-2 border-slate-900 font-sans avoid-break">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <span className="font-bold text-slate-900 block mb-1">Officer Remarks & Action Taken:</span>
              <p className="text-slate-700 italic bg-slate-50 p-2.5 rounded border border-slate-200 leading-relaxed">
                "{record.remarks || 'Routine market surveillance completed. Package examined for PCR compliance.'}"
              </p>
              <div className="mt-2 text-slate-800">
                <strong>Action Summary: </strong> {record.actionTaken || 'Documented in Central Metrology Registry'}
              </div>
            </div>

            <div className="flex flex-col justify-end text-right sm:pr-4">
              <div className="border-b border-slate-400 w-48 ml-auto mb-1 h-12 flex items-end justify-center">
                <span className="font-cursive text-blue-900 font-bold text-sm tracking-wider">
                  {record.officerName.replace('Insp. ', '')}
                </span>
              </div>
              <span className="font-bold text-slate-900">{record.officerName}</span>
              <span className="text-slate-600 text-[11px]">{record.officerDesignation}</span>
              <span className="text-slate-500 text-[10px]">Legal Metrology Enforcement Division</span>
              <span className="text-[10px] text-slate-400 mt-1">Digital Seal ID: LM-SIG-{record.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
