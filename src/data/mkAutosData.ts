export interface Vehicle {
  name: string;
  initialInvestment: number;
  maintenanceExpenses: number;
  totalDepreciation: number;
  nbv: number;
  totalProfit: number;
  netProfit: number;
  realProfit: number;
  roiOnInvestment: number;
  realROI: number;
  saleValue: number;
  finalROI: number;
  monthsOfProfit: number;
  avgMonthlyProfit: number;
}

export interface MonthlyIncome {
  month: string;
  g63: number;
  lamborghini: number;
  corvette: number;
  cadillac: number;
  patrol: number;
  bmw440i: number;
  gle53: number;
  c200: number;
  q8: number;
  cayenne: number;
  total: number;
  percentage: number;
}

export const mkAutosSummary = {
  totalGrossProfit: 1848166.67,
  totalCashWithdrawals: 1134695.37,
  totalCashExpenses: 268311.12,
  currentBalance: 490160.18,
  oldBalance: 45000.00,
  finalBalance: 490160.18,
  totalInitialInvestment: 4325615.00,
  totalMaintenanceExpenses: 268311.12,
  totalDepreciation: 1935325.70,
  totalNBV: 2390289.30,
  netProfit: 1579855.55,
  overallROI: 36.52,
  realROI: -8.22,
  overallROINBV: 82,
  avgMonthlyIncome: 83105.32,
  totalSaleValue: 2929650.00,
  finalROI: 4.25,
  currency: "AED",
};

export const vehicles: Vehicle[] = [
  { name: "G63 - 2021", initialInvestment: 780000, maintenanceExpenses: 69160, totalDepreciation: 359233, nbv: 420767, totalProfit: 447256.34, netProfit: 378096.34, realProfit: 18863.34, roiOnInvestment: 48.47, realROI: 2.42, saleValue: 370900, finalROI: -3.97, monthsOfProfit: 26, avgMonthlyProfit: 17202.17 },
  { name: "Lamborghini - 2023", initialInvestment: 1350000, maintenanceExpenses: 39099, totalDepreciation: 594000, nbv: 756000, totalProfit: 555285.61, netProfit: 516186.61, realProfit: -77813.39, roiOnInvestment: 38.24, realROI: -5.76, saleValue: 1100000, finalROI: 19.72, monthsOfProfit: 24, avgMonthlyProfit: 23136.90 },
  { name: "Corvette - 2023", initialInvestment: 504690, maintenanceExpenses: 55068.50, totalDepreciation: 241970.81, nbv: 262719.19, totalProfit: 212662.97, netProfit: 157594.47, realProfit: -84376.34, roiOnInvestment: 31.23, realROI: -16.72, saleValue: 338750, finalROI: -1.65, monthsOfProfit: 24, avgMonthlyProfit: 8860.96 },
  { name: "Cadillac - 2023", initialInvestment: 479875, maintenanceExpenses: 60813.12, totalDepreciation: 224474.67, nbv: 255400.33, totalProfit: 307996.70, netProfit: 247183.58, realProfit: 22708.91, roiOnInvestment: 51.51, realROI: 4.73, saleValue: 345000, finalROI: 23.40, monthsOfProfit: 24, avgMonthlyProfit: 12833.20 },
  { name: "Patrol 2023", initialInvestment: 235000, maintenanceExpenses: 11643, totalDepreciation: 98830.38, nbv: 136169.62, totalProfit: 113058.75, netProfit: 101415.75, realProfit: 2585.37, roiOnInvestment: 43.16, realROI: 1.10, saleValue: 180000, finalROI: 19.75, monthsOfProfit: 23, avgMonthlyProfit: 4915.60 },
  { name: "BMW 440i", initialInvestment: 187000, maintenanceExpenses: 14508, totalDepreciation: 63683.75, nbv: 123316.25, totalProfit: 75247.30, netProfit: 60739.30, realProfit: -2944.45, roiOnInvestment: 32.48, realROI: -1.57, saleValue: 100000, finalROI: -14.04, monthsOfProfit: 20, avgMonthlyProfit: 3762.37 },
  { name: "GLE 53 - 2024", initialInvestment: 524000, maintenanceExpenses: 1616.50, totalDepreciation: 218333.25, nbv: 305666.75, totalProfit: 97392.56, netProfit: 95776.06, realProfit: -122557.19, roiOnInvestment: 18.28, realROI: -23.39, saleValue: 300000, finalROI: -24.47, monthsOfProfit: 17, avgMonthlyProfit: 5728.97 },
  { name: "C 200", initialInvestment: 265050, maintenanceExpenses: 0, totalDepreciation: 134799.84, nbv: 130250.16, totalProfit: 36676.44, netProfit: 36676.44, realProfit: -98123.40, roiOnInvestment: 13.84, realROI: -37.02, saleValue: 195000, finalROI: -12.59, monthsOfProfit: 9, avgMonthlyProfit: 4075.16 },
  { name: "Q8", initialInvestment: 0, maintenanceExpenses: 2972, totalDepreciation: 0, nbv: 0, totalProfit: 1470, netProfit: -1502, realProfit: -1502, roiOnInvestment: 0, realROI: 0, saleValue: 0, finalROI: 0, monthsOfProfit: 1, avgMonthlyProfit: 1470 },
  { name: "Cayenne", initialInvestment: 0, maintenanceExpenses: 0, totalDepreciation: 0, nbv: 0, totalProfit: 1120, netProfit: 1120, realProfit: 1120, roiOnInvestment: 0, realROI: 0, saleValue: 0, finalROI: 0, monthsOfProfit: 1, avgMonthlyProfit: 1120 },
  { name: "GAS", initialInvestment: 0, maintenanceExpenses: 13431, totalDepreciation: 0, nbv: 0, totalProfit: 0, netProfit: -13431, realProfit: -13431, roiOnInvestment: 0, realROI: 0, saleValue: 0, finalROI: 0, monthsOfProfit: 0, avgMonthlyProfit: 0 },
];

export const monthlyIncome: MonthlyIncome[] = [
  { month: "Dec-23", g63: 0, lamborghini: 0, corvette: 8400, cadillac: 0, patrol: 0, bmw440i: 0, gle53: 0, c200: 0, q8: 0, cayenne: 0, total: 8400, percentage: 0.45 },
  { month: "Jan-24", g63: 0, lamborghini: 0, corvette: 0, cadillac: 0, patrol: 0, bmw440i: 0, gle53: 0, c200: 0, q8: 0, cayenne: 0, total: 0, percentage: 0 },
  { month: "Feb-24", g63: 13386.67, lamborghini: 5900, corvette: 600, cadillac: 0, patrol: 1680, bmw440i: 0, gle53: 0, c200: 0, q8: 0, cayenne: 0, total: 21566.67, percentage: 1.17 },
  { month: "Mar-24", g63: 18200, lamborghini: 11133.34, corvette: 56294.45, cadillac: 48563.20, patrol: 5720, bmw440i: 0, gle53: 2641.26, c200: 0, q8: 0, cayenne: 0, total: 142552.25, percentage: 7.71 },
  { month: "Apr-24", g63: 21000, lamborghini: 46799.96, corvette: 5116.66, cadillac: 22213.39, patrol: 6230, bmw440i: 0, gle53: 3810.77, c200: 0, q8: 0, cayenne: 0, total: 105170.78, percentage: 5.69 },
  { month: "May-24", g63: 16100, lamborghini: 14346.66, corvette: 12633.66, cadillac: 15829.26, patrol: 4760, bmw440i: 0, gle53: 0, c200: 0, q8: 0, cayenne: 0, total: 63669.58, percentage: 3.45 },
  { month: "Jun-24", g63: 19600, lamborghini: 36003.33, corvette: 8769.50, cadillac: 20160, patrol: 4470, bmw440i: 0, gle53: 0, c200: 0, q8: 0, cayenne: 0, total: 89002.83, percentage: 4.82 },
  { month: "Jul-24", g63: 21000, lamborghini: 20580, corvette: 5913.32, cadillac: 0, patrol: 5299.99, bmw440i: 0, gle53: 0, c200: 0, q8: 0, cayenne: 0, total: 52793.31, percentage: 2.86 },
  { month: "Aug-24", g63: 18580.48, lamborghini: 69825, corvette: 4266.65, cadillac: 17910, patrol: 2400, bmw440i: 6211.41, gle53: 0, c200: 0, q8: 0, cayenne: 0, total: 119193.54, percentage: 6.45 },
  { month: "Sep-24", g63: 9346.66, lamborghini: 13853.30, corvette: 6399.97, cadillac: 5253.33, patrol: 4460, bmw440i: 2733.33, gle53: 0, c200: 0, q8: 0, cayenne: 0, total: 42046.59, percentage: 2.28 },
  { month: "Oct-24", g63: 15026.56, lamborghini: 14714, corvette: 6465.90, cadillac: 14770, patrol: 4368, bmw440i: 280, gle53: 0, c200: 0, q8: 0, cayenne: 0, total: 55624.46, percentage: 3.01 },
  { month: "Nov-24", g63: 18333.42, lamborghini: 22025.50, corvette: 6853, cadillac: 13576.69, patrol: 4190, bmw440i: 2633.33, gle53: 1266.66, c200: 0, q8: 0, cayenne: 0, total: 68878.60, percentage: 3.73 },
  { month: "Dec-24", g63: 18333.42, lamborghini: 18689.83, corvette: 25410, cadillac: 14326.67, patrol: 7263.27, bmw440i: 6593.42, gle53: 0, c200: 0, q8: 0, cayenne: 0, total: 90616.61, percentage: 4.90 },
  { month: "Jan-25", g63: 18333.42, lamborghini: 30486.74, corvette: 6560.50, cadillac: 11530, patrol: 7366.18, bmw440i: 6570.04, gle53: 0, c200: 0, q8: 0, cayenne: 0, total: 80846.88, percentage: 4.37 },
  { month: "Feb-25", g63: 18333.42, lamborghini: 29476.66, corvette: 6979.42, cadillac: 11167.76, patrol: 4293.76, bmw440i: 3526.66, gle53: 3018.33, c200: 0, q8: 0, cayenne: 0, total: 76796.02, percentage: 4.16 },
  { month: "Mar-25", g63: 18333.42, lamborghini: 26667.95, corvette: 10381.99, cadillac: 14225.48, patrol: 2008.33, bmw440i: 3179.98, gle53: 2773.33, c200: 0, q8: 0, cayenne: 0, total: 77570.48, percentage: 4.20 },
  { month: "Apr-25", g63: 19000.10, lamborghini: 26292.64, corvette: 3120, cadillac: 10853.72, patrol: 5351.91, bmw440i: 5286.65, gle53: 4001.31, c200: 0, q8: 0, cayenne: 0, total: 73906.33, percentage: 4.00 },
  { month: "May-25", g63: 19977.89, lamborghini: 20453.34, corvette: 0, cadillac: 10731.08, patrol: 6663.99, bmw440i: 6318.28, gle53: 12009.56, c200: 4666.62, q8: 0, cayenne: 0, total: 80820.76, percentage: 4.37 },
  { month: "Jun-25", g63: 18688.99, lamborghini: 13716.67, corvette: 1440, cadillac: 9696.67, patrol: 4000, bmw440i: 2680.01, gle53: 7980, c200: 5049.53, q8: 0, cayenne: 0, total: 63251.87, percentage: 3.42 },
  { month: "Jul-25", g63: 19000.03, lamborghini: 15230.01, corvette: 1966.66, cadillac: 3640, patrol: 5333.34, bmw440i: 4306.66, gle53: 1630, c200: 2674.46, q8: 0, cayenne: 0, total: 53781.16, percentage: 2.91 },
  { month: "Aug-25", g63: 15766.67, lamborghini: 19925.33, corvette: 2583.33, cadillac: 2956, patrol: 5511.11, bmw440i: 2366.65, gle53: 9108.60, c200: 3277.83, q8: 1470, cayenne: 0, total: 62965.52, percentage: 3.41 },
  { month: "Sep-25", g63: 18900, lamborghini: 10665.34, corvette: 9854.65, cadillac: 8914, patrol: 5333.33, bmw440i: 4932.01, gle53: 4971.73, c200: 5250, q8: 0, cayenne: 1120, total: 69941.06, percentage: 3.78 },
  { month: "Oct-25", g63: 18901.67, lamborghini: 20656.66, corvette: 1443.33, cadillac: 11000, patrol: 5511.11, bmw440i: 5393.66, gle53: 11040.95, c200: 5425, q8: 0, cayenne: 0, total: 79372.38, percentage: 4.29 },
  { month: "Nov-25", g63: 19600, lamborghini: 18380.01, corvette: 0, cadillac: 10000, patrol: 5333.33, bmw440i: 4752.22, gle53: 9817.71, c200: 4808.33, q8: 0, cayenne: 0, total: 72691.60, percentage: 3.93 },
  { month: "Dec-25", g63: 21290, lamborghini: 32550, corvette: 0, cadillac: 7066.67, patrol: 5511.11, bmw440i: 1866.66, gle53: 1060, c200: 3172.67, q8: 0, cayenne: 0, total: 72517.11, percentage: 3.92 },
  { month: "Jan-26", g63: 15560, lamborghini: 16913.34, corvette: 4486.66, cadillac: 12000, patrol: 0, bmw440i: 2276.33, gle53: 8755.13, c200: 2352, q8: 0, cayenne: 0, total: 62343.46, percentage: 3.37 },
  { month: "Feb-26", g63: 9671.67, lamborghini: 0, corvette: 8959.99, cadillac: 4706.67, patrol: 0, bmw440i: 2870, gle53: 9223.87, c200: 0, q8: 0, cayenne: 0, total: 35432.20, percentage: 1.92 },
  { month: "Mar-26", g63: 6991.85, lamborghini: 0, corvette: 7763.33, cadillac: 6906.10, patrol: 0, bmw440i: 470, gle53: 4283.34, c200: 0, q8: 0, cayenne: 0, total: 26414.62, percentage: 1.43 },
];

export const vehicleKeys = ["g63", "lamborghini", "corvette", "cadillac", "patrol", "bmw440i", "gle53", "c200", "q8", "cayenne"] as const;

export const vehicleLabels: Record<string, string> = {
  g63: "G63",
  lamborghini: "Lambo",
  corvette: "Corvette",
  cadillac: "Cadillac",
  patrol: "Patrol",
  bmw440i: "BMW 440i",
  gle53: "GLE 53",
  c200: "C 200",
  q8: "Q8",
  cayenne: "Cayenne",
};

export const ahmadCapital = {
  sharePercentage: 45,
  shareCapital: 135000,
  lossIncurred: -30300,
  totalCarsInvestment: 4325615,
  totalCarsProfit: 1579855.55,
  cashWithdrawal: 1134695.37,
  carsMaintenance: 268311.12,
  loan: 45000,
  positionAgainstCars: 490160.18,
};

export interface BalanceSheetItem {
  name: string;
  amount: number;
}

export const balanceSheet = {
  fixedAssets: {
    total: 3012174.58,
    items: [
      { name: "Cadillac Escalade 2025", amount: 473297.06 },
      { name: "Chevrolet Tahoe 2025", amount: 240804.76 },
      { name: "Fitting & Decoration", amount: 43240.00 },
      { name: "Ford Mustang Black", amount: 229605.00 },
      { name: "Ford Mustang Blue", amount: 250505.00 },
      { name: "GMC Yukon 2025", amount: 304761.90 },
      { name: "Kia Carnival 2025", amount: 142350.00 },
      { name: "Kia K3 2026", amount: 64047.50 },
      { name: "Kia Pegas Grey", amount: 45900.00 },
      { name: "Kia Pegas White", amount: 45900.00 },
      { name: "Kia Picanto", amount: 35000.00 },
      { name: "Kia Sonet 2026", amount: 64557.50 },
      { name: "Mercedes CLE200", amount: 333333.33 },
      { name: "Outlander Grey", amount: 82900.00 },
      { name: "Outlander Silver", amount: 82900.00 },
      { name: "Outlander White 07", amount: 82900.00 },
      { name: "Outlander White 13", amount: 82900.00 },
      { name: "Nissan Patrol 2026", amount: 285675.58 },
      { name: "Nissan Xterra 2025", amount: 100250.24 },
      { name: "Office Equipment", amount: 21346.71 },
    ] as BalanceSheetItem[],
  },
  currentAssets: {
    total: 1270634.55,
    items: [
      { name: "Accounts Receivables", amount: 288565.72 },
      { name: "Cash-in-Hand", amount: 26277.50 },
      { name: "Bank Accounts", amount: 136474.44 },
      { name: "AR - Cases", amount: 160955.22 },
      { name: "Amex Card Receipt", amount: 650.00 },
      { name: "Cheque", amount: 10732.00 },
      { name: "DEWA Deposit", amount: 2000.00 },
      { name: "Magnati Receipt", amount: 22190.00 },
      { name: "Payment Link Receipt", amount: 8574.00 },
      { name: "Prepaid Insurance", amount: 121905.62 },
      { name: "Prepaid Interest", amount: 319766.57 },
      { name: "Prepaid Rent", amount: 86980.00 },
      { name: "MK Garage (Sister Co.)", amount: 85563.48 },
    ] as BalanceSheetItem[],
  },
  currentLiabilities: {
    total: 443163.33,
    items: [
      { name: "Duties & Taxes", amount: -146772.29 },
      { name: "Accounts Payable", amount: 156633.15 },
      { name: "Employee Salary", amount: 197930.06 },
      { name: "Traffic Fine Payable", amount: 148542.50 },
      { name: "Rent Liability", amount: 68750.00 },
      { name: "Stripe Payment Link", amount: 18079.91 },
    ] as BalanceSheetItem[],
  },
  capitalAccount: 300000,
  loans: {
    total: 3629077.54,
    items: [
      { name: "ADIB Loan", amount: 971068.98 },
      { name: "ADIB New Loan", amount: 842719.32 },
      { name: "Investor Ahmad", amount: 419421.19 },
      { name: "Investor Golden", amount: 130441.97 },
      { name: "Investor Hiruy", amount: 32653.34 },
      { name: "Investor Jamal", amount: 7114.85 },
      { name: "Investor Mirza", amount: 20908.07 },
      { name: "Investor Moez", amount: 7793.89 },
      { name: "Investor Munir", amount: -1170.00 },
      { name: "Investor Ricardo", amount: 20154.48 },
      { name: "Emirates Islamic Loan", amount: 1120731.74 },
      { name: "Ahmed Hamid Loan", amount: 45000.00 },
      { name: "Moiz Loan", amount: 12239.71 },
    ] as BalanceSheetItem[],
  },
  profitLoss: {
    opening: -195152.09,
    currentPeriod: 57427.08,
    total: -137725.01,
  },
  grandTotal: 4282809.13,
};

export const formatAED = (value: number) => {
  const prefix = value < 0 ? "-AED " : "AED ";
  return `${prefix}${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Monthly P&L (May-25 to Mar-26) sourced from MKAUTOS Tally exports
export interface MonthlyPL {
  month: string;
  directIncome: number;
  costOfSales: number;
  grossProfit: number;
  indirectExpenses: number;
  otherExpense: number;
  netProfit: number;
}

export const monthlyPL: MonthlyPL[] = [
  { month: "May-25",  directIncome: 276533.17, costOfSales: 96195.34, grossProfit: 180337.83, indirectExpenses: 136161.85, otherExpense: 133423.86, netProfit: -89247.88 },
  { month: "Jun-25",  directIncome: 219375.38, costOfSales: 22877.09, grossProfit: 196498.29, indirectExpenses: 122732.40, otherExpense: 129326.04, netProfit: -55560.15 },
  { month: "Jul-25",  directIncome: 230109.07, costOfSales: 55633.35, grossProfit: 174475.72, indirectExpenses: 114068.12, otherExpense: 136478.74, netProfit: -76071.14 },
  { month: "Aug-25",  directIncome: 290707.10, costOfSales: 22211.77, grossProfit: 268495.33, indirectExpenses: 123196.00, otherExpense: 156629.01, netProfit: -11329.68 },
  { month: "Sep-25",  directIncome: 356125.72, costOfSales: 17246.08, grossProfit: 338879.64, indirectExpenses: 95384.71,  otherExpense: 170991.05, netProfit: 72503.88 },
  // Real revenue/expenses — visa sponsorship pass-through (Dummy Investor / Dummy Payroll) excluded:
  // Oct-25 AED 83K | Nov-25 AED 8K | Dec-25–Feb-26 AED 78K/month. Net profit unaffected.
  { month: "Oct-25",  directIncome: 404216.29, costOfSales: 31512.15, grossProfit: 372704.14, indirectExpenses: 156299.37, otherExpense: 205983.66, netProfit: 10421.11 },
  { month: "Nov-25",  directIncome: 433895.70, costOfSales: 29140.88, grossProfit: 404754.82, indirectExpenses: 141727.23, otherExpense: 198730.64, netProfit: 64296.95 },
  { month: "Dec-25",  directIncome: 387592.28, costOfSales: 54000.75, grossProfit: 333591.53, indirectExpenses: 135683.34, otherExpense: 202555.38, netProfit: -4647.19 },
  { month: "Jan-26",  directIncome: 450488.36, costOfSales: 72549.37, grossProfit: 377938.99, indirectExpenses: 157109.86, otherExpense: 206138.37, netProfit: 14690.76 },
  { month: "Feb-26",  directIncome: 364132.76, costOfSales: 64321.19, grossProfit: 299811.57, indirectExpenses: 140513.13, otherExpense: 133965.02, netProfit: 25333.42 },
  { month: "Mar-26",  directIncome: 246433.12, costOfSales: 42396.94, grossProfit: 204036.18, indirectExpenses: 132738.74, otherExpense: 84974.73,  netProfit: -13677.29 },
];

// Balance sheet snapshots — high-level totals per period
export interface BalanceSheetSnapshot {
  asOf: string;            // Display label e.g. "31-Mar-26"
  monthKey: string;        // Matches monthlyPL.month e.g. "Mar-26"
  capitalAccount: number;
  fixedAssetsTotal: number;
  currentAssetsTotal: number;
  currentLiabilitiesTotal: number;
  loansTotal: number;
  profitLoss: { opening: number; currentPeriod: number; total: number };
  total: number;
}

export const balanceSheetSnapshots: BalanceSheetSnapshot[] = [
  {
    asOf: "31-Dec-25", monthKey: "Dec-25",
    capitalAccount: 300000,
    fixedAssetsTotal: 1924530.82,
    currentAssetsTotal: 1147816.73,
    currentLiabilitiesTotal: 328190.72,
    loansTotal: 2640148.92,
    profitLoss: { opening: 0, currentPeriod: -195992.09, total: -195992.09 },
    total: 3072347.55,
  },
  {
    asOf: "31-Jan-26", monthKey: "Jan-26",
    capitalAccount: 300000,
    fixedAssetsTotal: 2688918.90,
    currentAssetsTotal: 1325226.12,
    currentLiabilitiesTotal: 59134.74,
    loansTotal: 3836311.61,
    profitLoss: { opening: -195992.09, currentPeriod: 14690.76, total: -181301.33 },
    total: 4014145.02,
  },
  {
    asOf: "28-Feb-26", monthKey: "Feb-26",
    capitalAccount: 300000,
    fixedAssetsTotal: 3010229.83,
    currentAssetsTotal: 1272332.80,
    currentLiabilitiesTotal: 441854.35,
    loansTotal: 3696676.19,
    profitLoss: { opening: -195992.09, currentPeriod: 40658.67, total: -155333.42 },
    total: 4282562.63,
  },
  {
    asOf: "31-Mar-26", monthKey: "Mar-26",
    capitalAccount: 300000,
    fixedAssetsTotal: 2999940.76,
    currentAssetsTotal: 1102980.18,
    currentLiabilitiesTotal: 312656.61,
    loansTotal: 3659909.53,
    profitLoss: { opening: -195992.09, currentPeriod: 26346.89, total: -169645.20 },
    total: 4102920.94,
  },
];

// === Verified March 2026 detailed balance sheet (authoritative source) ===
export const marchBalanceSheet = {
  asOf: "31-Mar-26",
  totals: {
    assets: 4102921,
    liabilities: 4102921,
  },
  assets: [
    { name: "Fixed Assets (vehicles + equipment)", amount: 2999941 },
    { name: "AR Trade", amount: 275368 },
    { name: "AR Legal Cases", amount: 160955 },
    { name: "Cash in Hand", amount: 8192 },
    { name: "Bank Accounts", amount: 42797 },
    { name: "Prepaid Insurance", amount: 109825 },
    { name: "Prepaid Interest", amount: 311996 },
    { name: "Prepaid Rent", amount: 76303 },
    { name: "Sister Company MK Garage", amount: 79125 },
    { name: "Other Current Assets", amount: 38419 },
  ] as BalanceSheetItem[],
  liabilities: [
    { name: "Partner Capital (Ahmad 135K | Jamal 30K | Moez 135K)", amount: 300000 },
    { name: "ADIB Loan", amount: 947948 },
    { name: "ADIB New Loan", amount: 819310 },
    { name: "Emirates Islamic Loan", amount: 1096368 },
    { name: "Investor Ahmad balance owed", amount: 445160 },
    { name: "Investor Golden", amount: 132192 },
    { name: "Investor Hiruy", amount: 30462 },
    { name: "Investor Jamal", amount: 20354 },
    { name: "Investor Mirza", amount: 27505 },
    { name: "Investor Moez Hemani", amount: 10926 },
    { name: "Investor Ricardo", amount: 6450 },
    { name: "Investor Munir", amount: -75 },
    { name: "Arshad Mirza", amount: 10068 },
    { name: "Ahmed Hamid Loan", amount: 45000 },
    { name: "Moiz Loan", amount: 19947 },
    { name: "Opening Balance Adjustment", amount: 48293 },
    { name: "Accounts Payable", amount: 183033 },
    { name: "Employee Salary Payable", amount: 24159 },
    { name: "Traffic Fines Payable", amount: 156743 },
    { name: "Rent Liability", amount: 68750 },
    { name: "Duties & Taxes", amount: -138107 },
    { name: "Stripe Payment Link", amount: 18080 },
    { name: "Accumulated P&L Loss", amount: -169645 },
  ] as BalanceSheetItem[],
};

// === Investor balances owed (March 2026) ===
export const investorBalances = [
  { name: "Ahmad", amount: 445160 },
  { name: "Golden", amount: 132192 },
  { name: "Hiruy", amount: 30462 },
  { name: "Mirza", amount: 27505 },
  { name: "Jamal", amount: 20354 },
  { name: "Moez Hemani", amount: 10926 },
  { name: "Arshad Mirza", amount: 10068 },
  { name: "Ricardo", amount: 6450 },
  { name: "Munir", amount: -75 },
];

// === Bank loan trajectories ===
export const bankLoans = [
  { name: "ADIB Loan", current: 947948, prior: 1017310, priorMonth: "Dec-25", trend: "down" as const },
  { name: "ADIB New Loan", current: 819310, prior: 842719, priorMonth: "Jan-26", trend: "down" as const },
  { name: "Emirates Islamic", current: 1096368, prior: 814195, priorMonth: "Dec-25", trend: "up" as const },
];

export const totalBankDebt = 947948 + 819310 + 1096368; // 2,863,626
export const totalInvestorBalances = investorBalances.reduce((s, i) => s + i.amount, 0); // 683,042
export const grandTotalLoans = totalBankDebt + totalInvestorBalances; // 3,659,910 (matches reported)

// === Cash composition ===
export const marchCash = { hand: 8192, bank: 42797, total: 50989 };


