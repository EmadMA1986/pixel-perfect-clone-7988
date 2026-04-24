export const formatAED = (v: number) =>
  `AED ${Math.abs(v) >= 1000 ? (v / 1000).toFixed(0) + "K" : v.toFixed(0)}`;

export const formatAEDFull = (v: number) =>
  new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);

export interface MonthlyPL {
  month: string;
  period: string;
  sales: number;
  directIncome: number;
  totalRevenue: number;
  costOfSales: number;
  grossProfit: number;
  indirectExpenses: number;
  netProfit: number;
  payroll: number;
  rent: number;
  // Revenue mix (subset of sales)
  labourRevenue?: number;
  partsRevenue?: number;
  paintRevenue?: number;
  otherRevenue?: number;
  // Dummy passthrough excluded from totalRevenue & costOfSales (visa sponsorship)
  dummyExcluded?: number;
}

// All revenue & cost figures EXCLUDE the visa sponsorship pass-through ("Dummy Income"
// matched by "Dummy Payroll"). Both sides reduced equally so net profit is unaffected.
// Source: Tally P&L sheets — DUMMY INCOME sits in Direct Incomes; the offsetting
// DUMMY PAYROLL sits in Direct Expenses (i.e. Cost of Sales bucket in this Tally setup).
export const monthlyPL: MonthlyPL[] = [
  { month: "Nov 24", period: "1-Nov-24 to 30-Nov-24", sales: 52157.50, directIncome: 0, totalRevenue: 52157.50, costOfSales: 34488.59, grossProfit: 17668.91, indirectExpenses: 75224.06, netProfit: -57555.15, payroll: 28716, rent: 10677, labourRevenue: 16520, partsRevenue: 34687.50, paintRevenue: 0, otherRevenue: 950 },
  { month: "Dec 24", period: "1-Dec-24 to 31-Dec-24", sales: 113270, directIncome: 400, totalRevenue: 113670, costOfSales: 65365.66, grossProfit: 48304.34, indirectExpenses: 83781.47, netProfit: -35477.13, payroll: 37878, rent: 10677, labourRevenue: 29815.60, partsRevenue: 66494.40, paintRevenue: 0, otherRevenue: 16960 },
  { month: "Jan 25", period: "1-Jan-25 to 31-Jan-25", sales: 80348.84, directIncome: 400, totalRevenue: 80748.84, costOfSales: 51959.11, grossProfit: 28789.73, indirectExpenses: 99367.54, netProfit: -70577.81, payroll: 39791, rent: 10677, labourRevenue: 26419.84, partsRevenue: 47229, paintRevenue: 5650, otherRevenue: 1050 },
  { month: "Feb 25", period: "1-Feb-25 to 28-Feb-25", sales: 94807, directIncome: 400, totalRevenue: 95207, costOfSales: 87874.50, grossProfit: 7332.50, indirectExpenses: 78839.71, netProfit: -71507.21, payroll: 48136, rent: 10677, labourRevenue: 16375, partsRevenue: 53382, paintRevenue: 24900, otherRevenue: 150 },
  { month: "Mar 25", period: "1-Mar-25 to 31-Mar-25", sales: 194896.55, directIncome: 0, totalRevenue: 194896.55, costOfSales: 72975.13, grossProfit: 121921.42, indirectExpenses: 64674.54, netProfit: 57246.88, payroll: 48212, rent: 10677 },
  { month: "Apr 25", period: "1-Apr-25 to 30-Apr-25", sales: 87065.25, directIncome: 960, totalRevenue: 88025.25, costOfSales: 70462.86, grossProfit: 17562.39, indirectExpenses: 65715.60, netProfit: -48153.21, payroll: 47994, rent: 10677 },
  { month: "May 25", period: "1-May-25 to 31-May-25", sales: 149195, directIncome: 0, totalRevenue: 149195, costOfSales: 79722.23, grossProfit: 69472.77, indirectExpenses: 67482.21, netProfit: 1990.56, payroll: 44692, rent: 10677 },
  { month: "Jun 25", period: "1-Jun-25 to 30-Jun-25", sales: 133148, directIncome: 730, totalRevenue: 133878, costOfSales: 37674.07, grossProfit: 96203.93, indirectExpenses: 84224.92, netProfit: 11979.01, payroll: 46450, rent: 10677 },
  { month: "Jul 25", period: "1-Jul-25 to 31-Jul-25", sales: 124918.50, directIncome: 300, totalRevenue: 125218.50, costOfSales: 59892.53, grossProfit: 65325.97, indirectExpenses: 64653.10, netProfit: 672.87, payroll: 42602, rent: 10677 },
  { month: "Aug 25", period: "1-Aug-25 to 31-Aug-25", sales: 69061, directIncome: 500, totalRevenue: 69561, costOfSales: 35359, grossProfit: 34202, indirectExpenses: 59086.12, netProfit: -24884.12, payroll: 43452.80, rent: 10677 },
  { month: "Sep 25", period: "1-Sep-25 to 30-Sep-25", sales: 85385.50, directIncome: 1200, totalRevenue: 86585.50, costOfSales: 31804.24, grossProfit: 54781.26, indirectExpenses: 62226.45, netProfit: -7445.19, payroll: 42650, rent: 10677 },
  { month: "Oct 25", period: "1-Oct-25 to 31-Oct-25", sales: 113994.60, directIncome: 350, totalRevenue: 114344.60, costOfSales: 86172.33, grossProfit: 28172.27, indirectExpenses: 68476.09, netProfit: -40303.82, payroll: 42950, rent: 10677, labourRevenue: 13080.80, partsRevenue: 71966.91, paintRevenue: 23228.38, otherRevenue: 5210, dummyExcluded: 26500 },
  { month: "Nov 25", period: "1-Nov-25 to 30-Nov-25", sales: 133289.37, directIncome: 0, totalRevenue: 133289.37, costOfSales: 68140.83, grossProfit: 65148.54, indirectExpenses: 75900.29, netProfit: -10751.75, payroll: 54667, rent: 10677, labourRevenue: 42677.53, partsRevenue: 82574.44, paintRevenue: 3876.92, otherRevenue: 4065.24, dummyExcluded: 30000 },
  { month: "Dec 25", period: "1-Dec-25 to 31-Dec-25", sales: 136671.79, directIncome: 1200, totalRevenue: 137871.79, costOfSales: 63617.18, grossProfit: 74254.61, indirectExpenses: 88798.04, netProfit: -14543.43, payroll: 63953, rent: 10677, labourRevenue: 68649.03, partsRevenue: 51651, paintRevenue: 15221.76, otherRevenue: 2200, dummyExcluded: 30000 },
  { month: "Jan 26", period: "1-Jan-26 to 31-Jan-26", sales: 152261.98, directIncome: 1910, totalRevenue: 154171.98, costOfSales: 68480.39, grossProfit: 85691.59, indirectExpenses: 91378.94, netProfit: -5687.35, payroll: 59460, rent: 10677, labourRevenue: 62780.59, partsRevenue: 78952.34, paintRevenue: 6080, otherRevenue: 5913.81, dummyExcluded: 30000 },
  { month: "Feb 26", period: "1-Feb-26 to 28-Feb-26", sales: 176341.77, directIncome: 0, totalRevenue: 176341.77, costOfSales: 89129.97, grossProfit: 87211.80, indirectExpenses: 97206.95, netProfit: -9995.15, payroll: 54271, rent: 10677, labourRevenue: 83428.74, partsRevenue: 62814.77, paintRevenue: 18264.23, otherRevenue: 11834.03, dummyExcluded: 30000 },
  { month: "Mar 26", period: "1-Mar-26 to 31-Mar-26", sales: 61995.29, directIncome: 0, totalRevenue: 61995.29, costOfSales: 20114.30, grossProfit: 41880.99, indirectExpenses: 49022.93, netProfit: -7141.94, payroll: 29835, rent: 10677, labourRevenue: 35883.09, partsRevenue: 18305.03, paintRevenue: 4369.07, otherRevenue: 3438.10, dummyExcluded: 30000 },
];

export const balanceSheet = {
  asOf: "31-Mar-26",
  capital: {
    manalMussa: 120000,
    mrAhmed: 120000,
    mrJamal: 30000,
    mrLaavan: 30000,
    total: 300000,
  },
  loans: {
    employeeLoan: -2904.04,
    manalMussaCurrent: 480000,
    mrAhmedCurrent: 400000,
    sisterCompanyMkAutos: 79124.57,
    total: 956220.53,
  },
  currentLiabilities: {
    dutiesAndTaxes: -495.74,
    accountsPayable: 72723.91,
    employeeSalary: 55648.83,
    rentLiability: 100000,
    total: 227877.00,
  },
  profitAndLoss: -338133.94,
  fixedAssets: {
    garageTools: 254635.13,
    goodwill: 600000,
    laptop: 2675,
    mobile: 1790,
    ppe: 62278.57,
    software: 6977.50,
    total: 928356.20,
  },
  currentAssets: {
    accountsReceivable: 206830.85,
    cashInHand: -69520.98,
    bankAccounts: 5356.52,
    prepaidRent: 74741.00,
    rfmCardReceipt: 200.00,
    total: 217607.39,
  },
  totalLiabilities: 1145963.59,
  totalAssets: 1145963.59,
};

// 4 Partners — share capital + loans extended to fund operations
export interface Partner {
  name: string;
  ownershipPct: number;
  shareCapital: number;
  loanToCompany: number;
}

export const partners: Partner[] = [
  { name: "Ahmad",       ownershipPct: 40, shareCapital: 120000, loanToCompany: 400000 },
  { name: "Manal Mussa", ownershipPct: 40, shareCapital: 120000, loanToCompany: 480000 },
  { name: "Jamal",       ownershipPct: 10, shareCapital: 30000,  loanToCompany: 0 },
  { name: "Laavan",      ownershipPct: 10, shareCapital: 30000,  loanToCompany: 0 },
];

// Ahmad owns 40% — 120K share capital + 400K loan = 520K total exposure
export const ahmadGarage = {
  sharePercent: 40,
  shareCapital: 520000, // total exposure (capital + loan)
  totalCapital: 1300000, // legacy field kept for backward compat
};

// Per-month indirect expense breakdown (line items from Tally Indirect Expenses section)
// Keys are stable display names; values in AED.
export const indirectExpenseDetail: Record<string, Record<string, number>> = {
  "Nov 24": { Payroll: 28716, Rent: 10677, "Legal & Prof": 20033, Garbage: 4504, Advertising: 4290, Office: 3718.10, "Staff Visa": 1810.65, Water: 557, "Card Charges": 479.50, Fuel: 439 },
  "Dec 24": { Payroll: 37878, Rent: 10677, "Staff Visa": 16854, "Bank Charges": 6400, Office: 6943, Advertising: 3000, "Legal & Prof": 1140, Water: 331.50, "Card Charges": 206.97, Fuel: 169, "WiFi & Mobile": 182 },
  "Jan 25": { Payroll: 39791, Rent: 10677, "Legal & Prof": 26377, "Staff Visa": 8933, Advertising: 7350, Office: 3569.17, DEWA: 1609.68, "Card Charges": 408.94, "WiFi & Mobile": 341.50, Fuel: 290, Water: 21 },
  "Feb 25": { Payroll: 48136, "Staff Visa": 12747.50, Rent: 10677, "WiFi & Mobile": 4826.75, "Legal & Prof": 1364.50, "Card Charges": 530.35, Fuel: 357.60, "Al Ansari": 156.90, Office: 43.34 },
  "Mar 25": { Payroll: 48212, Rent: 10677, Meals: 3375, "Card Charges": 1395.75, Office: 591.25, Fuel: 230, "Al Ansari": 193.25 },
  "Apr 25": { Payroll: 47994, Rent: 10677, "WiFi & Mobile": 3495.57, DEWA: 1350, "Card Charges": 991.14, Office: 521.39, Fuel: 355, "Staff Visa": 200, Water: 131.50 },
  "May 25": { Payroll: 44692, Rent: 10677, Advertising: 6750, DEWA: 1750, "Legal & Prof": 1260, Water: 657.50, "Card Charges": 562.30, "WiFi & Mobile": 342.49, Fuel: 277.29, "Bank Charges": 261.45, Office: 139.60, "Al Ansari": 105, "FB Ads": 7.58 },
  "Jun 25": { Payroll: 46450, "Advertising": 12885.45, Rent: 10677, "Staff Visa": 7736, "WiFi & Mobile": 3130.73, Office: 1324.75, DEWA: 850, Fuel: 366.43, "Card Charges": 284.62, "Bank Charges": 261.45, "FB Ads": 154.42, "Google Ads": 51.57, "Al Ansari": 52.50 },
  "Jul 25": { Payroll: 42602, Rent: 10677, Advertising: 6000, "WiFi & Mobile": 3129.03, DEWA: 850, "Card Charges": 389.49, Office: 292.50, Fuel: 264.19, "Bank Charges": 261.45, "FB Ads": 179.80, "Google Ads": 8.48 },
  "Aug 25": { Payroll: 43452.80, Rent: 10677, "WiFi & Mobile": 1902.58, DEWA: 950, Office: 752, "Card Charges": 582.54, Fuel: 450, "Bank Charges": 261.45, "Al Ansari": 57.75 },
  "Sep 25": { Payroll: 42650, Rent: 10677, Office: 3035.24, Advertising: 3000, "WiFi & Mobile": 1521.25, Fuel: 527.87, "Card Charges": 325.08, "Bank Charges": 267.65, Taxi: 165, "Al Ansari": 57.75 },
  "Oct 25": { Payroll: 42950, Rent: 10677, Office: 6542, "Staff Visa": 4396, "WiFi & Mobile": 1816.25, Fuel: 640.01, "Card Charges": 491.70, DEWA: 354.62, Taxi: 300, "Bank Charges": 253, "Al Ansari": 55 },
  "Nov 25": { Payroll: 54667, Rent: 10677, "Staff Visa": 3307.70, PRO: 1869.05, "WiFi & Mobile": 1699.96, DEWA: 941.73, "Card Charges": 743.13, Office: 608.52, Fuel: 606.24, "Bank Charges": 250, Advertising: 250, "FB Ads": 185.65, "Al Ansari": 95 },
  "Dec 25": { Payroll: 63953, Rent: 10677, Office: 6775.71, PRO: 2821.25, DEWA: 1761.35, "Card Charges": 718.44, "Medical Ins": 725, "WiFi & Mobile": 496.85, Fuel: 385.41, "Bank Charges": 249, "Al Ansari": 135, Taxi: 100 },
  "Jan 26": { Payroll: 59460, Rent: 10677, Meals: 7500, Office: 5915.50, PRO: 2831, "WiFi & Mobile": 1937.77, DEWA: 783.36, "Card Charges": 744.29, Fuel: 598.36, "Visa Fine": 370, "Bank Charges": 250, "FB Ads": 143.03, Taxi: 138, "Al Ansari": 30 },
  "Feb 26": { Payroll: 54271, "Trade License": 23366.25, Rent: 10677, PRO: 4790, Office: 1450, "Legal & Prof": 1095.96, "WiFi & Mobile": 510.84, "Card Charges": 369.86, Fuel: 289.58, "Bank Charges": 254, "Staff Visa": 72.54, "Al Ansari": 60 },
  "Mar 26": { Payroll: 29835, Rent: 10677, Office: 4171.14, PRO: 2292.34, DEWA: 778.93, "WiFi & Mobile": 494.26, Office_extra: 0, "Card Charges": 341.89, "Bank Charges": 251, Fuel: 121.37, "Al Ansari": 60 },
};
