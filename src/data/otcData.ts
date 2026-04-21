export interface MonthlyPL {
  month: string;
  grossProfit: number;
  cashExpenses: number;
  scam: number;
  netProfit: number;
}

export interface DailyTrading {
  date: string;
  opening: number;
  closing: number;
  grossProfit: number;
  monthlyTotal?: number;
  monthlyAvg?: number;
}

export interface ExpenseEntry {
  date: string;
  description: string;
  amountAED: number;
}

export interface CapitalEntry {
  date: string;
  description: string;
  mariaUSDT: number;
  ahmadUSDT: number;
  mariaAED: number;
  ahmadAED: number;
}

export const otcSummary = {
  grossProfitYTD: 3104579.96,
  cashExpensesYTD: 649159.24,
  scamYTD: 950000.00,
  netProfitYTD: 1505420.72,
  initialCapital: 4120024.83,
  capitalWithdrawal: 2780158.46,
  netCapital: 1339866.37,
  cashPosition: 2844091.67,
  totalCash: 3968613.46,
  ar: -1124521.79,
  currency: "AED",
};

export const monthlyPL: MonthlyPL[] = [
  { month: "Jan-Dec 2024", grossProfit: 796325, cashExpenses: 79112, scam: 0, netProfit: 717213 },
  { month: "Jan 2025", grossProfit: 68632, cashExpenses: 12224, scam: 150000, netProfit: -93592 },
  { month: "Feb 2025", grossProfit: 72443, cashExpenses: 14753, scam: 0, netProfit: 57690 },
  { month: "Mar 2025", grossProfit: 56888, cashExpenses: 14760, scam: 0, netProfit: 42128 },
  { month: "Apr 2025", grossProfit: 106115, cashExpenses: 3864, scam: 0, netProfit: 102251 },
  { month: "May 2025", grossProfit: 99675, cashExpenses: 34076, scam: 0, netProfit: 65599 },
  { month: "Jun 2025", grossProfit: 125086, cashExpenses: 159639, scam: 0, netProfit: -34553 },
  { month: "Jul 2025", grossProfit: 168648, cashExpenses: 29658, scam: 800000, netProfit: -661010 },
  { month: "Aug 2025", grossProfit: 117919, cashExpenses: 44100, scam: 0, netProfit: 73819 },
  { month: "Sep 2025", grossProfit: 75177.24, cashExpenses: 40948, scam: 0, netProfit: 34229.24 },
  { month: "Oct 2025", grossProfit: 227609.97, cashExpenses: -14621, scam: 0, netProfit: 242230.97 },
  { month: "Nov 2025", grossProfit: 313860.56, cashExpenses: 11617, scam: 0, netProfit: 302243.56 },
  { month: "Dec 2025", grossProfit: 278765.58, cashExpenses: 28400, scam: 0, netProfit: 250365.58 },
  { month: "Jan 2026", grossProfit: 186557.93, cashExpenses: 50104.24, scam: 0, netProfit: 136453.69 },
  { month: "Feb 2026", grossProfit: 212187.14, cashExpenses: 49296, scam: 0, netProfit: 162891.14 },
  { month: "Mar 2026", grossProfit: 198690.54, cashExpenses: 91229, scam: 0, netProfit: 107461.54 },
];

export const expenseBreakdown = [
  { category: "General Exp", amount: 185574.62 },
  { category: "Car Exp", amount: 23470.18 },
  { category: "Salaries", amount: 321800 },
  { category: "TRX", amount: -14569.56 },
  { category: "DFZ Rent", amount: 124000 },
  { category: "Gatepass", amount: 8884 },
  { category: "Scam Loss", amount: 950000 },
];

// Per-month expense breakdown sourced from OTC-4.xlsx (Expenses tabs).
// Keys: YYYY-MM. Values are AED (USDT entries converted at 3.673).
// Use getExpensesForMonth(monthLabel) to retrieve totals for a dashboard
// month label (e.g. "Mar 2026"). Returns YTD totals when monthLabel is
// "all" or unrecognised.
export const expensesByMonth: Record<string, Record<string, number>> = {
  "General Exp": {
    "2024-02": 5569.69, "2024-04": 300, "2024-10": 6330, "2024-11": 1533.42,
    "2024-12": 10347, "2025-01": 1480, "2025-02": 9355, "2025-03": -750.76,
    "2025-04": 972.54, "2025-05": -849, "2025-06": 129825, "2025-07": -207,
    "2025-08": 1097, "2025-10": 8000, "2025-11": -295, "2026-01": -121,
    "2026-02": 13183, "2026-03": -1000, "2026-04": 263, "2026-05": 236,
  },
  "Car Exp": {
    "2025-01": 871, "2025-02": 350, "2025-03": 1903, "2025-05": 2017.54,
    "2025-06": 2677, "2025-07": 450, "2025-08": 777, "2025-09": 638,
    "2025-10": 1794, "2025-11": 3982, "2025-12": 1400, "2026-01": 510,
    "2026-02": 2179, "2026-03": 2507,
  },
  "Salaries": {
    "2024-12": 5500, "2025-01": 9500, "2025-02": 2000, "2025-03": 2500,
    "2025-04": 2500, "2025-05": 15500, "2025-06": 19500, "2025-07": 17000,
    "2025-08": 50000, "2025-09": 20000, "2025-10": 25000, "2025-11": 25000,
    "2026-01": 36800, "2026-02": 59000, "2026-03": 24000,
  },
  "TRX": {
    "2024-02": 1101.9, "2024-03": 18365, "2024-09": 3673, "2024-10": 11019,
    "2024-12": 11019, "2025-03": 12194.36, "2025-05": -367.3, "2025-06": 4370.87,
    "2025-07": -117.54, "2025-08": -805.46, "2025-09": -815.53, "2025-10": -71031.62,
    "2025-11": -2408, "2026-01": -550.95, "2026-03": 280.3,
  },
  "DFZ Rent": {
    "2025-01": 21000, "2025-03": 10000, "2025-05": 30000, "2025-10": 21000,
    "2026-01": 21000, "2026-02": 21000,
  },
  "Gatepass": {
    "2024-04": 10, "2024-09": 488, "2024-11": 415, "2024-12": 107,
    "2025-01": 2100, "2025-02": 440, "2025-03": 1160, "2025-04": -60,
    "2025-05": 490, "2025-06": -10, "2025-07": 634, "2025-08": 300,
    "2025-10": 260, "2025-11": 850, "2026-02": 1090, "2026-03": 610,
  },
};

const MONTH_NAME_TO_NUM: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

// Convert dashboard label like "Mar 2026" -> "2026-03". Returns null for
// aggregate labels like "Jan-Dec 2024" or unrecognised input.
export const monthLabelToKey = (label: string): string | null => {
  const m = /^([A-Za-z]{3})\s+(\d{4})$/.exec(label.trim());
  if (!m) return null;
  const num = MONTH_NAME_TO_NUM[m[1]];
  if (!num) return null;
  return `${m[2]}-${String(num).padStart(2, "0")}`;
};

// Get expense breakdown by category for a given month label, or YTD totals
// when `monthLabel` is "all" / null / aggregate. Always returns the full
// category list (zero when no entries that month) so UI can decide to grey out.
export const getExpensesForMonth = (
  monthLabel: string | null | undefined
): { category: string; amount: number }[] => {
  const categories = Object.keys(expensesByMonth);
  if (!monthLabel || monthLabel === "all") {
    return categories.map((cat) => ({
      category: cat,
      amount: Object.values(expensesByMonth[cat]).reduce((s, v) => s + v, 0),
    }));
  }
  const key = monthLabelToKey(monthLabel);
  if (!key) {
    return categories.map((cat) => ({
      category: cat,
      amount: Object.values(expensesByMonth[cat]).reduce((s, v) => s + v, 0),
    }));
  }
  return categories.map((cat) => ({
    category: cat,
    amount: expensesByMonth[cat][key] ?? 0,
  }));
};

export interface CapitalTransaction {
  date: string;
  description: string;
  mariaUSDT?: number;
  ahmadUSDT?: number;
  mariaAED?: number;
  ahmadAED?: number;
}

export const capitalDeposits: CapitalTransaction[] = [
  { date: "11/28/2023", description: "OTC Funding Maria/Ricardo", mariaUSDT: 100000, ahmadUSDT: 100000 },
  { date: "6/12/2023", description: "OTC Funding Ahmad", ahmadAED: 500000 },
  { date: "11/12/2023", description: "OTC Funding Ahmad", ahmadAED: 300000 },
  { date: "2/24/2024", description: "OTC Funding Ricardo", ahmadUSDT: 100000 },
  { date: "2/24/2024", description: "OTC Funding Maria", mariaUSDT: 100000 },
  { date: "2/26/2024", description: "OTC Funding Ahmad", ahmadAED: 222100 },
  { date: "5/21/2024", description: "OTC Funding Maria", mariaUSDT: 300000 },
  { date: "3/3/2025", description: "OTC Funding Maria/Ahmad", mariaAED: 25000, ahmadAED: 25000 },
  { date: "4/8/2025", description: "OTC Funding Maria/Ahmad", mariaUSDT: 64965.94, ahmadUSDT: 64965.94 },
];

export const capitalWithdrawals: CapitalTransaction[] = [
  { date: "2/19/2024", description: "Partners Withdrawals > UTGL", mariaUSDT: 9200.54, ahmadUSDT: 9200.54 },
  { date: "5/16/2024", description: "Partners Withdrawals > UTGL", mariaUSDT: 25000, ahmadUSDT: 25000 },
  { date: "1/19/2024", description: "Ahmad Withdrawal", ahmadAED: 25000 },
  { date: "4/20/2024", description: "Ahmad Withdrawal", ahmadUSDT: 1860.07, ahmadAED: 12106 },
  { date: "6/13/2024", description: "Ahmad Withdrawal", ahmadUSDT: 2295 },
  { date: "10/25/2024", description: "Ahmad Withdrawal", ahmadUSDT: 44000 },
  { date: "9/1/2025", description: "Partners Withdrawals > MKX", mariaAED: 50000, ahmadAED: 50000 },
  { date: "4/28/2025", description: "Partners Withdrawals > MKX", mariaAED: 20000, ahmadAED: 20000 },
  { date: "5/5/2025", description: "Partners Withdrawals > MKX", mariaAED: 80000, ahmadAED: 80000 },
  { date: "7/16/2025", description: "Ahmad Withdrawal to MKX", ahmadAED: 15000 },
  { date: "5/1/2026", description: "Partners Withdrawals", mariaAED: 1000000, ahmadAED: 1000000 },
];

export const scamLosses: CapitalTransaction[] = [
  { date: "1/23/2025", description: "Scam Loss", mariaAED: 75000, ahmadAED: 75000 },
  { date: "7/7/2025", description: "Scam Loss", mariaAED: 400000, ahmadAED: 400000 },
];

export const partnerCapital = {
  maria: { funding: 2099837.41, withdrawal: 1275601.48, net: 824235.93, scamLoss: 475000, expenses: 324578.88, capitalPosition: 24657.05, profitShare: 752710.00, netPosition: 1576945.93 },
  ahmad: { funding: 2020187.41, withdrawal: 1504556.98, net: 515630.44, scamLoss: 475000, expenses: 324578.88, capitalPosition: -283948.44, profitShare: 752710.00, netPosition: 1268340.44 },
  totalFunding: 4120024.83,
  totalWithdrawal: 2780158.46,
  netCapital: 1339866.37,
  scamLoss: 950000,
  equityAfterScam: 389866.37,
  totalExpenses: 649157.76,
  equityPosition: -259291.39,
};

export const formatAED = (value: number) => {
  const prefix = value < 0 ? "-AED " : "AED ";
  return `${prefix}${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
