export interface Vehicle {
  name: string;
  initialInvestment: number;
  maintenanceExpenses: number;
  totalDepreciation: number;
  nbv: number;
  totalProfit: number;
  roiOnInvestment: number;
  roiOnNBV: number;
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
  totalGrossProfit: 1723976.39,
  totalCashWithdrawals: 1073389.00,
  totalCashExpenses: 216272.00,
  currentBalance: 434315.39,
  oldBalance: 45000.00,
  finalBalance: 479315.39,
  totalInitialInvestment: 4325615.00,
  totalMaintenanceExpenses: 206901.50,
  totalDepreciation: 1715447.54,
  totalNBV: 2416696.96,
  overallROI: 40,
  overallROINBV: 71,
  avgMonthlyIncome: 84577.07,
  currency: "AED",
};

export const vehicles: Vehicle[] = [
  { name: "G63 - 2021", initialInvestment: 780000, maintenanceExpenses: 30942, totalDepreciation: 320233, nbv: 428825, totalProfit: 415032.82, roiOnInvestment: 53, roiOnNBV: 97, monthsOfProfit: 23, avgMonthlyProfit: 18044.91 },
  { name: "Lamborghini - 2023", initialInvestment: 1350000, maintenanceExpenses: 39099, totalDepreciation: 526500, nbv: 784401, totalProfit: 538372.27, roiOnInvestment: 40, roiOnNBV: 69, monthsOfProfit: 23, avgMonthlyProfit: 23407.49 },
  { name: "Corvette - 2023", initialInvestment: 504690, maintenanceExpenses: 36081, totalDepreciation: 216736.31, nbv: 251872.69, totalProfit: 191452.99, roiOnInvestment: 38, roiOnNBV: 76, monthsOfProfit: 23, avgMonthlyProfit: 8324.04 },
  { name: "Cadillac - 2023", initialInvestment: 479875, maintenanceExpenses: 60137.50, totalDepreciation: 200480.94, nbv: 219256.56, totalProfit: 284383.93, roiOnInvestment: 59, roiOnNBV: 130, monthsOfProfit: 21, avgMonthlyProfit: 13542.09 },
  { name: "Patrol 2023", initialInvestment: 235000, maintenanceExpenses: 11643, totalDepreciation: 87080.40, nbv: 136276.60, totalProfit: 113058.75, roiOnInvestment: 48, roiOnNBV: 83, monthsOfProfit: 23, avgMonthlyProfit: 4915.60 },
  { name: "BMW 440i", initialInvestment: 187000, maintenanceExpenses: 14508, totalDepreciation: 54333.77, nbv: 118158.23, totalProfit: 69630.97, roiOnInvestment: 37, roiOnNBV: 59, monthsOfProfit: 17, avgMonthlyProfit: 4095.94 },
  { name: "GLE 53 - 2024", initialInvestment: 524000, maintenanceExpenses: 220, totalDepreciation: 192133.26, nbv: 331646.74, totalProfit: 75130.22, roiOnInvestment: 14, roiOnNBV: 23, monthsOfProfit: 14, avgMonthlyProfit: 5366.44 },
  { name: "C 200", initialInvestment: 265050, maintenanceExpenses: 0, totalDepreciation: 117949.86, nbv: 147100.14, totalProfit: 34324.44, roiOnInvestment: 13, roiOnNBV: 23, monthsOfProfit: 8, avgMonthlyProfit: 4290.56 },
  { name: "Q8", initialInvestment: 0, maintenanceExpenses: 840, totalDepreciation: 0, nbv: -840, totalProfit: 1470, roiOnInvestment: 0, roiOnNBV: 0, monthsOfProfit: 1, avgMonthlyProfit: 1470 },
  { name: "Cayenne", initialInvestment: 0, maintenanceExpenses: 0, totalDepreciation: 0, nbv: 0, totalProfit: 1120, roiOnInvestment: 0, roiOnNBV: 0, monthsOfProfit: 1, avgMonthlyProfit: 1120 },
];

export const monthlyIncome: MonthlyIncome[] = [
  { month: "Dec-23", g63: 0, lamborghini: 0, corvette: 8400, cadillac: 0, patrol: 0, bmw440i: 0, gle53: 0, c200: 0, q8: 0, cayenne: 0, total: 8400, percentage: 0.49 },
  { month: "Jan-24", g63: 0, lamborghini: 0, corvette: 0, cadillac: 0, patrol: 0, bmw440i: 0, gle53: 0, c200: 0, q8: 0, cayenne: 0, total: 0, percentage: 0 },
  { month: "Feb-24", g63: 13386.67, lamborghini: 5900, corvette: 600, cadillac: 0, patrol: 1680, bmw440i: 0, gle53: 0, c200: 0, q8: 0, cayenne: 0, total: 21566.67, percentage: 1.25 },
  { month: "Mar-24", g63: 18200, lamborghini: 11133.34, corvette: 56294.45, cadillac: 48563.20, patrol: 5720, bmw440i: 0, gle53: 2641.26, c200: 0, q8: 0, cayenne: 0, total: 142552.25, percentage: 8.27 },
  { month: "Apr-24", g63: 21000, lamborghini: 46799.96, corvette: 5116.66, cadillac: 22213.39, patrol: 6230, bmw440i: 0, gle53: 3810.77, c200: 0, q8: 0, cayenne: 0, total: 105170.78, percentage: 6.10 },
  { month: "May-24", g63: 16100, lamborghini: 14346.66, corvette: 12633.66, cadillac: 15829.26, patrol: 4760, bmw440i: 0, gle53: 0, c200: 0, q8: 0, cayenne: 0, total: 63669.58, percentage: 3.69 },
  { month: "Jun-24", g63: 19600, lamborghini: 36003.33, corvette: 8769.50, cadillac: 20160, patrol: 4470, bmw440i: 0, gle53: 0, c200: 0, q8: 0, cayenne: 0, total: 89002.83, percentage: 5.16 },
  { month: "Jul-24", g63: 21000, lamborghini: 20580, corvette: 5913.32, cadillac: 0, patrol: 5299.99, bmw440i: 0, gle53: 0, c200: 0, q8: 0, cayenne: 0, total: 52793.31, percentage: 3.06 },
  { month: "Aug-24", g63: 18580.48, lamborghini: 69825, corvette: 4266.65, cadillac: 17910, patrol: 2400, bmw440i: 6211.41, gle53: 0, c200: 0, q8: 0, cayenne: 0, total: 119193.54, percentage: 6.91 },
  { month: "Sep-24", g63: 9346.66, lamborghini: 13853.30, corvette: 6399.97, cadillac: 5253.33, patrol: 4460, bmw440i: 2733.33, gle53: 0, c200: 0, q8: 0, cayenne: 0, total: 42046.59, percentage: 2.44 },
  { month: "Oct-24", g63: 15026.56, lamborghini: 14714, corvette: 6465.90, cadillac: 14770, patrol: 4368, bmw440i: 280, gle53: 0, c200: 0, q8: 0, cayenne: 0, total: 55624.46, percentage: 3.23 },
  { month: "Nov-24", g63: 18333.42, lamborghini: 22025.50, corvette: 6853, cadillac: 13576.69, patrol: 4190, bmw440i: 2633.33, gle53: 1266.66, c200: 0, q8: 0, cayenne: 0, total: 68878.60, percentage: 4.00 },
  { month: "Dec-24", g63: 18333.42, lamborghini: 18689.83, corvette: 25410, cadillac: 14326.67, patrol: 7263.27, bmw440i: 6593.42, gle53: 0, c200: 0, q8: 0, cayenne: 0, total: 90616.61, percentage: 5.26 },
  { month: "Jan-25", g63: 18333.42, lamborghini: 30486.74, corvette: 6560.50, cadillac: 11530, patrol: 7366.18, bmw440i: 6570.04, gle53: 0, c200: 0, q8: 0, cayenne: 0, total: 80846.88, percentage: 4.69 },
  { month: "Feb-25", g63: 18333.42, lamborghini: 29476.66, corvette: 6979.42, cadillac: 11167.76, patrol: 4293.76, bmw440i: 3526.66, gle53: 3018.33, c200: 0, q8: 0, cayenne: 0, total: 76796.02, percentage: 4.45 },
  { month: "Mar-25", g63: 18333.42, lamborghini: 26667.95, corvette: 10381.99, cadillac: 14225.48, patrol: 2008.33, bmw440i: 3179.98, gle53: 2773.33, c200: 0, q8: 0, cayenne: 0, total: 77570.48, percentage: 4.50 },
  { month: "Apr-25", g63: 19000.10, lamborghini: 26292.64, corvette: 3120, cadillac: 10853.72, patrol: 5351.91, bmw440i: 5286.65, gle53: 4001.31, c200: 0, q8: 0, cayenne: 0, total: 73906.33, percentage: 4.29 },
  { month: "May-25", g63: 19977.89, lamborghini: 20453.34, corvette: 0, cadillac: 10731.08, patrol: 6663.99, bmw440i: 6318.28, gle53: 12009.56, c200: 4666.62, q8: 0, cayenne: 0, total: 80820.76, percentage: 4.69 },
  { month: "Jun-25", g63: 18688.99, lamborghini: 13716.67, corvette: 1440, cadillac: 9696.67, patrol: 4000, bmw440i: 2680.01, gle53: 7980, c200: 5049.53, q8: 0, cayenne: 0, total: 63251.87, percentage: 3.67 },
  { month: "Jul-25", g63: 19000.03, lamborghini: 15230.01, corvette: 1966.66, cadillac: 3640, patrol: 5333.34, bmw440i: 4306.66, gle53: 1630, c200: 2674.46, q8: 0, cayenne: 0, total: 53781.16, percentage: 3.12 },
  { month: "Aug-25", g63: 15766.67, lamborghini: 19925.33, corvette: 2583.33, cadillac: 2956, patrol: 5511.11, bmw440i: 2366.65, gle53: 9108.60, c200: 3277.83, q8: 1470, cayenne: 0, total: 62965.52, percentage: 3.65 },
  { month: "Sep-25", g63: 18900, lamborghini: 10665.34, corvette: 9854.65, cadillac: 8914, patrol: 5333.33, bmw440i: 4932.01, gle53: 4971.73, c200: 5250, q8: 0, cayenne: 1120, total: 69941.06, percentage: 4.06 },
  { month: "Oct-25", g63: 18901.67, lamborghini: 20656.66, corvette: 1443.33, cadillac: 11000, patrol: 5511.11, bmw440i: 5393.66, gle53: 11040.95, c200: 5425, q8: 0, cayenne: 0, total: 79372.38, percentage: 4.60 },
  { month: "Nov-25", g63: 19600, lamborghini: 18380.01, corvette: 0, cadillac: 10000, patrol: 5333.33, bmw440i: 4752.22, gle53: 9817.71, c200: 4808.33, q8: 0, cayenne: 0, total: 72691.60, percentage: 4.22 },
  { month: "Dec-25", g63: 21290, lamborghini: 32550, corvette: 0, cadillac: 7066.67, patrol: 5511.11, bmw440i: 1866.66, gle53: 1060, c200: 3172.67, q8: 0, cayenne: 0, total: 72517.11, percentage: 4.21 },
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

export const formatAED = (value: number) => {
  const prefix = value < 0 ? "-AED " : "AED ";
  return `${prefix}${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
