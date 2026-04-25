// The Blueprint — 10 Year Roadmap
// Each leaf bullet has a stable id used as DB key.

export type Item = { id: string; label: string };
export type SubSection = { id: string; title: string; items: Item[] };
export type Section = { id: string; title: string; subs: SubSection[] };
export type Category = {
  slug: string;
  number: string;
  kind: "career" | "skill";
  title: string;
  short: string;
  intro: string;
  sections: Section[];
};

const c = (slug: string, number: string, kind: "career" | "skill", title: string, short: string, intro: string, sections: Section[]): Category => ({
  slug, number, kind, title, short, intro, sections,
});

// Helper: build sub with auto ids
const sub = (catSlug: string, secNum: string, subNum: string, title: string, items: string[]): SubSection => ({
  id: `${catSlug}.${secNum}.${subNum}`,
  title,
  items: items.map((label, i) => ({
    id: `${catSlug}.${secNum}.${subNum}.${i + 1}`,
    label,
  })),
});

const sec = (id: string, title: string, subs: SubSection[]): Section => ({ id, title, subs });

// ============ CAREER 1: DATA SCIENCE ============
const dataScience = c(
  "data-science",
  "Career 1",
  "career",
  "Data Science, Analysis, Research & Storytelling",
  "Anchor career — the data spine under your public policy expertise.",
  "Your anchor career and the data spine that supports your public policy specialty and your CFF day job. Statistics, ML, dashboards and research methods are not for their own sake — they are how you turn KIPPRA, KNBS, CBK and CFF data into the analyses, briefs and visualisations that build your reputation as a Kenya policy expert.",
  [
    sec("1.1", "Foundations of Data Science", [
      sub("data-science", "1.1", "1", "Mathematics & Statistics", [
        "Linear Algebra: Vectors, matrices, matrix multiplication",
        "Linear Algebra: Eigenvalues and eigenvectors",
        "Linear Algebra: Singular Value Decomposition (SVD)",
        "Linear Algebra: Applications in machine learning models",
        "Calculus: Differentiation and integration",
        "Calculus: Partial derivatives",
        "Calculus: Gradient descent and optimization",
        "Probability: Bayesian vs frequentist probability",
        "Probability: Conditional probability",
        "Probability: Distributions (Normal, Binomial, Poisson)",
        "Probability: Bayes' theorem and applications",
        "Inference: Hypothesis testing (t-tests, chi-square, ANOVA)",
        "Inference: p-values and confidence intervals",
        "Inference: A/B testing design and analysis",
        "Inference: Statistical power and sample size",
        "Inference: Type I and Type II errors",
        "Regression: Simple and multiple linear regression",
        "Regression: Logistic regression",
        "Regression: Ridge, Lasso, Elastic Net regularization",
        "Regression: Polynomial regression",
      ]),
      sub("data-science", "1.1", "2", "Programming Languages", [
        "Python: Core (data types, loops, functions, OOP, error handling)",
        "Python: NumPy — numerical computing",
        "Python: Pandas — data manipulation, cleaning, aggregation",
        "Python: Matplotlib & Seaborn",
        "Python: Plotly & Dash",
        "Python: Scikit-learn",
        "Python: TensorFlow / Keras",
        "Python: PyTorch",
        "R: Tidyverse (dplyr, ggplot2, tidyr)",
        "R: Statistical modeling",
        "R: R Markdown for reporting",
        "SQL: Window functions, CTEs, subqueries",
        "SQL: Query optimization and indexing",
        "SQL: PostgreSQL, MySQL, BigQuery",
        "NoSQL: MongoDB basics",
        "JS/TS: Node.js backend",
        "JS/TS: React for data dashboards",
        "JS/TS: D3.js for custom visualizations",
      ]),
      sub("data-science", "1.1", "3", "Data Engineering", [
        "ETL vs ELT architectures",
        "Apache Airflow workflow orchestration",
        "dbt for transformation",
        "Apache Spark and PySpark",
        "Hadoop ecosystem basics",
        "Kafka for real-time streaming",
        "AWS: S3, EC2, RDS, SageMaker, Lambda",
        "GCP: BigQuery, Vertex AI, Cloud Run",
        "Azure: ML, Synapse, Data Factory",
        "Snowflake / Redshift / BigQuery architectures",
        "Star and snowflake schema design",
        "Data lake vs warehouse vs lakehouse",
      ]),
    ]),
    sec("1.2", "Machine Learning & AI", [
      sub("data-science", "1.2", "1", "Supervised Learning", [
        "Decision Trees and Random Forests",
        "Gradient Boosting: XGBoost, LightGBM, CatBoost",
        "Support Vector Machines (SVM)",
        "K-Nearest Neighbors (KNN)",
        "Naive Bayes",
        "Time series regression",
        "Cross-validation strategies",
        "Confusion matrices, ROC-AUC, precision-recall",
        "RMSE, MAE, R-squared",
        "Overfitting, underfitting, bias-variance tradeoff",
      ]),
      sub("data-science", "1.2", "2", "Unsupervised Learning", [
        "K-Means, DBSCAN, Hierarchical clustering",
        "Gaussian Mixture Models",
        "PCA (Principal Component Analysis)",
        "t-SNE, UMAP",
        "Autoencoders",
        "Isolation Forest",
        "One-class SVM",
        "Fraud detection / system monitoring applications",
      ]),
      sub("data-science", "1.2", "3", "Deep Learning & Neural Networks", [
        "Perceptrons, activation functions",
        "Backpropagation and gradient descent variants",
        "Batch normalization, dropout, regularization",
        "CNNs: Image classification and object detection",
        "Transfer learning with pretrained models",
        "RNN/LSTM/GRU sequence modeling",
        "NLP applications",
        "Attention mechanism",
        "BERT, GPT architecture",
        "Fine-tuning and prompt engineering",
        "RAG (Retrieval Augmented Generation)",
        "Building AI-powered applications",
      ]),
      sub("data-science", "1.2", "4", "MLOps", [
        "REST API deployment with FastAPI/Flask",
        "Containerization with Docker",
        "Kubernetes for scaling ML services",
        "Data drift / concept drift detection",
        "Model performance monitoring",
        "Retraining pipelines",
        "MLflow for experiment management",
        "Weights & Biases (W&B)",
        "DVC (Data Version Control)",
      ]),
    ]),
    sec("1.3", "Data Analysis & BI", [
      sub("data-science", "1.3", "1", "Exploratory Data Analysis", [
        "Data profiling and quality assessment",
        "Univariate, bivariate, multivariate analysis",
        "Missing value strategies",
        "Outlier detection and treatment",
        "Feature engineering and selection",
      ]),
      sub("data-science", "1.3", "2", "BI Tools", [
        "Power BI: DAX modeling",
        "Power BI: Power Query",
        "Power BI: Dashboard design and publishing",
        "Tableau: Calculated fields and LOD",
        "Tableau: Interactive dashboards",
        "Tableau Server / Online",
        "Google Looker Studio: Google ecosystem",
        "Looker Studio: Blended data sources",
      ]),
      sub("data-science", "1.3", "3", "Financial Data Analysis", [
        "Financial statement analysis (P&L, BS, CF)",
        "Time series analysis for financial data",
        "Portfolio analysis and risk metrics",
        "Monte Carlo simulations",
        "Quant finance fundamentals",
      ]),
    ]),
    sec("1.4", "Research Skills", [
      sub("data-science", "1.4", "1", "Research Methodology", [
        "Quantitative research design",
        "Qualitative research methods",
        "Mixed methods research",
        "Literature review and systematic reviews",
        "Research ethics and data privacy",
      ]),
      sub("data-science", "1.4", "2", "Academic & Industry Research", [
        "Reading and interpreting research papers",
        "Replicating research studies",
        "Publishing research findings",
        "Conference presentations",
        "Grant writing basics",
      ]),
    ]),
    sec("1.5", "Software Development", [
      sub("data-science", "1.5", "1", "Engineering Principles", [
        "SOLID principles",
        "Design patterns (MVC, Factory, Observer)",
        "Clean code practices",
        "Test-driven development (TDD)",
        "Agile and Scrum",
      ]),
      sub("data-science", "1.5", "2", "Backend Development", [
        "API design and REST principles",
        "GraphQL",
        "Authentication and authorization (JWT, OAuth)",
        "Database design and optimization",
        "Microservices architecture",
        "Message queues: RabbitMQ, Redis",
      ]),
      sub("data-science", "1.5", "3", "DevOps & Infrastructure", [
        "Git and version control best practices",
        "CI/CD (GitHub Actions, Jenkins)",
        "Infrastructure as Code (Terraform)",
        "Linux administration",
        "Networking fundamentals",
      ]),
    ]),
    sec("1.6", "Consulting & Freelancing", [
      sub("data-science", "1.6", "1", "Building a Consulting Practice", [
        "Defining your niche and positioning",
        "Building a portfolio and case studies",
        "Pricing services (hourly, project, retainer)",
        "Writing proposals and SOWs",
        "Client onboarding and management",
        "Deliverables and reporting standards",
      ]),
      sub("data-science", "1.6", "2", "International Client Acquisition", [
        "Upwork profile optimization",
        "Toptal application and vetting",
        "LinkedIn B2B outreach strategy",
        "Cold email copywriting for tech consulting",
        "Building referral networks",
      ]),
      sub("data-science", "1.6", "3", "Certifications", [
        "Google Professional Data Engineer",
        "AWS Certified ML Specialty",
        "Microsoft Azure Data Scientist Associate",
        "Databricks Certified Associate Developer (Spark)",
        "Coursera / DeepLearning.AI specializations",
      ]),
    ]),
  ]
);

// ============ CAREER 2: PUBLIC POLICY & KENYA RESEARCH ============
const publicPolicy = c(
  "public-policy",
  "Career 2",
  "career",
  "Public Policy & Kenya Research",
  "Niche expertise — policy analyst with a data spine.",
  "Your specialty: become a Kenya public policy expert who reads the country through data. KIPPRA, KNBS, CBK, the National Treasury, parliamentary committees, county governments — these are the institutions whose work you will read, critique, contribute to, and eventually be cited alongside. Every leaf here pairs naturally with your data science storytelling.",
  [
    sec("2.1", "Kenya's Policy Architecture", [
      sub("public-policy", "2.1", "1", "The Constitution & State Structure", [
        "Constitution of Kenya 2010 — full read-through",
        "Bill of Rights (Chapter 4) and socio-economic rights",
        "Separation of powers: Executive, Legislature, Judiciary",
        "The two levels of government (national + 47 counties)",
        "Schedule 4 — functions of national vs county government",
        "Independent commissions (IEBC, KNCHR, CRA, EACC, OAG)",
        "Public Finance Management Act 2012",
        "Intergovernmental Relations Act 2012",
      ]),
      sub("public-policy", "2.1", "2", "Devolution & County Governments", [
        "How devolution actually works in practice",
        "County Integrated Development Plans (CIDPs)",
        "Equitable share and conditional grants",
        "Commission on Revenue Allocation (CRA) formula",
        "County Assembly oversight role",
        "Ward Development Funds and CDF (NG-CDF)",
        "Performance of devolution: wins, failures, evidence",
      ]),
      sub("public-policy", "2.1", "3", "Vision 2030 & National Plans", [
        "Vision 2030 — three pillars (economic, social, political)",
        "Medium Term Plans (MTP III, MTP IV)",
        "Bottom-Up Economic Transformation Agenda (BETA)",
        "Big Four Agenda — what survived",
        "African Union Agenda 2063 alignment",
        "UN Sustainable Development Goals (SDGs) localisation",
      ]),
    ]),
    sec("2.2", "Kenya's Data & Research Institutions", [
      sub("public-policy", "2.2", "1", "KNBS — Kenya National Bureau of Statistics", [
        "KNBS mandate, structure and Statistics Act 2006",
        "Kenya Population & Housing Census (2019) — every volume",
        "Kenya Continuous Household Survey (KCHS)",
        "Economic Survey (annual) — read cover to cover yearly",
        "Statistical Abstract — annual reference",
        "Quarterly GDP and Quarterly Labour Force Reports",
        "Kenya Integrated Household Budget Survey (KIHBS)",
        "Consumer Price Index (CPI) and inflation methodology",
        "KNBS open data portal — pulling and reshaping data",
      ]),
      sub("public-policy", "2.2", "2", "KIPPRA — Kenya Institute for Public Policy Research", [
        "KIPPRA mandate and funding model",
        "Kenya Economic Report (annual flagship) — every edition",
        "Working papers and policy briefs catalogue",
        "Young Professionals Programme (YPP) — pathway to KIPPRA",
        "KIPPRA-Treasury Macro Model (KTMM) — basics",
        "Reading and writing a KIPPRA-style policy brief",
      ]),
      sub("public-policy", "2.2", "3", "Central Bank of Kenya (CBK)", [
        "Monetary Policy Committee statements and minutes",
        "CBK Bank Supervision Annual Report",
        "Quarterly GDP & Balance of Payments releases",
        "FinAccess Household Survey (CBK / FSD Kenya / KNBS)",
        "Kenya Financial Stability Report",
        "Diaspora remittance survey data",
        "Banking sector prudential ratios and NPL trends",
      ]),
      sub("public-policy", "2.2", "4", "National Treasury & Budget Cycle", [
        "Budget Policy Statement (BPS) — annual",
        "Budget Review and Outlook Paper (BROP)",
        "Division of Revenue Bill / County Allocation of Revenue Bill",
        "Public debt register and debt sustainability analysis",
        "Tax Laws (Amendment) bills — annual changes",
        "Office of the Controller of Budget quarterly reports",
        "Office of the Auditor-General reports — how to read them",
      ]),
      sub("public-policy", "2.2", "5", "Other Key Institutions & Think Tanks", [
        "Parliamentary Budget Office (PBO) reports",
        "IEA Kenya — Institute of Economic Affairs",
        "Tax Justice Network Africa (Nairobi)",
        "Africa Centre for Open Governance (AfriCOG)",
        "Twaweza East Africa — Sauti za Wananchi data",
        "FSD Kenya research catalogue",
        "Kenya Human Rights Commission (KHRC) reports",
        "Mzalendo Trust — parliamentary tracking",
      ]),
    ]),
    sec("2.3", "Sectoral Policy Deep Dives", [
      sub("public-policy", "2.3", "1", "Public Finance & Tax Policy", [
        "Kenya's tax structure (PAYE, VAT, corporate, excise)",
        "Tax Procedures Act and KRA reform",
        "Tax expenditure and revenue forgone reports",
        "Public debt — domestic vs external composition",
        "Eurobond and concessional borrowing",
        "Pension policy and NSSF reforms",
      ]),
      sub("public-policy", "2.3", "2", "Education, Health & Social Policy", [
        "Competency Based Curriculum (CBC) reform",
        "Higher Education Funding Model (2023+)",
        "Social Health Authority (SHA) — successor to NHIF",
        "Universal Health Coverage rollout",
        "Cash transfer programmes (Inua Jamii)",
        "School feeding and nutrition programmes",
      ]),
      sub("public-policy", "2.3", "3", "Agriculture, Climate & Land", [
        "Agricultural Sector Transformation Strategy (ASTGS)",
        "Subsidy programmes (fertiliser, maize) — evidence on impact",
        "National Climate Change Action Plan (NCCAP)",
        "Climate Change Act 2016 and County Climate Change Funds",
        "Kenya's NDC and just transition pathway",
        "Land Act 2012 and the Ndung'u report legacy",
      ]),
      sub("public-policy", "2.3", "4", "MSME, Industrialisation & Trade", [
        "Micro and Small Enterprises Act 2012",
        "Hustler Fund — design, performance, evidence",
        "Special Economic Zones and EPZs",
        "Africa Continental Free Trade Area (AfCFTA) for Kenya",
        "EAC Common Market and trade flows",
        "Kenya's industrial policy — what has actually worked",
      ]),
    ]),
    sec("2.4", "Policy Research Methods", [
      sub("public-policy", "2.4", "1", "Evidence-Based Policymaking", [
        "Theory of Change for policy interventions",
        "Logical frameworks (logframes) and results chains",
        "Randomised Controlled Trials (RCTs) — Kenya examples (GiveDirectly, Twaweza)",
        "Quasi-experimental methods (DiD, RDD, IV, PSM)",
        "Cost-benefit and cost-effectiveness analysis",
        "Distributional analysis (incidence on poor vs rich)",
      ]),
      sub("public-policy", "2.4", "2", "Survey & Administrative Data", [
        "Designing household and firm surveys",
        "Sampling frames using KNBS NASSEP V",
        "CAPI tools (SurveyCTO, KoboToolbox, ODK)",
        "Linking administrative data (KRA, IPRS, eCitizen)",
        "Handling missing data and survey weights",
        "Open data principles and data anonymisation",
      ]),
      sub("public-policy", "2.4", "3", "Policy Communication", [
        "Writing a policy brief (problem, evidence, options, recommendation)",
        "Op-eds in The Standard, Daily Nation, The Elephant, The Continent",
        "Translating regression output for non-technical audiences",
        "Data visualisation for policy (Reuters Graphics standard)",
        "Presenting at parliamentary committees",
        "Engaging with journalists ethically",
      ]),
    ]),
    sec("2.5", "Global & Comparative Lenses", [
      sub("public-policy", "2.5", "1", "Multilateral & Donor Landscape", [
        "World Bank Kenya Country Economic Memorandum",
        "IMF Article IV consultations and programmes (EFF/ECF)",
        "African Development Bank Country Strategy Paper",
        "UN agencies in Kenya (UNDP, UNICEF, UN Women)",
        "FCDO, USAID, GIZ, KfW, AFD, JICA — what each funds",
        "How donor money shows up in the budget",
      ]),
      sub("public-policy", "2.5", "2", "Comparative Policy Cases", [
        "Rwanda: Vision 2050 and developmental state",
        "South Africa: Treasury, Stats SA and SARB as benchmarks",
        "Singapore: long-horizon planning lessons",
        "Chile: independent fiscal council model",
        "India: Aadhaar and DBT — relevance for Kenya",
      ]),
    ]),
    sec("2.6", "Becoming a Public Policy Expert", [
      sub("public-policy", "2.6", "1", "Track Record & Voice", [
        "A personal blog / Substack focused on Kenya policy + data",
        "First five published policy briefs (under your own name)",
        "First op-ed in a national paper",
        "Speaking at one KIPPRA / IEA / FSD event per year",
        "Citations in KIPPRA / World Bank / IMF documents",
        "Building a niche on one issue (e.g. SME finance, fiscal transparency)",
      ]),
      sub("public-policy", "2.6", "2", "Credentials & Networks", [
        "KIPPRA Young Professionals Programme application",
        "Targeted MA / MPP / MPA shortlist (Oxford BSG, HKS, LKY, UCT, UoN)",
        "Fellowships: Mandela Washington, Chevening, Aga Khan, Open Society",
        "Joining ICPAK / IEA / ESK as relevant",
        "LinkedIn presence as a Kenya policy analyst",
      ]),
    ]),
  ]
);

// ============ CAREER 3: CFF & SME / BLENDED FINANCE ============
// Mirrors the 15-module CFF Study scope. This is the operating context of your day job.
const cff = c(
  "cff",
  "Career 3",
  "career",
  "CFF, SME Finance & Blended Capital",
  "Day-job mastery — fund-of-funds, SME finance, blended capital.",
  "Your operating context at the Collaborative for Frontier Finance. CFF is a network builder, knowledge producer and capital facilitator for Small Business Growth Funds across Africa — it does NOT invest directly. Mastering these modules turns you from analyst into the person who runs the data, the research, and eventually the fund-manager portal end-to-end.",
  [
    sec("3.1", "CFF Itself", [
      sub("cff", "3.1", "1", "What CFF Actually Does", [
        "CFF identity: network builder, knowledge producer, capital facilitator (NOT a fund)",
        "ESCP Network — Early Stage Capital Providers",
        "The four workstreams: Network, Learning, LAUNCH+, Capital Linkages",
        "Who's who: Drew, Gila, Arnold, Lisa, Woody and your own role",
        "CFF's funders (FSDA, FCDO, USAID, Argidius, FMO, GFA)",
        "How your Fund Manager Portal fits into the strategy",
      ]),
      sub("cff", "3.1", "2", "LAUNCH+ — CFF's Capital Instrument", [
        "LAUNCH+ design: capital readiness + BDS + first-close support",
        "L+K (LAUNCH+ Kenya) specifics",
        "Investment Policy Statement for LAUNCH+",
        "Cohort selection and onboarding process",
        "Monitoring framework and reporting cadence",
        "Linkage Investment Facility (LIF) pipeline",
      ]),
      sub("cff", "3.1", "3", "Convening & Network Ops", [
        "Annual Gathering — agenda design and outcomes",
        "PAFMA, AFSIC, SOCAP — what they are and CFF's role",
        "State of Play webinar series",
        "Kumu network mapping",
        "Working groups and peer learning sessions",
      ]),
    ]),
    sec("3.2", "SME Definitions & Typologies", [
      sub("cff", "3.2", "1", "Defining the SME / SGB", [
        "SME vs SGB (Small and Growing Business) vs Missing Middle",
        "IFC, World Bank, ILO and Kenya MSE Act definitions compared",
        "Quantitative thresholds: employees, revenue, assets",
        "Qualitative criteria: formality, growth orientation, capital need",
      ]),
      sub("cff", "3.2", "2", "Classification Axes", [
        "Sector (agri, manufacturing, services, tech)",
        "Stage (pre-revenue, early, growth, scale)",
        "Geography (urban primary, secondary city, rural)",
        "Founder profile (women-led, youth-led, refugee-led)",
        "Formality and tax compliance",
        "Growth trajectory (lifestyle, niche, high-growth, gazelle)",
      ]),
    ]),
    sec("3.3", "SME Funding Landscape", [
      sub("cff", "3.3", "1", "Every Instrument", [
        "Equity (common, preferred, convertible)",
        "Debt (senior, subordinated, mezzanine)",
        "Convertible notes and SAFEs",
        "Revenue-Based Financing (RBF)",
        "Quasi-equity / self-liquidating equity",
        "Grants and concessional capital",
        "Guarantees (partial credit, first loss)",
        "Asset-backed and invoice finance",
      ]),
      sub("cff", "3.3", "2", "The Missing Middle Problem", [
        "The $25k–$1m / $1m–$5m gap explained",
        "Why commercial banks don't serve it",
        "Why VC doesn't serve it either",
        "Aspen ANDE / Omidyar / Dalberg evidence base",
        "FSDA Linea and Catalyst Fund case studies",
        "Untapped Global (HBS case)",
      ]),
    ]),
    sec("3.4", "Blended Finance Architecture", [
      sub("cff", "3.4", "1", "Structures", [
        "First-loss capital and concessional tranches",
        "Catalytic vs commercial capital",
        "Guarantees as blending instrument",
        "Technical Assistance facilities (TA)",
        "Returnable grants",
        "Permanent / evergreen capital structures",
      ]),
      sub("cff", "3.4", "2", "Key Actors", [
        "DFIs: BII (CDC), IFC, FMO, Proparco, DEG, Norfund, Swedfund",
        "Bilateral donors: FCDO, USAID, GIZ, SIDA, NORAD",
        "Foundations: MasterCard, Rockefeller, Argidius, Shell Foundation",
        "Local LPs: NSSF Kenya, NSSF Uganda, RBA pension reforms",
        "Convergence Blended Finance database",
      ]),
    ]),
    sec("3.5", "Fund Management Operations", [
      sub("cff", "3.5", "1", "End-to-End Fund Cycle", [
        "Sourcing and pipeline management",
        "Screening and initial assessment",
        "Due diligence (commercial, financial, legal, ESG)",
        "Investment Committee (IC) papers and process",
        "Term sheet negotiation",
        "Documentation and closing",
        "Post-investment monitoring and value-add",
        "Exits: trade sale, secondary, self-liquidating",
      ]),
      sub("cff", "3.5", "2", "Fund Performance Metrics", [
        "IRR (Internal Rate of Return) — gross and net",
        "MOIC / TVPI / DPI / RVPI",
        "PAR30, PAR90 for debt portfolios",
        "DSCR (Debt Service Coverage Ratio)",
        "Loss ratio and recovery rate",
        "Fund expense ratio and management fee economics",
      ]),
    ]),
    sec("3.6", "SME Financial Analysis", [
      sub("cff", "3.6", "1", "Reading the Three Statements", [
        "Income statement walk-through with an African SME",
        "Balance sheet — working capital red flags",
        "Cash flow statement — operating vs financing vs investing",
        "Reconciling profit to cash (the survival metric)",
      ]),
      sub("cff", "3.6", "2", "Ratios & Models", [
        "Liquidity: current ratio, quick ratio, cash conversion cycle",
        "Profitability: gross margin, EBITDA margin, ROE, ROA",
        "Leverage: debt/equity, debt/EBITDA, interest coverage",
        "Efficiency: inventory days, receivables days, payables days",
        "Building a 5-year SME projection model in Excel",
        "Sensitivity and scenario analysis",
        "Practice: full ratio set on Equity Bank or Safaricom annual report",
      ]),
    ]),
    sec("3.7", "Impact Measurement & Reporting", [
      sub("cff", "3.7", "1", "Frameworks", [
        "IRIS+ from the GIIN — core metrics",
        "GIIN Annual Impact Investor Survey",
        "5 Dimensions of Impact (Impact Management Project)",
        "SDG alignment and reporting",
        "IFC Performance Standards (especially PS1 and PS5)",
        "2X Challenge (gender lens) criteria",
      ]),
      sub("cff", "3.7", "2", "MEL & Reporting in Practice", [
        "FSDA logframe and reporting templates",
        "FCDO results framework",
        "USAID INVEST evidence requirements",
        "Annual Impact Report — what good looks like",
        "Survey design for portfolio data collection",
        "Before/after evaluation design",
      ]),
    ]),
    sec("3.8", "African SME Ecosystems", [
      sub("cff", "3.8", "1", "Country Snapshots", [
        "Kenya — Nairobi as a hub, county-level SME landscape",
        "Uganda — pension reform and local LP base",
        "Nigeria — scale and FX risk",
        "Ghana — donor-heavy ecosystem",
        "Rwanda — policy-led environment",
        "Senegal & Cote d'Ivoire — Francophone West Africa",
        "South Africa — most developed SME finance market",
      ]),
      sub("cff", "3.8", "2", "Cross-Cutting Risks", [
        "FX risk and the KES / NGN / GHS / ZAR exposure problem",
        "Regulatory risk and tax regime changes",
        "Political risk and election cycles",
        "Climate risk for agri portfolios",
      ]),
    ]),
    sec("3.9", "Governance, Compliance & Tech", [
      sub("cff", "3.9", "1", "Governance & ESG", [
        "Fund-level governance: Advisory Committee, IC composition",
        "ESG management systems (ESMS)",
        "E&S categorisation (A, B, C)",
        "Anti-bribery and AML/KYC for SME funds",
        "Whistleblower and grievance mechanisms",
      ]),
      sub("cff", "3.9", "2", "Tech Stack for CFF", [
        "Fund Manager Portal (your build) — architecture",
        "Vula, Otter, HubSpot integrations",
        "Salesforce / Airtable patterns for fund ops",
        "GIIN IRIS+ data architecture",
        "Notion / Slite for knowledge management",
      ]),
    ]),
    sec("3.10", "Fundraising & Capital Linkages", [
      sub("cff", "3.10", "1", "For CFF Itself", [
        "GFA, FCDO, FSDA, Argidius pipelines",
        "All Africa Pension Summit (AAPS) — your involvement",
        "3-year budget templates for donor proposals",
        "Impact data packs for past cohorts",
      ]),
      sub("cff", "3.10", "2", "For Fund Managers", [
        "First close, second close, final close mechanics",
        "Anchor LP psychology",
        "Side letters and MFN provisions",
        "Placement agents — when and why",
        "Capital linkage events and warm intros",
      ]),
    ]),
    sec("3.11", "Capacity Building & BDS", [
      sub("cff", "3.11", "1", "LAUNCH+ as a BDS Programme", [
        "BDS taxonomy (Aspen ANDE)",
        "Capital readiness curriculum",
        "1:1 coaching vs cohort delivery",
        "Measuring BDS outcomes (graduation, capital raised)",
        "Designing the next LAUNCH+ cohort evaluation framework",
      ]),
    ]),
    sec("3.12", "Data, Analytics & Research for SME Finance", [
      sub("cff", "3.12", "1", "Your Unique Contribution", [
        "Data architecture for the Fund Manager Portal",
        "State of Play survey — design, fielding, analysis",
        "Portfolio analytics dashboards (Power BI / Looker)",
        "ARIA article pipeline — research + writing cadence",
        "Replicable case study methodology (Linea, Catalyst style)",
        "Building CFF's evidence library as a queryable dataset",
      ]),
    ]),
    sec("3.13", "Your 18-Month Study Plan", [
      sub("cff", "3.13", "1", "Sequenced Milestones", [
        "Months 0–3: Modules A, D, G mastered",
        "Months 4–6: LAUNCH+ portfolio dashboard v1 live",
        "Months 7–9: Co-author next State of Play",
        "Months 10–12: Lead one ARIA article end-to-end",
        "Months 13–15: Own the AAPS data workstream",
        "Months 16–18: Promotion case — research lead",
      ]),
    ]),
  ]
);

// ============ SKILL 1: SALES ============
const sales = c(
  "sales",
  "Skill 1",
  "skill",
  "Sales",
  "Most transferable skill. Underpins everything.",
  "Sales is the most transferable skill you will ever build. It underpins your real estate agency, your consulting practice, your trading fundraising, and every negotiation you will ever have. The world runs on sales.",
  [
    sec("4.1", "Sales Fundamentals", [
      sub("sales", "4.1", "1", "The Sales Mindset", [
        "Reframing sales: service, not manipulation",
        "Buyer psychology",
        "Belief in what you sell",
        "Rejection as data, not failure",
        "Push vs pull selling",
      ]),
      sub("sales", "4.1", "2", "The Sales Process", [
        "Prospecting: ICP",
        "Inbound vs outbound",
        "Cold outreach: email, LinkedIn, phone, WhatsApp",
        "Referral systems",
        "BANT framework",
        "MEDDIC framework",
        "Qualifying questions that don't interrogate",
        "Active listening",
        "Open-ended questioning",
        "Pain point identification",
        "SPIN Selling method",
        "FAB framework",
        "Tailoring presentations",
        "Storytelling in presentations",
        "Feel-felt-found method",
        "Price objections",
        "Timing objections",
        "Trust objections",
        "Assumptive close",
        "Summary close",
        "Trial close",
        "Creating urgency ethically",
        "Follow-up sequences",
        "Value-adding touchpoints",
      ]),
    ]),
    sec("4.2", "Advanced Sales Skills", [
      sub("sales", "4.2", "1", "Consultative Selling", [
        "Becoming a trusted advisor",
        "Solution vs product selling",
        "Long-term client relationships",
        "Account management and upselling",
      ]),
      sub("sales", "4.2", "2", "Real Estate Sales", [
        "Emotional selling",
        "Price-too-high objection",
        "Let-me-think-about-it objection",
        "I-want-more-options objection",
        "Market-might-drop objection",
        "Creating urgency on property deals",
        "Pitching investors vs end-users",
      ]),
      sub("sales", "4.2", "3", "Sales for Consulting", [
        "Selling complex/intangible services",
        "Proposal/SOW as a sales tool",
        "Pricing strategy and anchoring",
        "References and social proof",
        "Sales pipeline for consulting",
      ]),
    ]),
    sec("4.3", "Tools & Systems", [
      sub("sales", "4.3", "1", "Stack", [
        "CRM mastery: HubSpot, Salesforce, Zoho",
        "Email sequences and automation",
        "LinkedIn Sales Navigator",
        "Cold email tools: Apollo, Lemlist",
        "Metrics: conversion, pipeline velocity, win rates",
      ]),
    ]),
    sec("4.4", "Books & Resources", [
      sub("sales", "4.4", "1", "Reading List", [
        "SPIN Selling — Neil Rackham",
        "The Challenger Sale — Matthew Dixon",
        "Never Split the Difference — Chris Voss",
        "How to Win Friends and Influence People — Carnegie",
        "Sell or Be Sold — Grant Cardone",
        "$100M Offers — Alex Hormozi",
      ]),
    ]),
  ]
);

// ============ SKILL 2: NEGOTIATION ============
const negotiation = c(
  "negotiation",
  "Skill 2",
  "skill",
  "Negotiation",
  "Highest ROI skill. Every dollar saved is earned.",
  "Every dollar you don't negotiate away is a dollar earned. In real estate alone, strong negotiation can save or earn you millions per deal. One of the highest ROI skills you can ever develop.",
  [
    sec("5.1", "Negotiation Fundamentals", [
      sub("negotiation", "5.1", "1", "Core Concepts", [
        "BATNA",
        "ZOPA",
        "Reservation point (walk-away)",
        "Anchoring",
        "Distributive vs integrative",
        "Win-win vs win-lose strategies",
      ]),
      sub("negotiation", "5.1", "2", "Tactical Skills", [
        "The power of silence",
        "Mirroring and labeling",
        "Tactical empathy",
        "Calibrated questions (how, what, why)",
        "Ackerman bargaining model",
        "Flinching",
        "Good cop / bad cop",
        "The nibble technique",
        "Deadline pressure",
      ]),
    ]),
    sec("5.2", "Negotiation Contexts", [
      sub("negotiation", "5.2", "1", "Real Estate", [
        "Property purchase price",
        "Buyer's agent",
        "Listing agent",
        "Lease: rent, deposit, terms",
        "Developers / off-plan sellers",
        "Cross-cultural dynamics in Kenya",
      ]),
      sub("negotiation", "5.2", "2", "Business & Consulting", [
        "Consulting fees",
        "Partnership / JV negotiation",
        "Employment & compensation",
        "Vendor / supplier negotiation",
      ]),
    ]),
    sec("5.3", "Books & Resources", [
      sub("negotiation", "5.3", "1", "Reading List", [
        "Never Split the Difference — Chris Voss",
        "Getting to Yes — Fisher, Ury & Patton",
        "Negotiation Genius — Deepak Malhotra",
        "The Art of Negotiation — Michael Wheeler",
      ]),
    ]),
  ]
);

// ============ SKILL 3: PUBLIC SPEAKING ============
const speaking = c(
  "public-speaking",
  "Skill 3",
  "skill",
  "Public Speaking",
  "The multiplier skill. Command rooms, scale ideas.",
  "Public speaking is the multiplier skill. Once you can command a room, your ideas travel further, your clients trust you faster, your deals close more easily, and your brand grows without advertising. The direct upgrade of every other skill you have.",
  [
    sec("6.1", "Fundamentals", [
      sub("public-speaking", "6.1", "1", "Voice & Delivery", [
        "Vocal variety: pitch, pace, volume, tone",
        "Eliminating filler words",
        "Projection and diaphragmatic breathing",
        "Pausing for effect",
        "Enunciation and clarity",
        "Recording yourself for practice",
      ]),
      sub("public-speaking", "6.1", "2", "Body Language", [
        "Eye contact",
        "Posture and stage presence",
        "Hand gestures that reinforce meaning",
        "Stage movement vs standing still",
        "Eliminating nervous habits",
      ]),
      sub("public-speaking", "6.1", "3", "Structure & Content", [
        "Rule of three",
        "Opening hooks (shock, story, question, stat)",
        "Building to a peak",
        "Memorable closings",
        "Hero's journey structure",
        "Problem-Agitate-Solution",
        "Setup, conflict, resolution",
      ]),
    ]),
    sec("6.2", "Types of Speaking", [
      sub("public-speaking", "6.2", "1", "Presentations", [
        "Client presentations for consulting",
        "Investor pitches",
        "Real estate property presentations",
        "Data storytelling for non-technical audiences",
      ]),
      sub("public-speaking", "6.2", "2", "Networking & Social", [
        "30-second introductions",
        "Conversation leadership",
        "Panel discussions and Q&A",
      ]),
      sub("public-speaking", "6.2", "3", "Content Creation", [
        "YouTube / video delivery",
        "Podcast appearances",
        "Webinars and online courses",
      ]),
    ]),
    sec("6.3", "How to Practice", [
      sub("public-speaking", "6.3", "1", "Practice Plan", [
        "Join Toastmasters Nairobi",
        "Record a 2-minute video weekly",
        "Speak at every opportunity",
        "Take every presentation, even small ones",
      ]),
    ]),
    sec("6.4", "Books & Resources", [
      sub("public-speaking", "6.4", "1", "Reading List", [
        "Talk Like TED — Carmine Gallo",
        "The Art of Public Speaking — Dale Carnegie",
        "Steal the Show — Michael Port",
        "Speak to Win — Brian Tracy",
      ]),
    ]),
  ]
);

// ============ SKILL 4: LAW ============
const law = c(
  "law",
  "Skill 4",
  "skill",
  "Law (Real Estate & Contract Focus)",
  "Protect yourself, structure deals, know when to call a lawyer.",
  "You don't need a law degree. You need enough legal knowledge to protect yourself, structure deals correctly, and know when to bring in a lawyer. One of the most financially protective skills you will ever develop.",
  [
    sec("7.1", "Contract Law", [
      sub("law", "7.1", "1", "Elements of a Valid Contract", [
        "Offer and acceptance",
        "Consideration",
        "Capacity to contract",
        "Legality of purpose",
        "Consensus ad idem",
      ]),
      sub("law", "7.1", "2", "Contract Types", [
        "Sale agreements (property)",
        "Lease and tenancy agreements",
        "Service agreements (consulting)",
        "NDAs",
        "MOUs",
        "JV agreements",
        "Employment contracts",
        "Agency agreements",
      ]),
      sub("law", "7.1", "3", "Reading & Interpreting", [
        "Key clauses: payment, delivery, termination, liability",
        "Force majeure",
        "Indemnification & limitation of liability",
        "Arbitration vs litigation",
        "Governing law / jurisdiction",
        "Red flags in any contract",
      ]),
    ]),
    sec("7.2", "Kenyan Property Law", [
      sub("law", "7.2", "1", "Key Statutes", [
        "Land Act 2012",
        "Land Registration Act 2012",
        "Stamp Duty Act",
        "Rent Restriction Act",
        "Physical and Land Use Planning Act 2019",
        "EMCA",
        "Sectional Properties Act 2020",
        "Eviction procedures under Kenyan law",
      ]),
    ]),
    sec("7.3", "Business Law", [
      sub("law", "7.3", "1", "Business Structures", [
        "Sole proprietorship",
        "Partnerships (general & limited)",
        "Limited Liability Companies (Ltd)",
        "Company registration via eCitizen",
        "Private vs public companies",
      ]),
      sub("law", "7.3", "2", "Intellectual Property", [
        "Copyright basics",
        "Trademarks (KIPI)",
        "Patents",
        "Trade secrets / confidentiality",
      ]),
      sub("law", "7.3", "3", "Tax Law Basics", [
        "KRA PIN registration",
        "Income tax: individual & corporate",
        "VAT: thresholds and filing",
        "Capital gains tax",
        "Withholding tax",
        "iTax compliance",
      ]),
    ]),
    sec("7.4", "Using Lawyers Effectively", [
      sub("law", "7.4", "1", "Working With Counsel", [
        "When to hire vs DIY",
        "How to brief a lawyer",
        "Understanding legal invoices",
        "Long-term relationship with an advocate",
        "Specialist advocates: conveyancing, commercial, tax",
      ]),
    ]),
  ]
);

// ============ SKILL 5: BUSINESS MGMT ============
const business = c(
  "business",
  "Skill 5",
  "skill",
  "Business Management",
  "OS that runs everything. Converts skills to enterprises.",
  "The operating system that runs everything else. Without business management skills, your three careers will remain freelance hustles rather than scalable enterprises. This converts skills into businesses.",
  [
    sec("8.1", "Strategy & Planning", [
      sub("business", "8.1", "1", "Strategic Thinking", [
        "Vision, mission, values",
        "Personal brand strategy",
        "Competitive analysis",
        "Blue Ocean vs Red Ocean",
        "Porter's Generic Strategies",
        "SWOT for your ventures",
        "PESTLE analysis",
      ]),
      sub("business", "8.1", "2", "Business Planning", [
        "Business model canvas",
        "Value proposition design",
        "Revenue models: transaction, subscription, licensing, consulting",
        "Writing a business plan",
        "OKRs",
        "KPI identification and tracking",
      ]),
    ]),
    sec("8.2", "Finance & Accounting", [
      sub("business", "8.2", "1", "Financial Literacy", [
        "Reading a P&L",
        "Reading a Balance Sheet",
        "Reading a Cash Flow statement",
        "Profit vs cash flow",
        "Gross vs net margin",
        "EBITDA and valuation",
      ]),
      sub("business", "8.2", "2", "Financial Management", [
        "Separating personal & business finances",
        "Business bank account",
        "Bookkeeping / double-entry",
        "QuickBooks, Xero, Sage",
        "Invoicing & accounts receivable",
        "Expense management & accounts payable",
        "Monthly financial review habit",
      ]),
      sub("business", "8.2", "3", "Pricing & Revenue", [
        "Cost-plus pricing",
        "Value-based pricing",
        "Competitive pricing",
        "Psychological pricing",
        "When and how to raise prices",
        "Recurring revenue streams",
      ]),
      sub("business", "8.2", "4", "Fundraising & Capital", [
        "Bootstrapping",
        "Debt vs equity",
        "Angel investors",
        "VC stages: pre-seed, seed, Series A",
        "Pitch deck structure",
        "Valuation methods",
        "Kenya: KEPSA, bank SME loans, Saccos",
      ]),
    ]),
    sec("8.3", "Operations & Systems", [
      sub("business", "8.3", "1", "Building Systems", [
        "SOPs — documenting everything",
        "Process mapping and optimization",
        "Automation priorities",
        "Agile, Waterfall, Kanban",
        "Tools: Notion, Asana, Trello, Monday",
      ]),
      sub("business", "8.3", "2", "Time & Productivity", [
        "Time blocking for multiple careers",
        "Eisenhower Matrix",
        "Deep vs shallow work (Cal Newport)",
        "Energy management",
        "Weekly reviews and planning rituals",
        "Saying no strategically",
      ]),
      sub("business", "8.3", "3", "Technology & Tools", [
        "G Suite / Microsoft 365",
        "Document management systems",
        "Slack / Teams",
        "Cloud storage and file org",
        "Password management & cybersecurity basics",
      ]),
    ]),
    sec("8.4", "People & Leadership", [
      sub("business", "8.4", "1", "Hiring & Team", [
        "Writing job descriptions",
        "Interviewing & evaluation",
        "Onboarding design",
        "Performance management",
        "Contractors vs employees",
        "Building remote teams",
      ]),
      sub("business", "8.4", "2", "Leadership", [
        "Styles: transformational, servant, situational",
        "Delegation",
        "Giving / receiving feedback",
        "Conflict resolution",
        "Team culture",
        "Motivating beyond money",
      ]),
      sub("business", "8.4", "3", "Networking", [
        "Building a strategic network",
        "Give before you take",
        "LinkedIn for relationships",
        "Industry events in Kenya",
        "Mentorship: finding & being one",
      ]),
    ]),
    sec("8.5", "Marketing & Branding", [
      sub("business", "8.5", "1", "Personal Brand", [
        "Niche & expertise positioning",
        "Content strategy (LinkedIn, X, YouTube)",
        "Thought leadership writing",
        "Speaking at events as brand builder",
        "Digital footprint: site, portfolio, case studies",
      ]),
      sub("business", "8.5", "2", "Digital Marketing", [
        "SEO basics",
        "Content marketing: blogs, newsletters, podcasts",
        "Social media for professional services",
        "Email marketing",
        "Paid ads: Meta, Google, LinkedIn",
        "Analytics: GA, Meta Business Suite",
      ]),
      sub("business", "8.5", "3", "Business Development", [
        "Partnership opportunities",
        "Strategic alliances and JVs",
        "Licensing / white-labeling",
        "Building distribution channels",
      ]),
    ]),
    sec("8.6", "Legal & Compliance", [
      sub("business", "8.6", "1", "Compliance Basics", [
        "Business registration (eCitizen)",
        "Tax compliance obligations",
        "Kenya Data Protection Act 2019",
        "Industry-specific regulations",
        "Insurance: PI and business insurance",
        "IP protection for products",
      ]),
    ]),
    sec("8.7", "Books & Resources", [
      sub("business", "8.7", "1", "Reading List", [
        "The E-Myth Revisited — Michael Gerber",
        "Good to Great — Jim Collins",
        "Zero to One — Peter Thiel",
        "The Lean Startup — Eric Ries",
        "Traction — Gino Wickman",
        "Built to Sell — John Warrillow",
        "The Hard Thing About Hard Things — Ben Horowitz",
        "Thinking Fast and Slow — Daniel Kahneman",
      ]),
    ]),
  ]
);

export const CATEGORIES: Category[] = [
  dataScience,
  publicPolicy,
  cff,
  sales,
  negotiation,
  speaking,
  law,
  business,
];

export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
