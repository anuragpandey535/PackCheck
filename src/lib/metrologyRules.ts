import { MetrologyRuleItem } from '../types';

export const LEGAL_METROLOGY_RULES: MetrologyRuleItem[] = [
  {
    id: 'rule-6-1-a',
    ruleNumber: 'Rule 6(1)(a)',
    title: 'Name and Address of Manufacturer / Packer / Importer',
    category: 'Manufacturer Identity',
    description: 'Every package shall bear the name and complete address of the manufacturer, or where manufacturer is not the packer, name and address of the manufacturer and packer, or for imported packages, the name and address of the importer.',
    mandatoryRequirement: 'Full postal address including street, city, state, and PIN code. Merely website or email is insufficient.',
    applicableActSection: 'Section 36(1) of Legal Metrology Act, 2009',
    penaltyFirstOffense: 'Fine up to ₹25,000',
    penaltySubsequent: 'Fine up to ₹50,000 or imprisonment up to 1 year or both',
  },
  {
    id: 'rule-6-1-b',
    ruleNumber: 'Rule 6(1)(b)',
    title: 'Common or Generic Name of the Commodity',
    category: 'Commodity Identity',
    description: 'The common or generic name of the commodity contained in the package and in case of packages with more than one product, the name and quantity of each product.',
    mandatoryRequirement: 'Must clearly state what the product is in plain language on the principal display panel.',
    applicableActSection: 'Section 36(1) of Legal Metrology Act, 2009',
    penaltyFirstOffense: 'Fine up to ₹25,000',
    penaltySubsequent: 'Fine up to ₹50,000 or imprisonment up to 1 year',
  },
  {
    id: 'rule-6-1-c',
    ruleNumber: 'Rule 6(1)(c)',
    title: 'Net Quantity in Standard Units of Weight, Measure or Number',
    category: 'Quantity & Units',
    description: 'The net quantity in terms of the standard unit of weight or measure, of the commodity contained in the package or where the commodity is sold by number, the number of the commodity contained in the package.',
    mandatoryRequirement: 'Must use standard metric units (g, kg, ml, l, m, cm, N/U). Symbols must be standard (e.g., "g" or "kg", not "Gms" or "Kgs").',
    applicableActSection: 'Section 36(1) & Section 36(2) of Legal Metrology Act, 2009',
    penaltyFirstOffense: 'Fine up to ₹25,000 (Short measure up to ₹50,000)',
    penaltySubsequent: 'Fine up to ₹1,00,000 or imprisonment up to 1 year',
  },
  {
    id: 'rule-6-1-d',
    ruleNumber: 'Rule 6(1)(d)',
    title: 'Month and Year of Manufacture / Packing / Import',
    category: 'Date Declaration',
    description: 'The month and year in which the commodity is manufactured or pre-packed or imported shall be declared conspicuously on the package.',
    mandatoryRequirement: 'Must be formatted as MM/YYYY or Month Year. E.g., "08/2026" or "Aug 2026". Best before / Expiry required for perishable items.',
    applicableActSection: 'Section 36(1) of Legal Metrology Act, 2009',
    penaltyFirstOffense: 'Fine up to ₹25,000',
    penaltySubsequent: 'Fine up to ₹50,000',
  },
  {
    id: 'rule-6-1-e',
    ruleNumber: 'Rule 6(1)(e)',
    title: 'Maximum Retail Price (MRP) - Inclusive of All Taxes',
    category: 'Pricing',
    description: 'The retail sale price of the package shall clearly be declared in the Indian Currency as "Maximum Retail Price" or "MRP ₹... (inclusive of all taxes)" or "MRP Rs. ... incl. of all taxes".',
    mandatoryRequirement: 'Must include the words "(inclusive of all taxes)". Smudging, altering, or charging above declared MRP is strictly prohibited.',
    applicableActSection: 'Section 36(1) & Rule 18(1) of PCR 2011',
    penaltyFirstOffense: 'Fine up to ₹25,000 (Overcharging up to ₹2,000 to ₹5,000 compounding)',
    penaltySubsequent: 'Fine up to ₹50,000 or prosecution',
  },
  {
    id: 'rule-6-11',
    ruleNumber: 'Rule 6(11)',
    title: 'Unit Sale Price (USP) Declaration (2021/2022 Amendment)',
    category: 'Unit Sale Price',
    description: 'Mandatory declaration of Unit Sale Price on all pre-packaged commodities containing more than 1 kg / 1 L or multi-packs to allow consumers to compare prices easily across pack sizes.',
    mandatoryRequirement: 'Format: "₹ XX.XX per g" or "₹ XX.XX per kg" for solid, "₹ XX.XX per ml" or "₹ XX.XX per L" for liquids, "₹ XX.XX per piece / item" for numbers. Must be displayed alongside MRP.',
    applicableActSection: 'Section 36(1) of Legal Metrology Act, 2009',
    penaltyFirstOffense: 'Fine up to ₹25,000',
    penaltySubsequent: 'Fine up to ₹50,000',
  },
  {
    id: 'rule-6-10',
    ruleNumber: 'Rule 6(10)',
    title: 'Country of Origin / Assembly for Imported Goods',
    category: 'Origin Declaration',
    description: 'Every imported pre-packaged commodity shall clearly declare the Country of Origin or manufacture on the principal display panel.',
    mandatoryRequirement: 'Must explicitly state "Country of Origin: [Country]" or "Made in [Country]".',
    applicableActSection: 'Section 36(1) of Legal Metrology Act, 2009',
    penaltyFirstOffense: 'Fine up to ₹25,000',
    penaltySubsequent: 'Fine up to ₹50,000 or seizure of goods',
  },
  {
    id: 'rule-6-1-g',
    ruleNumber: 'Rule 6(1)(g)',
    title: 'Consumer Care / Grievance Redressal Details',
    category: 'Consumer Grievance',
    description: 'Name, address, telephone number and e-mail address of the person or officer who can be contacted by the consumer in case of complaints.',
    mandatoryRequirement: 'Must contain at least 4 items: Contact Person/Officer title, Postal Address, Helpline Phone/Toll-Free, and Active Email ID.',
    applicableActSection: 'Section 36(1) of Legal Metrology Act, 2009',
    penaltyFirstOffense: 'Fine up to ₹25,000',
    penaltySubsequent: 'Fine up to ₹50,000',
  },
  {
    id: 'rule-7',
    ruleNumber: 'Rule 7 & Table I',
    title: 'Minimum Font Height & Principal Display Panel (PDP) Size',
    category: 'Typography & Visibility',
    description: 'Declarations shall be printed in prominent type, color contrast, and with a minimum font height determined by the package net quantity and display panel surface area.',
    mandatoryRequirement: 'For net weight ≤ 50g: min 1mm (blown/moulded 2mm); 50g-200g: min 2mm; 200g-1kg: min 4mm; >1kg: min 6mm height.',
    applicableActSection: 'Rule 7 & Rule 9 of PCR 2011',
    penaltyFirstOffense: 'Fine up to ₹25,000',
    penaltySubsequent: 'Fine up to ₹50,000',
  },
  {
    id: 'rule-18',
    ruleNumber: 'Rule 18(1)',
    title: 'Prohibition on Overcharging Above Declared MRP',
    category: 'Retail Enforcement',
    description: 'No retail dealer or other person including manufacturer, packer, or importer shall sell any commodity in packaged form at a price exceeding the maximum retail price declared thereon.',
    mandatoryRequirement: 'Dual pricing or altering stickers over existing MRP is illegal under Legal Metrology Rules.',
    applicableActSection: 'Section 36(1) read with Rule 18(1)',
    penaltyFirstOffense: 'Compounding fine ₹2,000 to ₹25,000',
    penaltySubsequent: 'Fine up to ₹50,000 or court prosecution',
  },
];

export interface SamplingRuleResult {
  requiredSample: number;
  minInitialSample?: number;
  ruleReference: string;
  samplingPlan: string;
  maxAllowedDefects: number;
  note: string;
}

export const getStatutorySampleSize = (lotSize: number | string): SamplingRuleResult => {
  const lot = typeof lotSize === 'string' ? parseInt(lotSize, 10) : lotSize;
  if (isNaN(lot) || lot <= 0) {
    return {
      requiredSample: 0,
      ruleReference: 'Legal Metrology (PCR 2011)',
      samplingPlan: 'Standard Inspection',
      maxAllowedDefects: 0,
      note: 'Enter total stock size to determine mandatory sample size.',
    };
  }

  let requiredSample = 20;
  let samplingPlan = '100 – 500 packets';
  let maxAllowedDefects = 1;

  if (lot < 100) {
    requiredSample = Math.min(lot, 10);
    samplingPlan = 'Under 100 packets';
    maxAllowedDefects = 0;
  } else if (lot <= 500) {
    requiredSample = 20;
    samplingPlan = '100 to 500 packets';
    maxAllowedDefects = 1;
  } else if (lot <= 3200) {
    requiredSample = 50;
    samplingPlan = '501 to 3,200 packets';
    maxAllowedDefects = 3;
  } else {
    requiredSample = 80;
    samplingPlan = 'More than 3,200 packets';
    maxAllowedDefects = 5;
  }

  return {
    requiredSample,
    minInitialSample: requiredSample,
    ruleReference: 'Legal Metrology Rules (Fifth Schedule)',
    samplingPlan,
    maxAllowedDefects,
    note: `Rule requires testing a sample size of at least ${requiredSample} packets before generating the legal report.`,
  };
};
