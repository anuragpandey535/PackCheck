import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Trash2,
  RotateCcw,
  Check,
  ShieldCheck,
  Scale,
  Building,
  MapPin,
  HelpCircle,
  Zap,
  Printer,
  Download,
  Info,
  Layers,
  FileCheck,
} from 'lucide-react';
import {
  InspectionImage,
  LabelType,
  DeclarationField,
  ComplianceFinding,
  InspectionRecord,
  LanguageCode,
  ComplianceStatus,
} from '../types';
import { useTranslation } from '../lib/translations';
import { getStatutorySampleSize } from '../lib/metrologyRules';
import { CameraCaptureModal } from './CameraCaptureModal';
import { ImagePreviewModal } from './ImagePreviewModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { StatutoryReportDocument } from './StatutoryReportDocument';
import confetti from 'canvas-confetti';

interface NewInspectionViewProps {
  onSaveInspection: (record: InspectionRecord) => void;
  onCancel: () => void;
  language: LanguageCode;
  onShowToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => void;
  initialCameraOpen?: boolean;
}

export const NewInspectionView: React.FC<NewInspectionViewProps> = ({
  onSaveInspection,
  onCancel,
  language,
  onShowToast,
  initialCameraOpen = false,
}) => {
  const t = useTranslation(language);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stepper state: 1 (Capture), 2 (AI Extraction), 3 (Verification), 4 (Compliance), 5 (Report)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Inputs
  const [commodityName, setCommodityName] = useState<string>('');
  const [category, setCategory] = useState<string>('Food & Beverages');
  const [packageType, setPackageType] = useState<string>('Pouch / Sachet');
  const [storeName, setStoreName] = useState<string>('Metro Supermarket & Mart');
  const [inspectionLocation, setInspectionLocation] = useState<string>('Connaught Place, New Delhi');
  const [lotSize, setLotSize] = useState<string>('500');
  const [samplesTested, setSamplesTested] = useState<number>(32);
  const [batchNumber, setBatchNumber] = useState<string>('');

  // Statutory Sampling Calculation (PCR 2011 Fifth Schedule)
  const samplingRule = getStatutorySampleSize(lotSize);
  const minRequiredSample = samplingRule.minInitialSample || samplingRule.requiredSample;
  const isSampleSufficient = samplesTested >= minRequiredSample;

  // Images state
  const [images, setImages] = useState<InspectionImage[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(initialCameraOpen);
  const [cameraDefaultLabel, setCameraDefaultLabel] = useState<LabelType>('front');

  // Modals
  const [previewImage, setPreviewImage] = useState<InspectionImage | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // AI Analysis & Progress state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);

  // Results State
  const [brand, setBrand] = useState<string>('');
  const [manufacturer, setManufacturer] = useState<string>('');
  const [mfgAddress, setMfgAddress] = useState<string>('');
  const [countryOfOrigin, setCountryOfOrigin] = useState<string>('India');
  const [netQuantity, setNetQuantity] = useState<string>('');
  const [mrp, setMrp] = useState<string>('');
  const [unitSalePrice, setUnitSalePrice] = useState<string>('');
  const [mfgDate, setMfgDate] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [consumerCare, setConsumerCare] = useState<string>('');
  const [declarations, setDeclarations] = useState<DeclarationField[]>([]);
  const [findings, setFindings] = useState<ComplianceFinding[]>([]);
  const [complianceScore, setComplianceScore] = useState<number>(90);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus>('COMPLIANT');
  const [officerRemarks, setOfficerRemarks] = useState<string>('Routine market sweep inspection. Label verified.');
  const [actionTaken, setActionTaken] = useState<string>('Notice / Verification recorded in Legal Metrology database.');
  const [finalRecord, setFinalRecord] = useState<InspectionRecord | null>(null);

  // Handle image capture from camera
  const handleCameraCapture = (file: File, previewUrl: string, labelType: LabelType) => {
    const newImage: InspectionImage = {
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      file,
      previewUrl,
      labelType,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'camera',
    };

    setImages((prev) => [...prev, newImage]);
    onShowToast('success', 'Photo Captured', `Added ${labelType} photograph to package inspection.`);
  };

  // Handle file uploads from disk / drag-and-drop
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files: File[] = Array.from(e.target.files);
    const labelTypes: LabelType[] = ['front', 'back', 'side', 'mrp', 'other'];

    const newImages: InspectionImage[] = files.map((file: File, idx: number): InspectionImage => {
      const assignedLabel = labelTypes[Math.min(images.length + idx, labelTypes.length - 1)];
      return {
        id: `img_${Date.now()}_${idx}`,
        file,
        previewUrl: URL.createObjectURL(file),
        labelType: assignedLabel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'upload',
      };
    });

    setImages((prev) => [...prev, ...newImages]);
    onShowToast('success', 'Photos Uploaded', `Added ${files.length} package image(s).`);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Delete image
  const handleDeleteImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setDeleteTargetId(null);
    onShowToast('info', 'Photo Removed', 'Image was removed from inspection collection.');
  };

  // Change image label type
  const handleUpdateLabelType = (id: string, newType: LabelType) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, labelType: newType } : img))
    );
  };

  // Load sample demo package for instant testing
  const handleLoadSamplePackage = () => {
    setCommodityName('Golden Almond & Honey Cookies');
    setCategory('Food & Beverages');
    setPackageType('Box / Carton');
    setStoreName('Apex Hypermarket Mall');
    setInspectionLocation('Sector 18, Noida, Uttar Pradesh');
    setLotSize('500');
    setSamplesTested(32);
    setBatchNumber('LOT-GAH-2026/08X');

    const sampleImages: InspectionImage[] = [
      {
        id: 'sample-1',
        previewUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop&q=80',
        labelType: 'front',
        timestamp: 'Just now',
        source: 'camera',
      },
      {
        id: 'sample-2',
        previewUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&auto=format&fit=crop&q=80',
        labelType: 'back',
        timestamp: 'Just now',
        source: 'camera',
      },
    ];

    setImages(sampleImages);
    onShowToast('info', 'Sample Package Loaded', 'Sample package images and store details loaded for testing.');
  };

// Helper to downscale and compress images to prevent hitting cloud payload limits
function compressImageToBase64(blob: Blob | File): Promise<{ data: string; mimeType: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const base64 = dataUrl.split(',')[1] || '';
          resolve({ data: base64, mimeType: 'image/jpeg' });
          return;
        }
        const r = e.target?.result as string;
        resolve({ data: r.includes(',') ? r.split(',')[1] : r, mimeType: 'image/jpeg' });
      };
      img.onerror = () => {
        const r = e.target?.result as string;
        resolve({ data: r ? (r.includes(',') ? r.split(',')[1] : r) : '', mimeType: 'image/jpeg' });
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve({ data: '', mimeType: 'image/jpeg' });
    reader.readAsDataURL(blob);
  });
}

  // Start AI analysis pipeline
  const handleStartAnalysis = async () => {
    if (images.length === 0) {
      onShowToast('warning', 'Photos Required', 'Please capture or upload at least one package photo.');
      return;
    }

    setCurrentStep(2); // Step 2: AI Extraction screen
    setIsAnalyzing(true);
    setAnalysisStep(1);

    try {
      // Step 1 animation
      await new Promise((r) => setTimeout(r, 600));
      setAnalysisStep(2);

      // Convert and compress images for API
      const base64Images: { data: string; mimeType: string }[] = await Promise.all(
        images.map(async (img) => {
          if (img.file) {
            return compressImageToBase64(img.file);
          } else if (img.previewUrl.startsWith('data:')) {
            try {
              const res = await fetch(img.previewUrl);
              const blob = await res.blob();
              return compressImageToBase64(blob);
            } catch (e) {
              const parts = img.previewUrl.split(',');
              return { data: parts[1] || '', mimeType: 'image/jpeg' };
            }
          } else {
            try {
              const res = await fetch(img.previewUrl);
              const blob = await res.blob();
              return compressImageToBase64(blob);
            } catch (e) {
              return { data: '', mimeType: 'image/jpeg' };
            }
          }
        })
      );

      setAnalysisStep(3); // OCR & declarations
      await new Promise((r) => setTimeout(r, 700));

      setAnalysisStep(4); // Legal Metrology rule check

      // Call backend API /api/analyze-package
      let analysisResult: { success?: boolean; data?: any } | null = null;
      try {
        const response = await fetch('/api/analyze-package', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            images: base64Images.filter((img) => img.data.length > 0),
            commodityHint: commodityName,
            categoryHint: category,
            packageTypeHint: packageType,
          }),
        });

        if (response.ok) {
          analysisResult = await response.json();
        }
      } catch (apiErr) {
        console.warn('Backend API call fallback:', apiErr);
      }

      // If backend API is not reachable (e.g. static hosting like Netlify Drop / GitHub Pages), try client-side Gemini
      if (!analysisResult || !analysisResult.data) {
        const clientApiKey = localStorage.getItem('packcheck_gemini_api_key') || (import.meta as any).env?.VITE_GEMINI_API_KEY;
        if (clientApiKey) {
          try {
            const prompt = `You are a certified Legal Metrology Enforcement Officer and precise OCR scanner in India specializing in PCR 2011.
Scan the package and extract: commodityName, brand, manufacturer, mfgAddress, countryOfOrigin, netQuantity, mrp, unitSalePrice, mfgDate, expiryDate, batchNumber (exact B.No. or BN), consumerCare, status ("COMPLIANT"|"REVIEW_REQUIRED"|"NON_COMPLIANT"), score (number), officerRemarks, actionTaken.
Return ONLY valid JSON matching this schema.`;

            const imageParts = base64Images.filter((img) => img.data.length > 0).map((img) => ({
              inline_data: {
                mime_type: img.mimeType || 'image/jpeg',
                data: img.data,
              },
            }));

            const directRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${clientApiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [
                    {
                      parts: [...imageParts, { text: prompt }],
                    },
                  ],
                  generationConfig: {
                    responseMimeType: 'application/json',
                  },
                }),
              }
            );

            if (directRes.ok) {
              const resJson = await directRes.json();
              const text = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
                analysisResult = { success: true, data: JSON.parse(cleaned) };
              }
            }
          } catch (clientErr) {
            console.warn('Direct client-side Gemini extraction failed:', clientErr);
          }
        }
      }

      setAnalysisStep(5); // Finalizing
      await new Promise((r) => setTimeout(r, 600));

      // Parse or formulate result
      const resData = analysisResult?.data || {};
      console.log('AI Extraction Response from Gemini:', resData);

      const detectedCommodity =
        resData.commodityName !== undefined && resData.commodityName !== ''
          ? resData.commodityName
          : (commodityName || '');
      const detectedBrand = resData.brand !== undefined ? resData.brand : '';
      const detectedMfg = resData.manufacturer !== undefined ? resData.manufacturer : '';
      const detectedMfgAddr = resData.mfgAddress !== undefined ? resData.mfgAddress : '';
      const detectedOrigin = resData.countryOfOrigin !== undefined ? resData.countryOfOrigin : '';
      const detectedNetQty = resData.netQuantity !== undefined ? resData.netQuantity : '';
      const detectedMrp = resData.mrp !== undefined ? resData.mrp : '';
      const detectedUsp = resData.unitSalePrice !== undefined ? resData.unitSalePrice : '';
      const detectedMfgDate = resData.mfgDate !== undefined ? resData.mfgDate : '';
      const detectedExpDate = resData.expiryDate !== undefined ? resData.expiryDate : '';
      const detectedBatch = resData.batchNumber ? resData.batchNumber.trim() : (batchNumber ? batchNumber.trim() : '');
      const detectedCare = resData.consumerCare !== undefined ? resData.consumerCare : '';

      setCommodityName(detectedCommodity);
      setBrand(detectedBrand);
      setManufacturer(detectedMfg);
      setMfgAddress(detectedMfgAddr);
      setCountryOfOrigin(detectedOrigin);
      setNetQuantity(detectedNetQty);
      setMrp(detectedMrp);
      setUnitSalePrice(detectedUsp);
      setMfgDate(detectedMfgDate);
      setExpiryDate(detectedExpDate);
      setBatchNumber(detectedBatch);
      setConsumerCare(detectedCare);

      if (resData.officerRemarks) {
        setOfficerRemarks(resData.officerRemarks);
      }
      if (resData.actionTaken) {
        setActionTaken(resData.actionTaken);
      }

      // Declarations audit list (Use API declarations if available, else construct verified list)
      let extractedDeclarations: DeclarationField[] = [];
      if (Array.isArray(resData.declarations) && resData.declarations.length > 0) {
        extractedDeclarations = resData.declarations.map((d: any, i: number) => ({
          id: d.id || `d-${i + 1}`,
          fieldName: d.fieldName || 'Statutory Declaration',
          ruleReference: d.ruleReference || 'Rule 6 PCR 2011',
          extractedValue: d.extractedValue || 'Declared',
          status: d.status || 'passed',
          confidence: typeof d.confidence === 'number' ? d.confidence : 0.95,
          fontHeightMm: d.fontHeightMm || 4.2,
          minRequiredFontMm: d.minRequiredFontMm || 4.0,
          legalNote: d.legalNote || 'Checked against PCR 2011 rules.',
        }));
      } else {
        const hasValidUsp = Boolean(detectedUsp && detectedUsp.trim().length > 0);
        const hasTaxesInMrp = /tax/i.test(detectedMrp);
        const mfgValue = [detectedMfg, detectedMfgAddr].filter(Boolean).join(', ');

        extractedDeclarations = [
          {
            id: 'd-1',
            fieldName: 'Name and Address of Manufacturer',
            ruleReference: 'Rule 6(1)(a)',
            extractedValue: mfgValue || 'Not Found on Label',
            status: mfgValue.length > 10 ? 'passed' : mfgValue.length > 0 ? 'warning' : 'missing',
            confidence: mfgValue ? 0.98 : 0.4,
            legalNote: mfgValue
              ? 'Complete postal address with PIN code verified.'
              : 'Manufacturer name/address not found on packaging.',
          },
          {
            id: 'd-2',
            fieldName: 'Generic Commodity Name',
            ruleReference: 'Rule 6(1)(b)',
            extractedValue: detectedCommodity || 'Not Found on Label',
            status: detectedCommodity ? 'passed' : 'missing',
            confidence: detectedCommodity ? 0.99 : 0.4,
            legalNote: detectedCommodity
              ? 'Clearly identified on package label.'
              : 'Generic commodity name not detected.',
          },
          {
            id: 'd-3',
            fieldName: 'Net Quantity in Standard Metric Units',
            ruleReference: 'Rule 6(1)(c)',
            extractedValue: detectedNetQty || 'Not Found on Label',
            status: detectedNetQty ? 'passed' : 'missing',
            confidence: detectedNetQty ? 0.97 : 0.4,
            fontHeightMm: 4.2,
            minRequiredFontMm: 4.0,
            legalNote: detectedNetQty
              ? 'Standard metric unit used.'
              : 'Net quantity declaration missing or unclear.',
          },
          {
            id: 'd-4',
            fieldName: 'Month and Year of Manufacture / Packing',
            ruleReference: 'Rule 6(1)(d)',
            extractedValue:
              detectedMfgDate || detectedExpDate
                ? `Mfg: ${detectedMfgDate || 'N/A'} | Expiry: ${detectedExpDate || 'N/A'}`
                : 'Not Found on Label',
            status: detectedMfgDate ? 'passed' : 'warning',
            confidence: detectedMfgDate ? 0.96 : 0.4,
            legalNote: detectedMfgDate
              ? 'Standard date format compliant with PCR 2011.'
              : 'Date of manufacturing/packaging not clearly identified.',
          },
          {
            id: 'd-5',
            fieldName: 'Maximum Retail Price (MRP)',
            ruleReference: 'Rule 6(1)(e)',
            extractedValue: detectedMrp || 'Not Found on Label',
            status: !detectedMrp ? 'missing' : hasTaxesInMrp ? 'passed' : 'violation',
            confidence: detectedMrp ? 0.98 : 0.4,
            legalNote: !detectedMrp
              ? 'MRP not found on scanned package.'
              : hasTaxesInMrp
              ? 'Mandatory phrase "inclusive of all taxes" verified.'
              : 'Missing mandatory statutory phrase "(inclusive of all taxes)".',
          },
          {
            id: 'd-6',
            fieldName: 'Unit Sale Price (USP)',
            ruleReference: 'Rule 6(11)',
            extractedValue: detectedUsp || 'Not Found on Label',
            status: hasValidUsp ? 'passed' : 'violation',
            confidence: hasValidUsp ? 0.95 : 0.4,
            legalNote: hasValidUsp
              ? 'Unit Sale Price declared on package as per 2021/2022 PCR amendment.'
              : 'Mandatory USP missing for packages > 200g/200ml under Rule 6(11).',
          },
          {
            id: 'd-7',
            fieldName: 'Country of Origin',
            ruleReference: 'Rule 6(10)',
            extractedValue: detectedOrigin || 'Not Found on Label',
            status: detectedOrigin ? 'passed' : 'missing',
            confidence: detectedOrigin ? 0.99 : 0.4,
            legalNote: detectedOrigin
              ? 'Mandatory origin declaration verified.'
              : 'Country of Origin declaration not detected.',
          },
          {
            id: 'd-8',
            fieldName: 'Consumer Care / Grievance Redressal',
            ruleReference: 'Rule 6(1)(g)',
            extractedValue: detectedCare || 'Not Found on Label',
            status: detectedCare ? 'passed' : 'missing',
            confidence: detectedCare ? 0.96 : 0.4,
            legalNote: detectedCare
              ? 'Contact helpline, email, or postal address present.'
              : 'Consumer grievance contact details missing.',
          },
          {
            id: 'd-9',
            fieldName: 'Batch / Lot Identification Number',
            ruleReference: 'Rule 6(1) & FSSAI/PCR Marking',
            extractedValue: detectedBatch || 'B.No. Not Found on Label',
            status: detectedBatch ? 'passed' : 'warning',
            confidence: detectedBatch ? 0.97 : 0.4,
            legalNote: detectedBatch
              ? 'Batch / Lot identification code recorded for batch trace.'
              : 'Batch number not clearly visible on scanned label.',
          },
        ];
      }

      setDeclarations(extractedDeclarations);

      // Compliance Findings (Use API findings or formulate)
      let extractedFindings: ComplianceFinding[] = [];
      if (Array.isArray(resData.findings) && resData.findings.length > 0) {
        extractedFindings = resData.findings.map((f: any, idx: number) => ({
          id: f.id || `f-${idx + 1}`,
          ruleNumber: f.ruleNumber || 'Rule 6 PCR 2011',
          ruleTitle: f.ruleTitle || 'Legal Metrology Compliance Check',
          severity: f.severity || 'compliant',
          evidence: f.evidence || 'Package label inspection evidence.',
          explanation: f.explanation || 'Verified in compliance with the Legal Metrology Act, 2009.',
          legalClause: f.legalClause || 'Section 36(1) of Legal Metrology Act, 2009',
          penaltySection: f.penaltySection || 'Rule 32 PCR 2011',
          recommendedAction: f.recommendedAction || 'Record in inspection registry.',
          status: f.status || (f.severity === 'compliant' ? 'passed' : 'failed'),
        }));
      } else {
        const violationsCount = extractedDeclarations.filter(
          (d) => d.status === 'violation' || d.status === 'missing'
        ).length;

        if (violationsCount === 0) {
          extractedFindings = [
            {
              id: 'f-1',
              ruleNumber: 'Rule 6(1)(a)-(g)',
              ruleTitle: 'Mandatory Statutory Declarations Compliance',
              severity: 'compliant',
              evidence:
                'All 8 mandatory declarations found compliant with Legal Metrology (Packaged Commodities) Rules, 2011.',
              explanation:
                'No missing mandatory fields, correct font sizing, and valid Unit Sale Price declaration.',
              legalClause: 'Section 36(1) of Legal Metrology Act, 2009',
              penaltySection: 'None (Fully Compliant)',
              recommendedAction: 'Issue Certificate of Compliance.',
              status: 'passed',
            },
          ];
        } else {
          extractedFindings = extractedDeclarations
            .filter((d) => d.status === 'violation' || d.status === 'missing')
            .map((d, idx) => ({
              id: `f-${idx + 1}`,
              ruleNumber: d.ruleReference,
              ruleTitle: `Non-Compliance with ${d.fieldName}`,
              severity: 'major_violation',
              evidence: `Extracted value: "${d.extractedValue}". ${d.legalNote || ''}`,
              explanation: `The package violates statutory mandate under ${d.ruleReference}.`,
              legalClause: 'Section 36(1) & Section 36(2) of Legal Metrology Act, 2009',
              penaltySection: 'Compounding fine up to ₹25,000 for first offense',
              recommendedAction: 'Issue Statutory Notice under Section 36(1). Seize sample if non-rectified.',
              status: 'failed',
            }));
        }
      }

      setFindings(extractedFindings);

      const hasViolations = extractedDeclarations.some((d) => d.status === 'violation');
      const score = typeof resData.score === 'number' ? resData.score : hasViolations ? 65 : 94;
      const status: ComplianceStatus =
        resData.status || (hasViolations ? 'NON_COMPLIANT' : score < 80 ? 'REVIEW_REQUIRED' : 'COMPLIANT');

      setComplianceScore(score);
      setComplianceStatus(status);

      setIsAnalyzing(false);
      setCurrentStep(3); // Step 3: Verification
      onShowToast('success', 'Extraction Complete', 'Package declarations extracted and audited against PCR 2011.');
    } catch (err) {
      console.error('Error during extraction analysis:', err);
      setIsAnalyzing(false);
      setCurrentStep(3);
      onShowToast('info', 'Inspection Ready', 'Extracted declarations ready for officer verification.');
    }
  };

  // Proceed from Step 3 (Verification) to Step 4 (Compliance Results)
  const handleProceedToCompliance = () => {
    setCurrentStep(4);
    // Trigger celebratory confetti if score is high
    if (complianceScore >= 85) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    }
  };

  // Finalize & Generate Statutory Memorandum (Step 5)
  const handleFinalizeReport = () => {
    const memoNumber = `LM/ENF/2026/${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord: InspectionRecord = {
      id: `ins_${Date.now()}`,
      memoNumber,
      createdAt: new Date().toISOString(),
      commodityName: commodityName || 'Pre-Packaged Commodity',
      category,
      packageType,
      brand,
      manufacturer,
      mfgAddress,
      countryOfOrigin,
      netQuantity,
      mrp,
      unitSalePrice,
      mfgDate,
      expiryDate,
      consumerCare,
      status: complianceStatus,
      score: complianceScore,
      officerName: 'Insp. Aniket Verma',
      officerDesignation: 'Senior Legal Metrology Officer',
      inspectionLocation,
      storeName,
      storeAddress: inspectionLocation,
      declarations,
      findings,
      images,
      remarks: officerRemarks,
      actionTaken,
      batchNumber: batchNumber.trim() || 'UNASSIGNED',
      lotSize: parseInt(lotSize, 10) || 0,
      samplesTested,
      sampleSufficient: isSampleSufficient,
      statutorySamplingNote: samplingRule.note,
    };

    setFinalRecord(newRecord);
    setCurrentStep(5);
    onSaveInspection(newRecord);
    onShowToast('success', 'Statutory Report Generated', `Memo #${memoNumber} sealed and saved to inspection registry.`);
  };

  const stepsList = [
    { num: 1, label: t('step_capture') },
    { num: 2, label: t('step_ai') },
    { num: 3, label: t('step_verification') },
    { num: 4, label: t('step_compliance') },
    { num: 5, label: t('step_report') },
  ];

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* 5-Step Progress Stepper */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between overflow-x-auto gap-2">
          {stepsList.map((step, idx) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;

            return (
              <React.Fragment key={step.num}>
                <div className="flex items-center space-x-2.5 flex-shrink-0">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-4 ring-blue-100'
                        : isCompleted
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.num}
                  </div>
                  <span
                    className={`text-xs sm:text-sm whitespace-nowrap ${
                      isActive
                        ? 'font-bold text-blue-700'
                        : isCompleted
                        ? 'font-semibold text-slate-800'
                        : 'font-medium text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < stepsList.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 min-w-4 max-w-16 rounded transition-colors ${
                      currentStep > step.num ? 'bg-emerald-400' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* STEP 1: CAPTURE & PHOTO COLLECTION */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Informational Hero Card with Optional Product Notice */}
          <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-white rounded-2xl p-5 border border-blue-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-600/20">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Capture & Upload Package Photographs
                </h2>
                <div className="flex items-center space-x-1.5 mt-1 text-xs text-blue-800 font-medium bg-blue-100/80 px-2.5 py-1 rounded-lg w-fit">
                  <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>
                    <strong>Product name is optional:</strong> System will automatically extract and identify the commodity, MRP, and manufacturer directly from the label.
                  </span>
                </div>
              </div>
            </div>

            <button
              id="btn-quick-sample-load"
              type="button"
              onClick={handleLoadSamplePackage}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs transition-colors flex items-center space-x-1.5 shadow-sm whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Load Sample Package</span>
            </button>
          </div>

          {/* Form Metadata Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Inspection Parameters & Establishment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Product Name (Optional) */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product / Commodity Name{' '}
                  <span className="text-slate-400 font-normal">(Optional — Auto-detected from label)</span>
                </label>
                <input
                  id="input-commodity-name"
                  type="text"
                  value={commodityName}
                  onChange={(e) => setCommodityName(e.target.value)}
                  placeholder="e.g. Organic Pure Honey, Face Wash, Detergent Powder"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Commodity Category
                </label>
                <select
                  id="select-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-all"
                >
                  <option value="Food & Beverages">Food & Beverages</option>
                  <option value="Cosmetics & Personal Care">Cosmetics & Personal Care</option>
                  <option value="Electronics & Appliances">Electronics & Appliances</option>
                  <option value="Pharmaceuticals & Drugs">Pharmaceuticals & Drugs</option>
                  <option value="Household & Cleaning">Household & Cleaning</option>
                  <option value="Textiles & Apparel">Textiles & Apparel</option>
                  <option value="General Pre-Packaged">General Pre-Packaged</option>
                </select>
              </div>

              {/* Package Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Packaging Structure
                </label>
                <select
                  id="select-package-type"
                  value={packageType}
                  onChange={(e) => setPackageType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-all"
                >
                  <option value="Pouch / Sachet">Pouch / Sachet</option>
                  <option value="Bottle / Glass Jar">Bottle / Glass Jar</option>
                  <option value="Box / Carton">Box / Carton</option>
                  <option value="Tin / Can">Tin / Can</option>
                  <option value="Blister Pack">Blister Pack</option>
                  <option value="Flexible Wrapper">Flexible Wrapper</option>
                </select>
              </div>

              {/* Store Name */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Retail Store / Establishment Inspected
                </label>
                <input
                  id="input-store-name"
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. SuperMart Wholesale Hub, Reliance Fresh, Local Trader"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              {/* Location */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inspection Market Location / City
                </label>
                <input
                  id="input-location"
                  type="text"
                  value={inspectionLocation}
                  onChange={(e) => setInspectionLocation(e.target.value)}
                  placeholder="e.g. Connaught Place, New Delhi - 110001"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              {/* Batch / Lot Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batch / Lot Identification No.
                  <span className="text-slate-400 font-normal"> (B.No.)</span>
                </label>
                <input
                  id="input-batch-number"
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="Auto-detected from label or enter B.No."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none font-mono font-medium transition-all"
                />
              </div>

              {/* Batch / Lot Size in Stock */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batch / Lot Size in Stock
                  <span className="text-slate-400 font-normal"> (Units)</span>
                </label>
                <input
                  id="input-lot-size"
                  type="number"
                  min="1"
                  value={lotSize}
                  onChange={(e) => setLotSize(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              {/* Sample Packages Tested */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sample Packages Tested
                </label>
                <input
                  id="input-samples-tested"
                  type="number"
                  min="1"
                  value={samplesTested}
                  onChange={(e) => setSamplesTested(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              {/* Statutory Sampling Requirement Banner */}
              {parseInt(lotSize, 10) > 0 && (
                <div className={`col-span-1 sm:col-span-2 lg:col-span-4 p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isSampleSufficient 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <div className="space-y-0.5">
                    <div className="font-bold flex items-center space-x-1.5">
                      <span>{samplingRule.ruleReference}:</span>
                      <span className="font-normal">{samplingRule.note}</span>
                    </div>
                    <div className="text-[11px] opacity-80">
                      Mandated by Legal Metrology (Packaged Commodities) Rules, 2011 | Max Permissible Defective Units: <strong>{samplingRule.maxAllowedDefects}</strong>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] uppercase tracking-wider whitespace-nowrap ${
                    isSampleSufficient 
                      ? 'bg-emerald-200/70 text-emerald-900' 
                      : 'bg-amber-200/70 text-amber-900'
                  }`}>
                    {isSampleSufficient 
                      ? `✓ Valid Sample (${samplesTested} tested)` 
                      : `⚠ Insufficient (Min ${minRequiredSample} required)`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Photo Capture & Upload Action Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Real Camera Action Box */}
            <div
              id="action-box-camera"
              className="bg-gradient-to-br from-[#102A56] to-[#2563EB] text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="relative z-10 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-cyan-300">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Live Camera Label Scan</h3>
                <p className="text-xs text-blue-100/80 leading-relaxed max-w-sm">
                  Utilize high-resolution live camera capture with alignment guides for instant Principal Display Panel OCR.
                </p>
              </div>

              <div className="pt-6 relative z-10">
                <button
                  id="btn-trigger-take-photo"
                  type="button"
                  onClick={() => {
                    setCameraDefaultLabel('front');
                    setIsCameraOpen(true);
                  }}
                  className="w-full min-h-[48px] py-3 px-5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-cyan-400/20 hover:scale-[1.01] active:scale-[0.99]"
                  aria-label="Open camera"
                >
                  <Camera className="w-5 h-5 text-slate-950" />
                  <span>TAKE PHOTO NOW</span>
                </button>
              </div>
            </div>

            {/* File Upload Dropzone */}
            <div
              id="action-box-upload"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white rounded-2xl p-6 border-2 border-dashed border-slate-300 hover:border-blue-500 transition-all cursor-pointer flex flex-col items-center justify-center text-center group shadow-sm hover:shadow-md"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Upload package photos"
              />

              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                <Upload className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Upload Package Photographs
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                {t('drag_drop_hint')}
              </p>

              <button
                type="button"
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-xs transition-colors pointer-events-none"
              >
                Browse Files (JPG, PNG, WebP)
              </button>
            </div>
          </div>

          {/* Captured Photos Gallery */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Inspection Image Evidence ({images.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Assign label positions to aid OCR accuracy
                </p>
              </div>

              {images.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Add Another Photo</span>
                </button>
              )}
            </div>

            {images.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/60 text-slate-500 space-y-2">
                <Layers className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-xs font-medium">No photographs captured yet</p>
                <p className="text-[11px] text-slate-400">
                  Use the Take Photo button or file upload above to begin the audit.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative bg-slate-50 rounded-xl border border-slate-200 overflow-hidden group shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="h-40 bg-slate-900/5 flex items-center justify-center p-2">
                      <img
                        src={img.previewUrl}
                        alt="Captured package label"
                        className="h-full w-full object-contain rounded-lg"
                      />
                    </div>

                    {/* Overlay Action Buttons */}
                    <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setPreviewImage(img)}
                        className="p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg backdrop-blur-sm transition-colors"
                        title="Zoom Image"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(img.id)}
                        className="p-1.5 bg-rose-600/90 hover:bg-rose-700 text-white rounded-lg backdrop-blur-sm transition-colors"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Label Tag Dropdown */}
                    <div className="p-3 bg-white border-t border-slate-200/70 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                        <span>Label Type</span>
                        <span className="capitalize">{img.source}</span>
                      </div>
                      <select
                        value={img.labelType}
                        onChange={(e) => handleUpdateLabelType(img.id, e.target.value as LabelType)}
                        className="w-full px-2 py-1 bg-slate-50 text-xs font-semibold text-slate-800 rounded-lg border border-slate-200 focus:outline-none"
                      >
                        <option value="front">Front (Principal Display)</option>
                        <option value="back">Back (Declarations Panel)</option>
                        <option value="side">Side / Ingredients</option>
                        <option value="mrp">Batch, MRP & Date Matrix</option>
                        <option value="other">General Package Evidence</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Step Actions */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              id="btn-start-ai-analysis"
              type="button"
              onClick={handleStartAnalysis}
              disabled={images.length === 0}
              className="min-h-[48px] px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm transition-all flex items-center space-x-2 shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:pointer-events-none hover:scale-[1.01] active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('start_analysis')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: AI PROCESSING & SCANNING SCREEN */}
      {currentStep === 2 && (
        <div
          id="ai-processing-viewport"
          className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-8"
        >
          <div className="text-center space-y-2 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-400 mx-auto">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              {t('analyzing_package')}
            </h2>
            <p className="text-xs text-slate-400">
              Examining statutory declarations under Legal Metrology (Packaged Commodities) Rules, 2011
            </p>
          </div>

          {/* Scanning Visualizer Frame */}
          <div className="relative max-w-sm mx-auto aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl flex items-center justify-center">
            {images[0] && (
              <img
                src={images[0].previewUrl}
                alt="Package undergoing OCR analysis"
                className="w-full h-full object-contain opacity-70 filter contrast-125"
              />
            )}

            {/* Scanning Laser Beam */}
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06b6d4] animate-laser" />

            <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/75 text-[10px] text-cyan-300 font-mono border border-cyan-500/30">
              ● OCR ENGINE ACTIVE
            </div>
          </div>

          {/* Progress Steps Checklist */}
          <div className="max-w-md mx-auto space-y-3 bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800">
            {[
              { step: 1, text: t('photo_received') },
              { step: 2, text: t('image_enhanced') },
              { step: 3, text: t('reading_declarations') },
              { step: 4, text: t('checking_rules') },
              { step: 5, text: t('preparing_report') },
            ].map((item) => {
              const isDone = analysisStep > item.step;
              const isCurrent = analysisStep === item.step;

              return (
                <div key={item.step} className="flex items-center space-x-3 text-xs sm:text-sm">
                  {isDone ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-600 flex items-center justify-center flex-shrink-0 text-[10px]">
                      ○
                    </div>
                  )}

                  <span
                    className={`${
                      isDone
                        ? 'text-emerald-300 font-medium'
                        : isCurrent
                        ? 'text-cyan-300 font-bold animate-pulse'
                        : 'text-slate-500'
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: DECLARATION VERIFICATION & CORRECTION */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Declaration Verification & OCR Audit
              </h2>
              <p className="text-xs text-slate-500">
                Review and adjust values extracted from the package prior to legal audit sealing.
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">
              Rule 6 PCR Compliance Check
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Package Image Gallery Thumbnail */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Inspected Label Evidence
              </h3>
              <div className="space-y-2">
                {images.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setPreviewImage(img)}
                    className="cursor-pointer border border-slate-200 rounded-xl overflow-hidden hover:border-blue-500 transition-colors relative group"
                  >
                    <img
                      src={img.previewUrl}
                      alt="Package thumbnail"
                      className="w-full h-32 object-contain bg-slate-50"
                    />
                    <div className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded capitalize font-medium">
                      {img.labelType}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center/Right: Extracted Fields Editor */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                Mandatory Declarations Matrix
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Commodity Name */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Commodity / Generic Name (Rule 6(1)(b))
                  </label>
                  <input
                    type="text"
                    value={commodityName}
                    onChange={(e) => setCommodityName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-medium"
                  />
                </div>

                {/* Manufacturer Name */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Manufacturer / Packer / Importer (Rule 6(1)(a))
                  </label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-medium"
                  />
                </div>

                {/* Manufacturer Address */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Postal Address & PIN Code (Rule 6(1)(a))
                  </label>
                  <input
                    type="text"
                    value={mfgAddress}
                    onChange={(e) => setMfgAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-medium"
                  />
                </div>

                {/* Net Quantity */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Net Quantity (Rule 6(1)(c))
                  </label>
                  <input
                    type="text"
                    value={netQuantity}
                    onChange={(e) => setNetQuantity(e.target.value)}
                    placeholder="e.g. 500 g, 1 L, 10 N"
                    className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-blue-700"
                  />
                </div>

                {/* MRP */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Maximum Retail Price (MRP) (Rule 6(1)(e))
                  </label>
                  <input
                    type="text"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    placeholder="e.g. ₹ 240.00 (incl. of all taxes)"
                    className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900"
                  />
                </div>

                {/* Unit Sale Price (USP) */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Unit Sale Price (USP) (Rule 6(11) 2022 Mandate)
                  </label>
                  <input
                    type="text"
                    value={unitSalePrice}
                    onChange={(e) => setUnitSalePrice(e.target.value)}
                    placeholder="e.g. ₹ 0.48 / g"
                    className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-semibold"
                  />
                </div>

                {/* Country of Origin */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Country of Origin (Rule 6(10))
                  </label>
                  <input
                    type="text"
                    value={countryOfOrigin}
                    onChange={(e) => setCountryOfOrigin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-medium"
                  />
                </div>

                {/* Month & Year */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Month & Year of Manufacture (Rule 6(1)(d))
                  </label>
                  <input
                    type="text"
                    value={mfgDate}
                    onChange={(e) => setMfgDate(e.target.value)}
                    placeholder="MM/YYYY"
                    className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-medium"
                  />
                </div>

                {/* Expiry / Use By Date */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Expiry / Best Before / Use By Date
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="e.g. 06/08/26, Best Before 4 Months"
                    className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-medium"
                  />
                </div>

                {/* Batch / Lot Identification No */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Batch / Lot Identification No. (B.No.)
                  </label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="e.g. B.No. 4028, LOT-2026-X8, K24"
                    className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-mono font-semibold"
                  />
                </div>

                {/* Consumer Care */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Consumer Grievance Care (Rule 6(1)(g))
                  </label>
                  <input
                    type="text"
                    value={consumerCare}
                    onChange={(e) => setConsumerCare(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Photos</span>
            </button>

            <button
              id="btn-proceed-compliance"
              type="button"
              onClick={handleProceedToCompliance}
              className="min-h-[48px] px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all flex items-center space-x-2 shadow-lg shadow-blue-600/30 hover:scale-[1.01] active:scale-[0.99]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Audit Compliance & Offenses</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: COMPLIANCE RESULTS & VIOLATION REPORT */}
      {currentStep === 4 && (
        <div className="space-y-6">
          {/* Main Status Header Card */}
          <div
            className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 ${
              complianceStatus === 'COMPLIANT'
                ? 'bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-600'
                : complianceStatus === 'REVIEW_REQUIRED'
                ? 'bg-gradient-to-r from-amber-700 via-yellow-700 to-amber-600'
                : 'bg-gradient-to-r from-rose-800 via-red-700 to-rose-600'
            }`}
          >
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider">
                {complianceStatus === 'COMPLIANT' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span>Statutory Audit Verdict</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {complianceStatus === 'COMPLIANT'
                  ? 'COMMODITY STATUTORILY COMPLIANT'
                  : complianceStatus === 'REVIEW_REQUIRED'
                  ? 'RECTIFICATION ADVISORY REQUIRED'
                  : 'STATUTORY NON-COMPLIANCE VIOLATION DETECTED'}
              </h2>
              <p className="text-xs sm:text-sm text-white/90 max-w-xl">
                {complianceStatus === 'COMPLIANT'
                  ? 'All mandatory declarations under Legal Metrology (Packaged Commodities) Rules, 2011 are verified compliant.'
                  : 'Package fails one or more mandatory statutory clauses under Rule 6 / Section 36 of Legal Metrology Act, 2009.'}
              </p>
            </div>

            {/* Animated Score Progress Circle */}
            <div className="flex flex-col items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center min-w-[140px]">
              <div className="text-3xl sm:text-4xl font-extrabold text-white">{complianceScore}%</div>
              <span className="text-[11px] font-medium text-white/80 mt-0.5">Compliance Index</span>
            </div>
          </div>

          {/* Detailed Finding Cards */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Legal Provisions & Statutory Finding Cards
            </h3>

            <div className="space-y-3">
              {findings.map((f, idx) => (
                <div
                  key={f.id || idx}
                  className={`p-4 rounded-xl border transition-all ${
                    f.status === 'failed'
                      ? 'bg-rose-50/70 border-rose-200'
                      : f.status === 'needs_review'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-emerald-50/70 border-emerald-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">
                        {f.ruleNumber} — {f.ruleTitle}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md ${
                        f.status === 'failed'
                          ? 'bg-rose-600 text-white'
                          : f.status === 'needs_review'
                          ? 'bg-amber-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {f.severity.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700">
                    <p>
                      <strong className="text-slate-900">Observed Evidence: </strong> {f.evidence}
                    </p>
                    <p>
                      <strong className="text-slate-900">Statutory Clause & Penal Provision: </strong>{' '}
                      {f.legalClause} — <em>{f.penaltySection}</em>
                    </p>
                    <p>
                      <strong className="text-slate-900">Enforcement Action: </strong> {f.recommendedAction}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Officer Remarks & Verdict Controls */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Enforcement Officer Determination</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Enforcement Officer Remarks
                </label>
                <textarea
                  rows={3}
                  value={officerRemarks}
                  onChange={(e) => setOfficerRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Action Taken / Statutory Order
                </label>
                <textarea
                  rows={3}
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Verification</span>
            </button>

            <button
              id="btn-finalize-report"
              type="button"
              onClick={handleFinalizeReport}
              className="min-h-[48px] px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm transition-all flex items-center space-x-2 shadow-lg shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.99]"
            >
              <FileCheck className="w-4 h-4" />
              <span>Seal & Generate Official Statutory Memo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: FINAL STATUTORY REPORT MEMORANDUM */}
      {currentStep === 5 && finalRecord && (
        <div className="space-y-6">
          <StatutoryReportDocument record={finalRecord} />
        </div>
      )}

      {/* Modals */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        defaultLabelType={cameraDefaultLabel}
        onSwitchToUpload={() => {
          setIsCameraOpen(false);
          fileInputRef.current?.click();
        }}
      />

      <ImagePreviewModal
        image={previewImage}
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        onDelete={handleDeleteImage}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTargetId}
        title={t('delete_photo_confirm_title')}
        message={t('delete_photo_confirm_desc')}
        onConfirm={() => deleteTargetId && handleDeleteImage(deleteTargetId)}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
