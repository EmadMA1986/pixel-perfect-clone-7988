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
  { transId: "260126-143555", date: "10/28/25", transType: "Buy", party: "LOUCS", qtyGrams: 400, amountBRL: 264000, meltingLoss: 0, laborGrams: 0, qtyPure: 400, rateUSD: 124.411, amountUSD: 49764.37, amountAED: 182635.25 },
  { transId: "260126-143758", date: "10/31/25", transType: "Buy", party: "LOUCS", qtyGrams: 1000, amountBRL: 654500, meltingLoss: 0, laborGrams: 0, qtyPure: 1000, rateUSD: 123.491, amountUSD: 123490.57, amountAED: 453210.38 },
  { transId: "260126-143947", date: "11/2/25", transType: "Buy", party: "LOUCS", qtyGrams: 1000, amountBRL: 653000, meltingLoss: 0, laborGrams: 0, qtyPure: 1000, rateUSD: 122.285, amountUSD: 122284.64, amountAED: 448784.64 },
  { transId: "260126-144147", date: "11/5/25", transType: "Buy", party: "LOUCS", qtyGrams: 2500, amountBRL: 1632500, meltingLoss: 0, laborGrams: 0, qtyPure: 2500, rateUSD: 121.375, amountUSD: 303438.66, amountAED: 1113619.89 },
  { transId: "260126-151120", date: "12/11/25", transType: "Buy", party: "ELIZEU", qtyGrams: 2000, amountBRL: 1296000, meltingLoss: 0, laborGrams: 0, qtyPure: 2000, rateUSD: 119.227, amountUSD: 238454.46, amountAED: 875127.88 },
  { transId: "260126-152920", date: "12/19/25", transType: "Buy", party: "ELIZEU", qtyGrams: 4000, amountBRL: 2600000, meltingLoss: 0, laborGrams: 0, qtyPure: 4000, rateUSD: 117.435, amountUSD: 469738.03, amountAED: 1723938.57 },
  { transId: "260126-154728", date: "1/6/26", transType: "Buy", party: "ELIZEU", qtyGrams: 5000, amountBRL: 3375000, meltingLoss: 0, laborGrams: 0, qtyPure: 5000, rateUSD: 125.465, amountUSD: 627323.42, amountAED: 2302276.95 },
  { transId: "260126-160434", date: "1/19/26", transType: "Buy", party: "LDO", qtyGrams: 3000, amountBRL: 2085000, meltingLoss: 0, laborGrams: 0, qtyPure: 3000, rateUSD: 129.495, amountUSD: 388485.19, amountAED: 1425740.64 },
  { transId: "260126-160539", date: "1/23/26", transType: "Buy", party: "ELIZEU", qtyGrams: 2000, amountBRL: 1420000, meltingLoss: 0, laborGrams: 0, qtyPure: 2000, rateUSD: 134.165, amountUSD: 268329.55, amountAED: 984769.46 },
  { transId: "260206-184049", date: "1/30/26", transType: "Buy", party: "ELIZEU", qtyGrams: 5000, amountBRL: 3775000, meltingLoss: 0, laborGrams: 0, qtyPure: 5000, rateUSD: 144.498, amountUSD: 722488.04, amountAED: 2651531.1 },
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
  { transId: "260211-153658", date: "2/11/26", customer: "UNIP HK", qtyGrams: 5398.69, rateUSD: 162.458, amountUSD: 877058.23, costUSD: 767935.44, profitUSD: 109122.79 },
  { transId: "260219-141227", date: "2/17/26", customer: "Moti", qtyGrams: 5000, rateUSD: 158.664, amountUSD: 793319.08, costUSD: 659332.36, profitUSD: 133986.72 },
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
  { transId: "260217-154532", date: "1/31/26", category: "BONUS", amount: 5166.10 },
  { transId: "260127-154815", date: "1/23/26", category: "Hedge Expenses", amount: 73206 },
  { transId: "260127-165138", date: "1/23/26", category: "Melting Loss", amount: 53793.37 },
  { transId: "260206-190209", date: "1/31/26", category: "Transport", amount: 7113.20 },
  { transId: "260206-190250", date: "1/31/26", category: "Hotel", amount: 1000 },
  { transId: "260206-190359", date: "1/31/26", category: "Transport", amount: 5877.67 },
  { transId: "260209-125207", date: "1/19/26", category: "Labor", amount: 343.50 },
  { transId: "260209-134041", date: "2/5/26", category: "Melting Loss", amount: 2164.05 },
];

export const profitLoss = {
  sales: 5980623.76,
  salesDiscount: 18151.89,
  costOfSales: 5043668.47,
  meltingLoss: 55957.42,
  hedgeExpenses: 173206,
  grossProfit: 689639.97,
  transport: 39388.01,
  labor: 4442.07,
  hotel: 1343.49,
  bonus: 10172.46,
  taxBonus: 780.67,
  otherExp: 92.94,
  totalAdminExpenses: 56219.64,
  operatingProfit: 633420.33,
  fxGain: 771.42,
  fxLoss: 1128.97,
  netProfit: 633062.78,
};

export const brokerBalances = {
  brokerPY: { usd: 395119.47, aed: 0 },
  brokerZHOU: { usd: 0, aed: 0 },
};

// From spreadsheet Page 3 final row: 99.010g remaining
// From Page 9 inventory: 243.652g (trans 260126-160539) + 300g (trans 260206-184307)
export const goldInventory = {
  balanceGrams: 99.01,
  totalMeltingLossGrams: 444.642, // 0.29 + 5 + 82.09 + 10.47 + 428.612 + 16.03
  costOfRemainingUSD: 78349.93, // 32689.52 + 45660.41 from Page 9
};

export const formatCurrency = (value: number, currency = "USD") => {
  const prefix = currency === "USD" ? "$" : currency === "AED" ? "AED " : "R$ ";
  return `${prefix}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatNumber = (value: number, decimals = 2) => {
  return value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};
