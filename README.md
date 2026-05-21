# UPYOG Property Tax Analytics Dashboard (NUDM Multi-Tenant Platform)

A premium, interactive, and high-fidelity Property Tax Analytics Dashboard built in React, TypeScript, and Vite. The dashboard represents a multi-tenant corporate platform serving 10 Indian cities (Delhi, Mumbai, Pune, Bengaluru, Chennai, Hyderabad, Ahmedabad, Kolkata, Jaipur, Lucknow) with 1,000 property records and a client-side AI Chat Assistant integrated using the Google Gemini API.

---

## 🎨 Design & Theme Aesthetics

The application implements a premium, dark-mode glassmorphic interface designed with:
- **Curated HSL Color Tokens**: Indigo accent primaries, deep space background, emerald approvals, amber warnings, and ruby rejections.
- **Glassmorphism Panels**: Semi-transparent backgrounds, subtle borders, and dynamic backdrop-blur filters.
- **Micro-Animations & Transitions**: Interactive hover scales, ambient glow effects, bounce animations, and page load fade-ins.
- **Modern Typography**: Powered by Google Fonts (Outfit & Plus Jakarta Sans).
- **Responsive Layout**: Designed for seamless visualization on smartphones, tablets, and high-resolution monitors.

---

## 🚀 Key Features Implemented

### 1. Real-Time KPI Cards (Task 1)
- Computes and renders four essential KPIs:
  - **Total Properties Registered**
  - **Total Properties Approved**
  - **Total Properties Rejected**
  - **Total Tax Collection (INR)**
- Updates instantly with smooth micro-animations when selecting a different municipal Corporation (tenant) in the filter dropdown.

### 2. Live Visual Analytics (Task 2 & Bonus)
- **Property Status Comparison**: A multi-series bar chart showing Approved, Rejected, and Pending counts side-by-side across all 10 cities. Highlights the currently active tenant with high contrast.
- **Revenue Collection**: A styled gradient bar chart rendering total property tax collected per city.
- **Property Distribution**: A modern donut chart displaying property usage types (Residential, Commercial, Industrial, Mixed Use, Agricultural) with interactive legend overlays.

### 3. Property Auditor Ledger (Task 3)
- Paginated table showing property records (10 per page) with advanced controls:
  - Text search by Owner Name, Address, or Property ID.
  - Multi-filter selector by Status and Usage Type.
- **Property Inspector Modal**: Click *Inspect* on any record to open a premium inspector card showcasing extensive attributes (ward, floor count, registration date, annual tax, and total tax collected).

### 4. Client-Side AI Assistant (Task 4)
- Floating assistant panel with a scrollable conversation interface, suggestions, and typing indicator.
- **Double-Engine Mode**:
  - **Local Intelligent Engine**: Runs offline out-of-the-box. Uses keyword parsing to compute exact stats dynamically from the actual 1,000 property records (e.g., "compare total registrations between Pune and Jaipur").
  - **Gemini 1.5 Flash Engine**: Authenticates using a client-side API Key stored in localStorage. Sends the current aggregated dataset summary as context so the LLM can answer arbitrary user questions.
- **API Settings Dialog**: Accessible directly from the sidebar. Users can input and test their Google Gemini API keys securely.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Charting**: Recharts
- **Icons**: Lucide React
- **AI SDK**: @google/generative-ai
- **Styling**: Pure CSS (Design Tokens & custom variables)

---

## 📦 Setup & Installation Instructions

### Prerequisites
Make sure you have Node.js (version 18 or above) and npm installed.

### 1. Clone & Enter Project Directory
```bash
git clone <repository-url>
cd niua
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to the local URL (usually `http://localhost:5173`).

### 4. Build Production Bundle
To compile TypeScript and bundle the application:
```bash
npm run build
```

---

## 🤖 Configuring the Gemini AI Assistant

1. Open the application.
2. Click on the **Gemini Settings** (Key icon) in the bottom-left sidebar.
3. Paste a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).
4. Click **Save API Key**. The chat assistant badge will automatically change from `Local Engine (Offline)` to `Gemini 1.5 Flash`.
5. Start asking custom analytical questions! (e.g., *"What is the overall average tax collected?"*)
