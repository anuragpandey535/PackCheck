# PackCheck ⚖️🔍
### AI-Powered Legal Metrology Compliance & Inspection System

**PackCheck** is an intelligent Legal Metrology enforcement and packaged commodities audit platform built in compliance with **The Legal Metrology Act, 2009** and the **Legal Metrology (Packaged Commodities) Rules, 2011 (PCR 2011)**.

---

## 🌟 Key Features

### 1. 🤖 Multimodal AI Vision OCR & Declaration Audit
- Automated OCR scanning of front, back, and display panels of packaged goods.
- Extraction and validation of **8 Mandatory Statutory Declarations** under **Rule 6**:
  - Name & Complete Postal Address of Manufacturer / Packer / Importer (Rule 6(1)(a))
  - Generic / Common Commodity Name (Rule 6(1)(b))
  - Net Quantity in Standard SI Metric Units (Rule 6(1)(c))
  - Month & Year of Manufacture / Packing (Rule 6(1)(d))
  - Maximum Retail Price (MRP) with tax-inclusivity phrasings (Rule 6(1)(e))
  - Unit Sale Price (USP) per gram/ml/piece (Rule 6(11) 2022 Mandate)
  - Country of Origin for imported goods (Rule 6(10))
  - Consumer Care & Grievance Contact details (Rule 6(1)(g))

### 2. 🏷️ Batch Identification & Consignment Segregation
- Automated extraction of production Batch Numbers (`B.No.`, `BN`, `LOT`, `Batch Code`) from thermal inkjet coding stamps and crimp seals.
- **Batch Segregation Dashboard**: Organizes inspected goods into distinct batches with batch-level compliance scoring, defect rates, and unit breakdowns.

### 3. 📊 Statutory Sampling Calculator (Fifth Schedule PCR 2011)
- Automatic statutory sample size computation based on total shop/warehouse lot stock:
  - **100 to 500 packets** $\to$ Minimum sample of **20 packets**
  - **501 to 3,200 packets** $\to$ Minimum sample of **50 packets**
  - **More than 3,200 packets** $\to$ Minimum sample of **80 packets**
- Maximum Permissible Error (MPE) and defect tolerance checking before statutory notice issuance.

### 4. 📜 Official Legal Memorandum Generator
- Generates official, print-ready statutory inspection reports and compounding notices under **Section 36(1)** and **Rule 32**.
- Complete with inspection location, officer badges, photographic evidence, and formal legal clauses.

### 5. 💾 Dual-Layer Persistent Storage
- Offline-ready browser persistence (`localStorage`) synchronized with server-side file-backed storage (`data/inspections.json`).

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend:** Node.js, Express, Vite Middleware
- **AI Engine:** Google GenAI Multimodal Vision (`@google/genai` with Gemini Vision models)
- **Dev Tools:** tsx, esbuild

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/anuragpandey535/packcheck.git
cd packcheck
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and add your Gemini API key:
```bash
cp .env.example .env
```
Inside `.env`:
```env
GEMINI_API_KEY="your_google_gemini_api_key"
APP_URL="http://localhost:3000/"
```

### 4. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚖️ Legal Framework References
- **The Legal Metrology Act, 2009** (Act No. 1 of 2010)
- **Legal Metrology (Packaged Commodities) Rules, 2011 (PCR 2011)**
- **Ministry of Consumer Affairs Gazette Amendments (2021 & 2022 Mandates)**
