export type LanguageCode = 'en' | 'hi' | 'mr' | 'bn' | 'ta' | 'te';

export type LabelType = 'front' | 'back' | 'side' | 'mrp' | 'other';

export interface InspectionImage {
  id: string;
  file?: File;
  previewUrl: string;
  labelType: LabelType;
  timestamp: string;
  source: 'camera' | 'upload';
  dimensions?: { width: number; height: number };
}

export type ComplianceStatus = 'COMPLIANT' | 'REVIEW_REQUIRED' | 'NON_COMPLIANT';

export type FindingSeverity = 'major_violation' | 'minor_violation' | 'advisory' | 'compliant';

export interface DeclarationField {
  id: string;
  fieldName: string;
  ruleReference: string;
  extractedValue: string;
  status: 'passed' | 'violation' | 'warning' | 'missing';
  confidence: number;
  expectedFormat?: string;
  fontHeightMm?: number;
  minRequiredFontMm?: number;
  legalNote?: string;
}

export interface ComplianceFinding {
  id: string;
  ruleNumber: string;
  ruleTitle: string;
  severity: FindingSeverity;
  evidence: string;
  explanation: string;
  legalClause: string;
  penaltySection: string;
  recommendedAction: string;
  status: 'passed' | 'failed' | 'needs_review';
}

export interface InspectionRecord {
  id: string;
  memoNumber: string;
  createdAt: string;
  commodityName: string;
  category: string;
  packageType: string;
  brand: string;
  manufacturer: string;
  mfgAddress: string;
  countryOfOrigin: string;
  netQuantity: string;
  mrp: string;
  unitSalePrice: string;
  mfgDate: string;
  expiryDate?: string;
  batchNumber?: string;
  consumerCare: string;
  status: ComplianceStatus;
  score: number;
  officerName: string;
  officerDesignation: string;
  inspectionLocation: string;
  storeName: string;
  storeAddress: string;
  declarations: DeclarationField[];
  findings: ComplianceFinding[];
  images: InspectionImage[];
  remarks: string;
  actionTaken: string;
  lotSize?: number;
  samplesTested?: number;
  sampleSufficient?: boolean;
  statutorySamplingNote?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

export interface MetrologyRuleItem {
  id: string;
  ruleNumber: string;
  title: string;
  category: string;
  description: string;
  mandatoryRequirement: string;
  exemptions?: string;
  applicableActSection: string;
  penaltyFirstOffense: string;
  penaltySubsequent: string;
}

export interface OfficerProfile {
  id: string;
  name: string;
  badgeNumber: string;
  designation: string;
  zone: string;
  email: string;
  phone: string;
  totalInspections: number;
  activeStatus: boolean;
}
