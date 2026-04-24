export interface GoldTransaction {
  transId: string;
  date: string;
  transType: string;
  party: string;
  qtyGrams: number;
  amountBRL: number;
  meltingLoss: number;
  laborGrams: number;
  qtyPure: number;
  rateUSD: number;
  amountUSD: number;
  amountAED: number;
}

export interface SaleTransaction {
  transId: string;
  date: string;
  customer: string;
  qtyGrams: number;
  rateUSD: number;
  amountUSD: number;
  costUSD: number;
  profitUSD: number;
}

export interface ExpenseItem {
  transId: string;
  date: string;
  category: string;
  amount: number;
}

export const goldPurchases: GoldTransaction[] = [
  { transId: "260123-162126", date: "10/9/25", transType: "Buy", party: "LDO", qtyGrams: 200, amountBRL: 129000, meltingLoss: 0, laborGrams: 0, qtyPure: 200, rateUSD: 120.112, amountUSD: 24022.35, amountAED: 88162.01 },
  { transId: "260123-162308", date: "10/15/25", transType: "Buy", party: "LDO", qtyGrams: 100, amountBRL: 66191.4, meltingLoss: 0.29, laborGrams: 0, qtyPure: 99.71, rateUSD: 121.805, amountUSD: 12145.21, amountAED: 44572.92 },
  { transId: "260123-162659", date: "10/21/25", transType: "Buy", party: "LDO", qtyGrams: 350, amountBRL: 248115, meltingLoss: 0, laborGrams: 0, qtyPure: 350, rateUSD: 131.521, amountUSD: 46032.47, amountAED: 168939.16 },
  { transId: "260123-162816", date: "10/22/25", transType: "Buy", party: "khansa", qtyGrams: 1000, amountBRL: 0, meltingLoss: 5, laborGrams: 0, qtyPure: 995, rateUSD: 129.656, amountUSD: 129008, amountAED: 473459.36 },
  { transId: "260123-163502", date: "10/23/25", transType: "Buy", party: "GUITO", qtyGrams: 628.19, amountBRL: 0, meltingLoss: 0, laborGrams: 0, qtyPure: 628.19, rateUSD: 136.296, amountUSD: 85619.95, amountAED: 314225.22 },
  { transId: "260123-163653", date: "10/25/25", transType: "Buy", party: "LDO", qtyGrams: 293.4, amountBRL: 166372.11, meltingLoss: 82.09, laborGrams: 0, qtyPure: 211.31, rateUSD: 146.891, amountUSD: 31039.57, amountAED: 113915.23 },
  { transId: "260126-143112", date: "10/25/25", transType: "Buy", party: "LDO", qtyGrams: 200, amountBRL: 135000, meltingLoss: 0, laborGrams: 0, qtyPure: 200, rateUSD: 125.933, amountUSD: 25186.57, amountAED: 92434.70 },
  { transId: "260126-143237", date: "10/26/25", transType: "Buy", party: "LDO", qtyGrams: 60.79, amountBRL: 40261.9, meltingLoss: 10.47, laborGrams: 0, qtyPure: 50.32, rateUSD: 151.825, amountUSD: 7639.83, amountAED: 28038.17 },
  { transId: "260126-143555", date: "10/28/25", transType: "Buy", party: "LOUCS", qtyGrams: 400, amountBRL: 264000, meltingLoss: 0, laborGrams: 0, qtyPure: 400, rateUSD: 124.411, amountUSD: 49764.37, amountAED: 182635.25 },
  { transId: "260126-143758", date: "10/31/25", transType: "Buy", party: "LOUCS", qtyGrams: 1000, amountBRL: 654500, meltingLoss: 0, laborGrams: 0, qtyPure: 1000, rateUSD: 123.491, amountUSD: 123490.57, amountAED: 453210.38 },
  { transId: "260126-143947", date: "11/2/25", transType: "Buy", party: "LOUCS", qtyGrams: 1000, amountBRL: 653000, meltingLoss: 0, laborGrams: 0, qtyPure: 1000, rateUSD: 122.285, amountUSD: 122284.64, amountAED: 448784.64 },
  { transId: "260126-144147", date: "11/5/25", transType: "Buy", party: "LOUCS", qtyGrams: 2500, amountBRL: 1632500, meltingLoss: 0, laborGrams: 0, qtyPure: 2500, rateUSD: 121.375, amountUSD: 303438.66, amountAED: 1113619.89 },
  { transId: "260126-144336", date: "12/2/25", transType: "Buy", party: "LOUCS", qtyGrams: 1000, amountBRL: 653000, meltingLoss: 0, laborGrams: 0, qtyPure: 1000, rateUSD: 121.874, amountUSD: 121873.83, amountAED: 447276.97 },
  { transId: "260126-150453", date: "12/5/25", transType: "Buy", party: "LOUCS", qtyGrams: 1000, amountBRL: 650000, meltingLoss: 0, laborGrams: 0, qtyPure: 1000, rateUSD: 119.705, amountUSD: 119705.34, amountAED: 439318.60 },
  { transId: "260126-150609", date: "12/8/25", transType: "Buy", party: "LOUCS", qtyGrams: 1000, amountBRL: 650000, meltingLoss: 0, laborGrams: 0, qtyPure: 1000, rateUSD: 119.485, amountUSD: 119485.29, amountAED: 438511.03 },
  { transId: "260126-150723", date: "12/9/25", transType: "Buy", party: "LOUCS", qtyGrams: 2000, amountBRL: 1296000, meltingLoss: 0, laborGrams: 0, qtyPure: 2000, rateUSD: 119.337, amountUSD: 238674.03, amountAED: 875933.70 },
  { transId: "260126-150953", date: "12/10/25", transType: "Buy", party: "LDO", qtyGrams: 100, amountBRL: 64000, meltingLoss: 0, laborGrams: 0, qtyPure: 100, rateUSD: 116.682, amountUSD: 11668.19, amountAED: 42822.24 },
  { transId: "260126-151120", date: "12/11/25", transType: "Buy", party: "ELIZEU", qtyGrams: 2000, amountBRL: 1296000, meltingLoss: 0, laborGrams: 0, qtyPure: 2000, rateUSD: 119.227, amountUSD: 238454.46, amountAED: 875127.88 },
  { transId: "260126-151947", date: "12/16/25", transType: "Buy", party: "ELIZEU", qtyGrams: 1000, amountBRL: 648000, meltingLoss: 0, laborGrams: 0, qtyPure: 1000, rateUSD: 118.899, amountUSD: 118899.08, amountAED: 436359.63 },
  { transId: "260126-152322", date: "12/16/25", transType: "Buy", party: "LDO", qtyGrams: 105.16, amountBRL: 67828.2, meltingLoss: 0, laborGrams: 0, qtyPure: 105.16, rateUSD: 118.240, amountUSD: 12434.13, amountAED: 45633.27 },
  { transId: "260126-152920", date: "12/19/25", transType: "Buy", party: "ELIZEU", qtyGrams: 4000, amountBRL: 2600000, meltingLoss: 0, laborGrams: 0, qtyPure: 4000, rateUSD: 117.435, amountUSD: 469738.03, amountAED: 1723938.57 },
  { transId: "260126-153223", date: "12/19/25", transType: "Buy", party: "GUITO", qtyGrams: 1163.12, amountBRL: 0, meltingLoss: 0, laborGrams: 0, qtyPure: 1163.12, rateUSD: 135.500, amountUSD: 157602.49, amountAED: 578401.14 },
  { transId: "260126-154145", date: "12/19/25", transType: "Buy", party: "LDO", qtyGrams: 54, amountBRL: 34830, meltingLoss: 0, laborGrams: 0, qtyPure: 54, rateUSD: 116.531, amountUSD: 6292.68, amountAED: 23094.15 },
  { transId: "260126-154611", date: "12/29/25", transType: "Buy", party: "ELIZEU", qtyGrams: 2000, amountBRL: 1360000, meltingLoss: 0, laborGrams: 0, qtyPure: 2000, rateUSD: 121.864, amountUSD: 243727.60, amountAED: 894480.29 },
  { transId: "260126-154728", date: "1/6/26", transType: "Buy", party: "ELIZEU", qtyGrams: 5000, amountBRL: 3375000, meltingLoss: 0, laborGrams: 0, qtyPure: 5000, rateUSD: 125.465, amountUSD: 627323.42, amountAED: 2302276.95 },
  { transId: "260126-154843", date: "1/12/26", transType: "Buy", party: "ELIZEU", qtyGrams: 2000, amountBRL: 1350000, meltingLoss: 0, laborGrams: 0, qtyPure: 2000, rateUSD: 125.581, amountUSD: 251162.79, amountAED: 921767.44 },
  { transId: "260126-160157", date: "1/14/26", transType: "Buy", party: "LDO", qtyGrams: 100, amountBRL: 67500, meltingLoss: 0, laborGrams: 0, qtyPure: 100, rateUSD: 125.465, amountUSD: 12546.47, amountAED: 46045.54 },
  { transId: "260126-160434", date: "1/19/26", transType: "Buy", party: "LDO", qtyGrams: 3000, amountBRL: 2085000, meltingLoss: 0, laborGrams: 0, qtyPure: 3000, rateUSD: 129.495, amountUSD: 388485.19, amountAED: 1425740.64 },
  { transId: "260126-160539", date: "1/23/26", transType: "Buy", party: "ELIZEU", qtyGrams: 2000, amountBRL: 1420000, meltingLoss: 0, laborGrams: 0, qtyPure: 2000, rateUSD: 134.165, amountUSD: 268329.55, amountAED: 984769.46 },
  { transId: "260206-184049", date: "1/30/26", transType: "Buy", party: "ELIZEU", qtyGrams: 5000, amountBRL: 3775000, meltingLoss: 0, laborGrams: 0, qtyPure: 5000, rateUSD: 144.498, amountUSD: 722488.04, amountAED: 2651531.10 },
  { transId: "260206-184307", date: "1/31/26", transType: "Buy", party: "CAMS", qtyGrams: 300, amountBRL: 240173.74, meltingLoss: 0, laborGrams: 0, qtyPure: 300, rateUSD: 152.201, amountUSD: 45660.41, amountAED: 167573.69 },
];

export const sales: SaleTransaction[] = [
  { transId: "260126-161050", date: "10/18/25", customer: "Moti", qtyGrams: 200, rateUSD: 128.924, amountUSD: 25784.88, costUSD: 24022.35, profitUSD: 1762.53 },
  { transId: "260126-161924", date: "10/20/25", customer: "Moti", qtyGrams: 735, rateUSD: 136.866, amountUSD: 100596.24, costUSD: 95167.32, profitUSD: 5428.92 },
  { transId: "260126-162037", date: "10/22/25", customer: "Moti", qtyGrams: 259.74, rateUSD: 130.532, amountUSD: 33904.36, costUSD: 33676.92, profitUSD: 227.44 },
  { transId: "260126-165242", date: "11/7/25", customer: "AL MASA", qtyGrams: 727.90, rateUSD: 128.422, amountUSD: 93478.12, costUSD: 85480.34, profitUSD: 7997.77 },
  { transId: "260126-165804", date: "11/13/25", customer: "Moti", qtyGrams: 1700, rateUSD: 134.904, amountUSD: 229337.53, costUSD: 218508.93, profitUSD: 10828.61 },
  { transId: "260127-140247", date: "11/25/25", customer: "Moti", qtyGrams: 2500, rateUSD: 132.911, amountUSD: 332277.72, costUSD: 304912.32, profitUSD: 27365.40 },
  { transId: "260127-140737", date: "12/9/25", customer: "Moti", qtyGrams: 2000, rateUSD: 135.483, amountUSD: 270966.29, costUSD: 243116.29, profitUSD: 27849.99 },
  { transId: "260127-142641", date: "12/16/25", customer: "UNIP HK", qtyGrams: 671, rateUSD: 136.068, amountUSD: 91301.82, costUSD: 80901.01, profitUSD: 10400.81 },
  { transId: "260127-145100", date: "12/18/25", customer: "GOLDEN", qtyGrams: 2639.51, rateUSD: 136.995, amountUSD: 361600.18, costUSD: 315359.00, profitUSD: 46241.18 },
  { transId: "260127-145937", date: "12/23/25", customer: "Moti", qtyGrams: 2360, rateUSD: 144.132, amountUSD: 340150.79, costUSD: 281226.72, profitUSD: 58924.06 },
  { transId: "260127-151722", date: "1/5/26", customer: "Moti", qtyGrams: 3500, rateUSD: 142.106, amountUSD: 497371.68, costUSD: 413818.47, profitUSD: 83553.21 },
  { transId: "260127-152402", date: "1/20/26", customer: "Moti", qtyGrams: 2476.35, rateUSD: 151.430, amountUSD: 374993.68, costUSD: 293967.11, profitUSD: 81026.57 },
  { transId: "260203-133659", date: "1/30/26", customer: "Moti", qtyGrams: 4000, rateUSD: 162.618, amountUSD: 650473.42, costUSD: 505282.91, profitUSD: 145190.51 },
  { transId: "260206-184527", date: "1/31/26", customer: "UNIP HK", qtyGrams: 5744.97, rateUSD: 158.053, amountUSD: 908009.74, costUSD: 720960.97, profitUSD: 187048.77 },
  { transId: "260211-153658", date: "2/11/26", customer: "UNIP HK", qtyGrams: 5379.53, rateUSD: 162.458, amountUSD: 873947.69, costUSD: 714219.62, profitUSD: 159728.07 },
  { transId: "260219-141227", date: "2/17/26", customer: "Moti", qtyGrams: 5000, rateUSD: 158.664, amountUSD: 793319.08, costUSD: 659332.36, profitUSD: 133986.72 },
  { transId: "260309-131753", date: "2/26/26", customer: "UNIP HK", qtyGrams: 14.70, rateUSD: 166.862, amountUSD: 2452.88, costUSD: 1972.22, profitUSD: 480.65 },
  { transId: "260310-133410", date: "3/9/26", customer: "Moti", qtyGrams: 412.096, rateUSD: 163.808, amountUSD: 67504.59, costUSD: 57086.71, profitUSD: 10417.88 },
  { transId: "260422-181809", date: "4/1/26", customer: "UNIP HK", qtyGrams: 4490.71, rateUSD: 151.253, amountUSD: 679232.00, costUSD: 658752.13, profitUSD: 20479.87 },
  { transId: "260422-181930", date: "4/2/26", customer: "Kenzo HK", qtyGrams: 1960, rateUSD: 150.491, amountUSD: 294962.00, costUSD: 284122.37, profitUSD: 10839.64 },
];

export const expenses: ExpenseItem[] = [
  { transId: "260126-150320", date: "12/4/25", category: "Labor", amount: 1936.41 },
  { transId: "260126-151508", date: "12/11/25", category: "Hedge Expenses", amount: 75000 },
  { transId: "260126-151816", date: "12/12/25", category: "Transport", amount: 2194.44 },
  { transId: "260126-152119", date: "12/12/25", category: "Transport", amount: 12370.30 },
  { transId: "260126-152605", date: "12/16/25", category: "Hedge Expenses", amount: 25000 },
  { transId: "260126-152738", date: "12/17/25", category: "Transport", amount: 3922.24 },
  { transId: "260126-154345", date: "12/28/25", category: "Labor", amount: 2162.16 },
  { transId: "260126-154444", date: "12/28/25", category: "BONUS", amount: 4504.51 },
  { transId: "260126-155024", date: "1/12/26", category: "Transport", amount: 1726.92 },
  { transId: "260126-155222", date: "1/12/26", category: "Transport", amount: 2051.46 },
  { transId: "260126-155324", date: "1/13/26", category: "Transport", amount: 371.75 },
  { transId: "260126-155413", date: "1/13/26", category: "Transport", amount: 278.81 },
  { transId: "260126-155506", date: "1/13/26", category: "Hotel", amount: 343.49 },
  { transId: "260126-155558", date: "1/13/26", category: "Other Exp", amount: 92.94 },
  { transId: "260126-155652", date: "1/13/26", category: "TAX+BONUS", amount: 780.67 },
  { transId: "260126-155803", date: "1/13/26", category: "Transport", amount: 457.99 },
  { transId: "260126-155847", date: "1/13/26", category: "Transport", amount: 1610.60 },
  { transId: "260126-155959", date: "1/13/26", category: "Transport", amount: 1412.64 },
  { transId: "260126-160053", date: "1/13/26", category: "BONUS", amount: 501.86 },
  { transId: "260126-160347", date: "1/15/26", category: "Labor", amount: 802.97 },
  { transId: "260217-154532", date: "1/31/26", category: "BONUS", amount: 5166.10 },
  { transId: "260127-154815", date: "1/23/26", category: "Hedge Expenses", amount: 73206 },
  { transId: "260206-190209", date: "1/31/26", category: "Transport", amount: 7113.20 },
  { transId: "260206-190250", date: "1/31/26", category: "Hotel", amount: 1000 },
  { transId: "260206-190359", date: "1/31/26", category: "Transport", amount: 5877.67 },
  { transId: "260209-125207", date: "1/19/26", category: "Labor", amount: 343.50 },
  { transId: "260309-132352", date: "2/26/26", category: "Hedge Expenses", amount: 50000 },
  { transId: "260310-140715", date: "3/9/26", category: "Melting Loss", amount: 5101.65 },
  { transId: "260318-132749", date: "3/17/26", category: "Melting Loss", amount: 14588.20 },
  { transId: "260318-133812", date: "3/18/26", category: "Other Exp", amount: 1824.32 },
];

// Sales discounts tracked separately
export const salesDiscounts: ExpenseItem[] = [
  { transId: "260126-161527", date: "10/18/25", category: "Sales Discount", amount: 73.38 },
  { transId: "260127-131022", date: "11/27/25", category: "Sales Discount", amount: 585.07 },
  { transId: "260127-140916", date: "12/9/25", category: "Sales Discount", amount: 907.95 },
  { transId: "260127-143327", date: "12/18/25", category: "Sales Discount", amount: 1870.02 },
  { transId: "260127-144654", date: "12/17/25", category: "Sales Discount", amount: 2017.80 },
  { transId: "260127-150045", date: "12/26/25", category: "Sales Discount", amount: 4708.02 },
  { transId: "260127-154453", date: "1/21/26", category: "Sales Discount", amount: 874.48 },
  { transId: "260203-133250", date: "1/21/26", category: "Sales Discount", amount: 67.59 },
  { transId: "260203-133845", date: "1/30/26", category: "Sales Discount", amount: 2086.34 },
  { transId: "260206-144217", date: "1/30/26", category: "Sales Discount", amount: 230.77 },
  { transId: "260209-133856", date: "1/31/26", category: "Sales Discount", amount: 1945.39 },
  { transId: "260219-141901", date: "2/17/26", category: "Sales Discount", amount: 2785.08 },
  { transId: "260309-132227", date: "2/26/26", category: "Sales Discount", amount: 1735.76 },
  { transId: "260318-133512", date: "3/18/26", category: "Sales Discount", amount: 23.57 },
];

export const profitLoss = {
  sales: 7021664.68,
  salesDiscount: 19911.22,
  netSales: 7001753.46,
  costOfSales: 5991886.08,
  meltingLoss: 22593.98,
  hedgeExpenses: 232875.60,
  grossProfit: 754397.80,
  transport: 68443.25,
  labor: 5677.07,
  hotel: 1343.49,
  bonus: 10172.46,
  taxBonus: 780.67,
  bengaliConversion: 10085.00,
  jlnShopSetup: 8414.00,
  otherExp: 23975.26,
  totalAdminExpenses: 128891.21,
  operatingProfit: 625506.60,
  fxGain: 771.42,
  fxLoss: 1730.12,
  netProfit: 624547.90,
  // Margins
  get grossMargin() { return this.grossProfit / this.netSales; },
  get netMargin() { return this.netProfit / this.netSales; },
};

// Monthly profit (USD) from Profit Report sheet
export const monthlyProfit = [
  { month: "Oct-25", sales: 160285.48, profit: 7418.89, qtySold: 1194.74 },
  { month: "Nov-25", sales: 655093.37, profit: 46191.78, qtySold: 4927.90 },
  { month: "Dec-25", sales: 1064019.08, profit: 143416.05, qtySold: 7670.51 },
  { month: "Jan-26", sales: 2430848.52, profit: 496819.06, qtySold: 18221.32 },
  { month: "Feb-26", sales: 1669719.64, profit: 294195.44, qtySold: 10394.23 },
  { month: "Mar-26", sales: 67504.59, profit: 10417.88, qtySold: 412.10 },
  { month: "Apr-26", sales: 974194.00, profit: 31319.50, qtySold: 6450.71 },
];

// Customer profit aggregates (inception to date, USD) — through Apr-26
export const customerProfitAgg = [
  { name: "Moti", profit: 586561.95, share: 55.85 },
  { name: "UNIP HK", profit: 398618.04, share: 37.95 },
  { name: "GOLDEN", profit: 46241.18, share: 4.40 },
  { name: "Kenzo HK", profit: 10839.64, share: 1.03 },
  { name: "AL MASA", profit: 7997.77, share: 0.76 },
];

// Supplier purchase aggregates (g)
export const supplierPurchaseAgg = [
  { name: "ELIZEU", grams: 14000, note: "Dec-Jan, largest historic" },
  { name: "LOUCS", grams: 10500, note: "Nov-Dec" },
  { name: "HDRSP", grams: 7000, note: "Mar-Apr, current main" },
  { name: "LDO", grams: 5500, note: "Consistent all months" },
  { name: "GUITO + others", grams: 2800, note: "Spot purchases" },
];


export const brokerBalances = {
  brokerPY: { usd: -266259, aed: 0 },
  brokerZHOU: { usd: 13313, aed: 0 },
};

export const AED_TO_USD_RATE = 3.673;

export interface LedgerBalance {
  name: string;
  role: "customer" | "supplier";
  balanceUSD: number;
  balanceAED: number;
  balanceUSDEquiv: number; // AED converted to USD at 3.673
  totalUSD: number; // combined USD position
}

export const customerBalances: LedgerBalance[] = [
  { name: "Moti", role: "customer", balanceUSD: 0, balanceAED: 0, balanceUSDEquiv: 0, totalUSD: 0 },
  { name: "AL MASA", role: "customer", balanceUSD: 0, balanceAED: 12775.12, balanceUSDEquiv: 12775.12 / AED_TO_USD_RATE, totalUSD: 12775.12 / AED_TO_USD_RATE },
  { name: "GOLDEN", role: "customer", balanceUSD: 0, balanceAED: 0, balanceUSDEquiv: 0, totalUSD: 0 },
  { name: "UNIP HK", role: "customer", balanceUSD: 0, balanceAED: 0, balanceUSDEquiv: 0, totalUSD: 0 },
];

export const supplierBalances: LedgerBalance[] = [
  { name: "LDO", role: "supplier", balanceUSD: 0, balanceAED: 0, balanceUSDEquiv: 0, totalUSD: 0 },
  { name: "GUITO", role: "supplier", balanceUSD: 0, balanceAED: 0, balanceUSDEquiv: 0, totalUSD: 0 },
  { name: "LOUCS", role: "supplier", balanceUSD: 0, balanceAED: 0, balanceUSDEquiv: 0, totalUSD: 0 },
  { name: "ELIZEU", role: "supplier", balanceUSD: 0, balanceAED: 0, balanceUSDEquiv: 0, totalUSD: 0 },
  { name: "khansa", role: "supplier", balanceUSD: 0, balanceAED: 0, balanceUSDEquiv: 0, totalUSD: 0 },
  { name: "CAMS", role: "supplier", balanceUSD: 0, balanceAED: 0, balanceUSDEquiv: 0, totalUSD: 0 },
];

// Inventory position — Apr-26 (Mar closing 5,907g + Apr purchases ~7,350g − Apr sold 6,450.71g)
export const goldInventory = {
  balanceGrams: 6806.72,
  totalMeltingLossGrams: 2092.13,
  totalPurchasedGrams: 60184.81,
  totalSoldGrams: 51285.96,
  costPerGram: 798688 / 5907.43,
  costOfRemainingUSD: 920254,
  bookValueAED: 920254 * AED_TO_USD_RATE,
};

// Ahmad investment position (100% owner) — through Apr-26
export const ahmadPosition = {
  // Part A — Cash equity flow
  openingBalance: 55327,
  netProfit: 655867.40,
  withdrawals: 20000,
  cashEquityClosing: 691194.40, // 55327 + 655867.40 - 20000

  // Part B — Net profit deployment
  goldInventoryUSD: 920254,
  arAlMasa: 3478,
  brokerZhouReceivable: 13313,
  brokerPYPayable: -266259,

  get netReceivables() {
    return this.arAlMasa + this.brokerZhouReceivable + this.brokerPYPayable;
  },
  get totalNetPosition() {
    return this.cashEquityClosing + this.goldInventoryUSD + this.netReceivables;
  },
};

// Backwards-compat alias used by older components
export const goldCapital = {
  brokerPY: -266259,
  brokerZHOU: 13313,
  brokerZHOUAED: 0,
  goldInventoryUSD: 920254,
  arMotiAED: 0,
  arAlMasaAED: 3478 * AED_TO_USD_RATE,
  arUnipHK: 0,
  arGolden: 0,
  get totalAR_USD() { return 3478; },
  get totalBrokers() { return this.brokerPY + this.brokerZHOU; },
  get totalCurrentPosition() {
    return this.totalBrokers + this.goldInventoryUSD + this.totalAR_USD;
  },
  netProfit: 655867.40,
  get initialCapital() { return this.totalCurrentPosition - this.netProfit; },
};

export const formatCurrency = (value: number, currency = "USD") => {
  const prefix = currency === "USD" ? "$" : currency === "AED" ? "AED " : "R$ ";
  return `${prefix}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatNumber = (value: number, decimals = 2) => {
  return value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};
