import React from 'react';
import { X, ZoomIn, Download, Trash2, Tag, Calendar } from 'lucide-react';
import { InspectionImage } from '../types';

interface ImagePreviewModalProps {
  image: InspectionImage | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  image,
  isOpen,
  onClose,
  onDelete,
}) => {
  if (!isOpen || !image) return null;

  const labelTitles: Record<string, string> = {
    front: 'Principal Display Panel (Front)',
    back: 'Statutory Declarations Panel (Back)',
    side: 'Side & Ingredient List Panel',
    mrp: 'Batch, MRP & Date Matrix Panel',
    other: 'General Package Evidence',
  };

  return (
    <div
      id="image-preview-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div
        id="image-preview-modal-content"
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 rounded-md bg-blue-600/30 text-blue-300 text-xs font-semibold uppercase tracking-wider border border-blue-500/40 flex items-center space-x-1">
              <Tag className="w-3 h-3" />
              <span>{image.labelType}</span>
            </span>
            <div>
              <h3 className="text-white font-medium text-sm sm:text-base">
                {labelTitles[image.labelType] || 'Package Inspection Photograph'}
              </h3>
              <p className="text-slate-400 text-xs flex items-center space-x-1.5 mt-0.5">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>Captured: {image.timestamp}</span>
                <span>•</span>
                <span className="capitalize">Source: {image.source}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onDelete && (
              <button
                id="btn-preview-delete"
                type="button"
                onClick={() => {
                  onDelete(image.id);
                  onClose();
                }}
                className="p-2 text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 rounded-lg transition-colors border border-rose-800/40"
                title="Delete Photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <a
              id="btn-preview-download"
              href={image.previewUrl}
              download={`packcheck_${image.labelType}_${Date.now()}.jpg`}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              title="Download Photo"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              id="btn-preview-close"
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Zoomable Image Viewport */}
        <div className="flex-1 bg-black/90 p-4 flex items-center justify-center overflow-auto min-h-[360px] sm:min-h-[460px]">
          <img
            src={image.previewUrl}
            alt="Package inspection photograph zoomed view"
            className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-200"
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>High-Resolution Evidence Capture • Certified for Legal Metrology Enforcement</span>
          <span className="text-slate-500">ID: {image.id}</span>
        </div>
      </div>
    </div>
  );
};
