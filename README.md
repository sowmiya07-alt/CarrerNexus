# CareerNexus — AI-Powered College Placement Intelligence & Career Readiness Platform

CareerNexus is a full-stack, enterprise-style placement analytics and career-readiness platform designed to analyze anonymized student academic, technical, assessment, internship, and historical placement data.

## System Architecture

The project is located at: `C:\Users\SOWMIYA\Desktop\CareerNexus`

```
CareerNexus/
├── package.json               # Root workspace configuration & scripts
├── vite.config.ts             # Vite dev server + proxy setup to Express API
├── tailwind.config.js         # Tailwind CSS SaaS theme configuration
├── server/
│   ├── src/
│   │   ├── index.ts           # Server entry point
│   │   ├── db/                # SQLite database schema, initialization, and 520+ record seed script
│   │   ├── ml/                # Logistic Regression, Random Forest, GBDT, SHAP, and K-Means engines
│   │   ├── services/          # Scoring, Skill Gap, Company Matching, and Intervention services
│   │   ├── middleware/        # JWT Authentication & Role authorization
│   │   └── routes/            # REST API endpoints
└── src/
    ├── App.tsx                # Application router and session controller
    ├── pages/                 # Student, Admin, ML Workbench, and What-If Simulator views
    └── components/            # Reusable SVG gauges, stat cards, badges, navbar, and charts
```

## Key Features

1. **Relational Database Engine & 520 Synthetic Records**:
   - SQLite database populated with statistically correlated student profiles across 5 engineering departments and 4 graduating batches.

2. **Machine Learning Pipeline (Logistic Regression, Random Forest, GBDT)**:
   - Evaluates models on 80/20 train/test partition using Accuracy, Precision, Recall, F1-Score, ROC-AUC, and Confusion Matrices.

3. **Explainable AI (SHAP & Feature Attribution)**:
   - Identifies positive feature drivers (e.g. CGPA, Coding score) and improvement risk factors.

4. **Rule-Based Readiness Score vs. ML Likelihood**:
   - Rule-based Readiness Score (0-100) with configurable admin weights cleanly demarcated from ML Placement Likelihood (%).

5. **What-If Career Simulator**:
   - Dynamic parameter sliders allowing real-time forecasting of placement likelihood and score changes.

6. **Skill-Gap Analysis & Company Matching**:
   - Detailed missing skills breakdown, learning roadmaps, and company profile matching.

7. **Admin Placement Console & Reports**:
   - Executive KPIs, department placement rate bar charts, salary package histograms, intervention rosters, and CSV exports.

## Demo Credentials

- **Admin Account**: `admin@careernexus.demo` / Password: `demo1234`
- **Student Account**: `student@careernexus.demo` / Password: `demo1234`

## Getting Started

To install dependencies and run locally:

```bash
# 1. Install dependencies
npm install
cd server && npm install && cd ..

# 2. Seed database & train ML models
npm run server:seed

# 3. Start full-stack server
npm run dev
```

---

*Disclaimers:*
- All ML predictions display the required disclaimer: *"Estimated placement likelihood based on historical training data."*
- All student data is anonymized and generated synthetically for demonstration purposes.
