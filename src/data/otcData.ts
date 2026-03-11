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
  grossProfitYTD: 2905889.42,
  cashExpensesYTD: 557930.24,
  scamYTD: 950000.00,
  netProfitYTD: 1397959.18,
  initialCapital: 4120024.83,
  capitalWithdrawal: 2780158.46,
  netCapital: 1339866.37,
  cashPosition: 2737825.55,
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
];

export const expenseBreakdown = [
  { category: "General Exp", amount: 187311.62 },
  { category: "Car Exp", amount: 21704.18 },
  { category: "Salaries", amount: 253000 },
  { category: "TRX", amount: -14849.56 },
  { category: "DFZ Rent", amount: 103000 },
  { category: "Gatepass", amount: 7764 },
  { category: "Scam Loss", amount: 950000 },
];

export const partnerCapital = {
  maria: { funding: 2099837.41, withdrawal: 1275601.48, net: 824235.93 },
  ahmad: { funding: 2020187.41, withdrawal: 1504556.98, net: 515630.44 },
  totalFunding: 4120024.83,
  totalWithdrawal: 2780158.46,
  netCapital: 1339866.37,
  scamLoss: 950000,
  equityAfterScam: 389866.37,
  totalExpenses: 557928.97,
  equityPosition: -168062.60,
};

export const formatAED = (value: number) => {
  const prefix = value < 0 ? "-AED " : "AED ";
  return `${prefix}${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
