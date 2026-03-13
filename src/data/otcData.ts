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
  maria: { funding: 2099837.41, withdrawal: 1275601.48, net: 824235.93, scamLoss: 475000, expenses: 278964.48, netPosition: 70271.45 },
  ahmad: { funding: 2020187.41, withdrawal: 1504556.98, net: 515630.44, scamLoss: 475000, expenses: 278964.48, capitalPosition: -238334.05, profitShare: 1368912.78, netPosition: 1130578.73 },
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
