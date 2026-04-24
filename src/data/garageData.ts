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
}

export const monthlyPL: MonthlyPL[] = [
  { month: "Nov 24", period: "1-Nov-24 to 30-Nov-24", sales: 52157.50, directIncome: 0, totalRevenue: 52157.50, costOfSales: 34488.59, grossProfit: 17668.91, indirectExpenses: 75224.06, netProfit: -57555.15, payroll: 28716, rent: 10677 },
  { month: "Dec 24", period: "1-Dec-24 to 31-Dec-24", sales: 113270, directIncome: 400, totalRevenue: 113670, costOfSales: 65365.66, grossProfit: 48304.34, indirectExpenses: 83781.47, netProfit: -35477.13, payroll: 37878, rent: 10677 },
  { month: "Jan 25", period: "1-Jan-25 to 31-Jan-25", sales: 80348.84, directIncome: 400, totalRevenue: 80748.84, costOfSales: 51959.11, grossProfit: 28789.73, indirectExpenses: 99367.54, netProfit: -70577.81, payroll: 39791, rent: 10677 },
  { month: "Feb 25", period: "1-Feb-25 to 28-Feb-25", sales: 94807, directIncome: 400, totalRevenue: 95207, costOfSales: 87874.50, grossProfit: 7332.50, indirectExpenses: 78839.71, netProfit: -71507.21, payroll: 48136, rent: 10677 },
  { month: "Mar 25", period: "1-Mar-25 to 31-Mar-25", sales: 194896.55, directIncome: 0, totalRevenue: 194896.55, costOfSales: 72975.13, grossProfit: 121921.42, indirectExpenses: 64674.54, netProfit: 57246.88, payroll: 48212, rent: 10677 },
  { month: "Apr 25", period: "1-Apr-25 to 30-Apr-25", sales: 87065.25, directIncome: 960, totalRevenue: 88025.25, costOfSales: 70462.86, grossProfit: 17562.39, indirectExpenses: 65715.60, netProfit: -48153.21, payroll: 47994, rent: 10677 },
  { month: "May 25", period: "1-May-25 to 31-May-25", sales: 149195, directIncome: 0, totalRevenue: 149195, costOfSales: 79722.23, grossProfit: 69472.77, indirectExpenses: 67482.21, netProfit: 1990.56, payroll: 44692, rent: 10677 },
  { month: "Jun 25", period: "1-Jun-25 to 30-Jun-25", sales: 133148, directIncome: 730, totalRevenue: 133878, costOfSales: 37674.07, grossProfit: 96203.93, indirectExpenses: 84224.92, netProfit: 11979.01, payroll: 46450, rent: 10677 },
  { month: "Jul 25", period: "1-Jul-25 to 31-Jul-25", sales: 124918.50, directIncome: 300, totalRevenue: 125218.50, costOfSales: 59892.53, grossProfit: 65325.97, indirectExpenses: 64653.10, netProfit: 672.87, payroll: 42602, rent: 10677 },
  { month: "Aug 25", period: "1-Aug-25 to 31-Aug-25", sales: 69061, directIncome: 500, totalRevenue: 69561, costOfSales: 35359, grossProfit: 34202, indirectExpenses: 59086.12, netProfit: -24884.12, payroll: 43452.80, rent: 10677 },
  { month: "Sep 25", period: "1-Sep-25 to 30-Sep-25", sales: 85385.50, directIncome: 1200, totalRevenue: 86585.50, costOfSales: 31804.24, grossProfit: 54781.26, indirectExpenses: 62226.45, netProfit: -7445.19, payroll: 42650, rent: 10677 },
  { month: "Oct 25", period: "1-Oct-25 to 31-Oct-25", sales: 113994.60, directIncome: 350, totalRevenue: 114344.60, costOfSales: 86172.33, grossProfit: 28172.27, indirectExpenses: 68476.09, netProfit: -40303.82, payroll: 42950, rent: 10677 },
  { month: "Nov 25", period: "1-Nov-25 to 30-Nov-25", sales: 133289.37, directIncome: 0, totalRevenue: 133289.37, costOfSales: 68140.83, grossProfit: 65148.54, indirectExpenses: 75900.29, netProfit: -10751.75, payroll: 54667, rent: 10677 },
  { month: "Dec 25", period: "1-Dec-25 to 31-Dec-25", sales: 136671.79, directIncome: 1200, totalRevenue: 137871.79, costOfSales: 63617.18, grossProfit: 74254.61, indirectExpenses: 88798.04, netProfit: -14543.43, payroll: 63953, rent: 10677 },
  { month: "Jan 26", period: "1-Jan-26 to 31-Jan-26", sales: 154653.98, directIncome: 1910, totalRevenue: 156563.98, costOfSales: 68480.39, grossProfit: 88083.59, indirectExpenses: 91330.94, netProfit: -3247.35, payroll: 59460, rent: 10677 },
  { month: "Feb 26", period: "1-Feb-26 to 28-Feb-26", sales: 176306.62, directIncome: 700, totalRevenue: 177006.62, costOfSales: 83834.97, grossProfit: 93171.65, indirectExpenses: 97206.95, netProfit: -4035.30, payroll: 54271, rent: 10677 },
  { month: "Mar 26", period: "1-Mar-26 to 31-Mar-26", sales: 61995.29, directIncome: 0, totalRevenue: 61995.29, costOfSales: 20114.30, grossProfit: 41880.99, indirectExpenses: 49022.93, netProfit: -7141.94, payroll: 29835, rent: 10677 },
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

// Ahmad owns 40% = AED 520,000 share capital out of AED 1,300,000 total
export const ahmadGarage = {
  sharePercent: 40,
  shareCapital: 520000,
  totalCapital: 1300000,
};
