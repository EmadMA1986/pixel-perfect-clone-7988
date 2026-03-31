export interface MkxMonthlyData {
  month: string;
  revenue: number;
  gasFees: number;
  grossProfit: number;
  totalExpenses: number;
  otherIncome: number;
  netProfit: number;
  assetMarketValue: number;
  assetBookValue: number;
  clientLiabilitiesFiat: number;
  clientLiabilitiesVA: number;
  tradingVolume: number;
  clientDepositsFiat: number;
  clientWithdrawalsFiat: number;
  clientDepositsVA: number;
  clientWithdrawalsVA: number;
}

export interface MkxKPI {
  month: string;
  grossMarginPct: number;
  netMarginPct: number;
  assetCoverageRatio: number;
  liquidityBuffer: number;
  fiatDepositWithdrawalRatio: number;
  vaDepositWithdrawalRatio: number;
  netFiatFlow: number;
  netVAFlow: number;
  tradingVolumePerTotalDeposits: number;
  netFlowPerTradingVolume: number;
  revenuePerTradingVolume: number;
  breakEvenTradingVolume: number;
  revenuePerTotalClientFlow: number;
  netProfitPerTradingVolume: number;
  assetValuationDiff: number;
  assetValuationRatio: number;
}

export interface MkxPLMonth {
  category: string;
  jan25: number;
  feb25: number;
  mar25: number;
  apr25: number;
  may25: number;
  jun25: number;
  jul25: number;
  aug25: number;
  sep25: number;
  oct25: number;
  nov25: number;
  dec25: number;
  jan26: number;
  total: number;
}

export interface MkxBalanceSheetItem {
  label: string;
  value: number;
  indent?: number;
  isTotal?: boolean;
  isSectionHeader?: boolean;
}

export const monthlyData: MkxMonthlyData[] = [
  {
    month: "Aug-25",
    revenue: 37149.33,
    gasFees: 2407.76,
    grossProfit: 34741.57,
    totalExpenses: 298462,
    otherIncome: 0,
    netProfit: -263720.43,
    assetMarketValue: 1947488,
    assetBookValue: 1939773,
    clientLiabilitiesFiat: 3190,
    clientLiabilitiesVA: 596595,
    tradingVolume: 10732522,
    clientDepositsFiat: 303000,
    clientWithdrawalsFiat: 10369688,
    clientDepositsVA: 10269346,
    clientWithdrawalsVA: 476569,
  },
  {
    month: "Sep-25",
    revenue: 47985,
    gasFees: 2497.94,
    grossProfit: 45487.06,
    totalExpenses: 356824,
    otherIncome: 0,
    netProfit: -311336.94,
    assetMarketValue: 1906310,
    assetBookValue: 1889350,
    clientLiabilitiesFiat: 6214,
    clientLiabilitiesVA: 969100,
    tradingVolume: 10496240,
    clientDepositsFiat: 8434726,
    clientWithdrawalsFiat: 2232552,
    clientDepositsVA: 2551258,
    clientWithdrawalsVA: 15686124,
  },
  {
    month: "Oct-25",
    revenue: 28755,
    gasFees: 2459,
    grossProfit: 26296,
    totalExpenses: 319163,
    otherIncome: 31493,
    netProfit: -261374,
    assetMarketValue: 1930980,
    assetBookValue: 1889350,
    clientLiabilitiesFiat: 285829,
    clientLiabilitiesVA: 800158,
    tradingVolume: 3212233,
    clientDepositsFiat: 334250,
    clientWithdrawalsFiat: 2716578,
    clientDepositsVA: 3099166,
    clientWithdrawalsVA: 604377,
  },
  {
    month: "Nov-25",
    revenue: 15694.73,
    gasFees: 2346.8,
    grossProfit: 13347.93,
    totalExpenses: 343285.59,
    otherIncome: 1800,
    netProfit: -328137.66,
    assetMarketValue: 1915700,
    assetBookValue: 1889350,
    clientLiabilitiesFiat: 159839,
    clientLiabilitiesVA: 629258,
    tradingVolume: 2547665,
    clientDepositsFiat: 605535,
    clientWithdrawalsFiat: 2309252,
    clientDepositsVA: 2223360,
    clientWithdrawalsVA: 692954,
  },
  {
    month: "Dec-25",
    revenue: 31180,
    gasFees: 3549,
    grossProfit: 27631,
    totalExpenses: 354449,
    otherIncome: 0,
    netProfit: -326818,
    assetMarketValue: 1915700,
    assetBookValue: 1889350,
    clientLiabilitiesFiat: 480777,
    clientLiabilitiesVA: 739425,
    tradingVolume: 5796181,
    clientDepositsFiat: 3429833,
    clientWithdrawalsFiat: 2457961,
    clientDepositsVA: 2777679,
    clientWithdrawalsVA: 3386590,
  },
  {
    month: "Jan-26",
    revenue: 233940.65,
    gasFees: 4588.18,
    grossProfit: 229352.47,
    totalExpenses: 349032.55,
    otherIncome: 0,
    netProfit: -119680.08,
    assetMarketValue: 2117779.50,
    assetBookValue: 1889350,
    clientLiabilitiesFiat: 94450.96,
    clientLiabilitiesVA: 822366.54,
    tradingVolume: 156283910,
    clientDepositsFiat: 16079491,
    clientWithdrawalsFiat: 140674913,
    clientDepositsVA: 140794466,
    clientWithdrawalsVA: 16032893,
  },
  {
    month: "Feb-26",
    revenue: 64713.59,
    gasFees: 6059.34,
    grossProfit: 58654.25,
    totalExpenses: 637363.66,
    otherIncome: 0,
    netProfit: -578709.41,
    assetMarketValue: 1846764,
    assetBookValue: 1889350,
    clientLiabilitiesFiat: 429337.63,
    clientLiabilitiesVA: 1619190.23,
    tradingVolume: 35197972,
    clientDepositsFiat: 18372446,
    clientWithdrawalsFiat: 16072109,
    clientDepositsVA: 20440245,
    clientWithdrawalsVA: 21459776,
  },
];

export const kpiData: MkxKPI[] = [
  {
    month: "Aug-25",
    grossMarginPct: 93.52,
    netMarginPct: -709.89,
    assetCoverageRatio: 3.247,
    liquidityBuffer: 1347703,
    fiatDepositWithdrawalRatio: 0.029,
    vaDepositWithdrawalRatio: 21.549,
    netFiatFlow: -10066688,
    netVAFlow: 9792777,
    tradingVolumePerTotalDeposits: 1.015,
    netFlowPerTradingVolume: -0.026,
    revenuePerTradingVolume: 0.00346,
    breakEvenTradingVolume: 86226319,
    revenuePerTotalClientFlow: 0.00173,
    netProfitPerTradingVolume: -0.02457,
    assetValuationDiff: 7715,
    assetValuationRatio: 0.00398,
  },
  {
    month: "Sep-25",
    grossMarginPct: 94.79,
    netMarginPct: -648.82,
    assetCoverageRatio: 1.955,
    liquidityBuffer: 930996,
    fiatDepositWithdrawalRatio: 3.778,
    vaDepositWithdrawalRatio: 0.163,
    netFiatFlow: 6202174,
    netVAFlow: -13134866,
    tradingVolumePerTotalDeposits: 0.955,
    netFlowPerTradingVolume: -0.661,
    revenuePerTradingVolume: 0.00457,
    breakEvenTradingVolume: 78051690,
    revenuePerTotalClientFlow: 0.00166,
    netProfitPerTradingVolume: -0.02966,
    assetValuationDiff: 16960,
    assetValuationRatio: 0.00898,
  },
  {
    month: "Oct-25",
    grossMarginPct: 91.45,
    netMarginPct: -908.97,
    assetCoverageRatio: 1.778,
    liquidityBuffer: 844993,
    fiatDepositWithdrawalRatio: 0.123,
    vaDepositWithdrawalRatio: 5.128,
    netFiatFlow: -2382328,
    netVAFlow: 2494789,
    tradingVolumePerTotalDeposits: 0.936,
    netFlowPerTradingVolume: 0.035,
    revenuePerTradingVolume: 0.00895,
    breakEvenTradingVolume: 35653831,
    revenuePerTotalClientFlow: 0.00426,
    netProfitPerTradingVolume: -0.08137,
    assetValuationDiff: 41630,
    assetValuationRatio: 0.02203,
  },
  {
    month: "Nov-25",
    grossMarginPct: 85.05,
    netMarginPct: -2090.75,
    assetCoverageRatio: 2.428,
    liquidityBuffer: 1126603,
    fiatDepositWithdrawalRatio: 0.262,
    vaDepositWithdrawalRatio: 3.209,
    netFiatFlow: -1703717,
    netVAFlow: 1530406,
    tradingVolumePerTotalDeposits: 0.901,
    netFlowPerTradingVolume: -0.068,
    revenuePerTradingVolume: 0.00616,
    breakEvenTradingVolume: 55724226,
    revenuePerTotalClientFlow: 0.00269,
    netProfitPerTradingVolume: -0.1288,
    assetValuationDiff: 26350,
    assetValuationRatio: 0.01395,
  },
  {
    month: "Dec-25",
    grossMarginPct: 88.62,
    netMarginPct: -1048.17,
    assetCoverageRatio: 1.57,
    liquidityBuffer: 695498,
    fiatDepositWithdrawalRatio: 1.395,
    vaDepositWithdrawalRatio: 0.82,
    netFiatFlow: 971872,
    netVAFlow: -608911,
    tradingVolumePerTotalDeposits: 0.934,
    netFlowPerTradingVolume: 0.063,
    revenuePerTradingVolume: 0.00538,
    breakEvenTradingVolume: 65890012,
    revenuePerTotalClientFlow: 0.00259,
    netProfitPerTradingVolume: -0.05639,
    assetValuationDiff: 26350,
    assetValuationRatio: 0.01395,
  },
  {
    month: "Jan-26",
    grossMarginPct: 98.04,
    netMarginPct: -51.16,
    assetCoverageRatio: 2.310,
    liquidityBuffer: 1200962,
    fiatDepositWithdrawalRatio: 0.114,
    vaDepositWithdrawalRatio: 8.782,
    netFiatFlow: -124595422,
    netVAFlow: 124761573,
    tradingVolumePerTotalDeposits: 0.996,
    netFlowPerTradingVolume: 0.001,
    revenuePerTradingVolume: 0.00150,
    breakEvenTradingVolume: 233170984,
    revenuePerTotalClientFlow: 0.00075,
    netProfitPerTradingVolume: -0.00077,
    assetValuationDiff: 228429.50,
    assetValuationRatio: 0.12090,
  },
  {
    month: "Feb-26",
    grossMarginPct: 9.36,
    netMarginPct: -894.27,
    assetCoverageRatio: 0.9015,
    liquidityBuffer: -201764,
    fiatDepositWithdrawalRatio: 1.14313,
    vaDepositWithdrawalRatio: 0.95249,
    netFiatFlow: 2300337,
    netVAFlow: -1019531,
    tradingVolumePerTotalDeposits: 0.90687,
    netFlowPerTradingVolume: 0.03639,
    revenuePerTradingVolume: 0.00184,
    breakEvenTradingVolume: 346667362.47,
    revenuePerTotalClientFlow: 0.00085,
    netProfitPerTradingVolume: -0.01644,
    assetValuationDiff: -42586,
    assetValuationRatio: -0.02254,
  },
];

// Full P&L by month (Jan 2025 - Jan 2026)
export const plMonths = ["Jan-25","Feb-25","Mar-25","Apr-25","May-25","Jun-25","Jul-25","Aug-25","Sep-25","Oct-25","Nov-25","Dec-25","Jan-26","Feb-26"];

export interface PLLineItem {
  label: string;
  values: number[]; // 13 months
  total: number;
  isHeader?: boolean;
  isTotal?: boolean;
  indent?: boolean;
}

export const plData: PLLineItem[] = [
  { label: "Income", values: [], total: 0, isHeader: true },
  { label: "Revenue – Conversion Fees", values: [0,0,0,0,0,136.48,5431.33,37060.52,46088.98,27404.92,12744.78,27156,229289.65,58736.45], total: 444049.11, indent: true },
  { label: "Revenue – Withdrawal Fees", values: [0,0,0,477,182.43,60,1051.52,88.81,1896.68,1351.07,2949.95,4024,4651,5977.14], total: 22709.60, indent: true },
  { label: "Total Income", values: [0,0,0,477,182.43,196.48,6482.85,37149.33,47985.66,28755.99,15694.73,31180,233940.65,64713.59], total: 466758.71, isTotal: true },
  { label: "Cost of Sales", values: [], total: 0, isHeader: true },
  { label: "Cost of goods sold", values: [0,0,0,0,573.87,267.90,1788.08,2407.76,2497.94,2459.54,2346.80,3549.65,4588.18,6059.34], total: 26539.06, indent: true },
  { label: "Total Cost of Sales", values: [0,0,0,0,573.87,267.90,1788.08,2407.76,2497.94,2459.54,2346.80,3549.65,4588.18,6059.34], total: 26539.06, isTotal: true },
  { label: "Gross Profit", values: [0,0,0,477,-391.44,-71.42,4694.77,34741.57,45487.72,26296.45,13347.93,27630.35,229352.47,58654.25], total: 440219.65, isTotal: true },
  { label: "Other Income", values: [], total: 0, isHeader: true },
  { label: "Other operating income", values: [0,0,0,0,0,0,0,0,0,0,1800,0,0,0], total: 1800, indent: true },
  { label: "Paid up capital - Interest income", values: [0,0,0,0,0,0,0,0,0,31493.74,0,0,0,0], total: 31493.74, indent: true },
  { label: "Total Other Income", values: [0,0,0,0,0,0,0,0,0,31493.74,1801,0,0,0], total: 33294.74, isTotal: true },
  { label: "Expenses", values: [], total: 0, isHeader: true },
  { label: "Audit Fees", values: [0,0,0,0,0,0,0,0,8716.25,0,8717.17,0,13990.46,0], total: 31423.88, indent: true },
  { label: "Bank charges", values: [136.50,12.60,743.85,737.88,2000,2000,596.84,1885,1100,522,145,37475.50,440.33,240.74], total: 48036.24, indent: true },
  { label: "Cleaning Expenses", values: [0,1750,3500,1750,1750,0,0,0,0,0,0,0,0,0], total: 8750, indent: true },
  { label: "CMA maintenance fee", values: [0,0,0,0,0,0,2000,2000,2000,2000,2000,2000,2000,2000], total: 16000, indent: true },
  { label: "Compliance Expenses", values: [0,0,60312.17,28679.93,28679.93,15268.59,10962.22,6638.22,16174.97,16174.99,16174.97,16174.97,16174.97,16174.99], total: 247590.92, indent: true },
  { label: "Consulting Expenses", values: [0,0,64268.76,27543.75,0,0,0,0,21763.79,350,0,0,0,33334.85], total: 147261.15, indent: true },
  { label: "Custodial Service Fees", values: [0,0,12037.63,12037.63,12037.63,16373.23,16373.23,18795.06,16373.23,16373.23,16373.23,16373.23,16373.23,16373.23], total: 185893.79, indent: true },
  { label: "DED License expenses", values: [3064.94,2814.94,2814.94,2814.94,2852.41,2852.41,2852.41,2852.41,2852.41,2852.41,2852.41,2852.41,2852.41,2852.41], total: 40033.86, indent: true },
  { label: "Depreciation", values: [28928.78,28928.78,28928.78,28928.78,29418.51,29418.51,29478.03,29478.03,29478.03,29230.89,29483.28,29483.28,29483.28,29483.64], total: 410150.60, indent: true },
  { label: "Electricity & water", values: [930,703.05,609.63,536.19,743.48,845.24,476.51,536.88,534.56,554.12,495,517.98,441.74,447.24], total: 8371.62, indent: true },
  { label: "Exhibition Expenses", values: [0,0,0,11064.60,3410,0,0,0,0,0,0,0,0,0], total: 14474.60, indent: true },
  { label: "Gratuity - End of service", values: [0,0,0,0,0,7180,0,0,0,0,1684,0,0,55232], total: 64096, indent: true },
  { label: "Insurance - Medical", values: [1010,0,0,0,0,1274.52,215,0,0,0,0,0,0,0], total: 2499.52, indent: true },
  { label: "Leave salary", values: [0,0,0,0,0,7100,10000,0,0,0,0,1583,0,129317], total: 148000, indent: true },
  { label: "Marketing & Domain Expenses", values: [2117,1470,0,570.38,7045,6806.43,11750,5056,7713.49,24490,25435,21500,7174.98,10018.49], total: 131146.77, indent: true },
  { label: "Medical expenses", values: [199.89,199.89,199.89,199.89,770.99,0,0,943.16,1396.50,5725.48,1403.48,1403.48,1403.48,1403.48], total: 15249.61, indent: true },
  { label: "Office expenses", values: [468.25,1044.50,900.61,552.79,2219.70,1497.37,943.93,1375.48,453,2600,803,851.59,4275.05,319.95], total: 18305.22, indent: true },
  { label: "Parking Expenses", values: [1914.88,1939.88,1914.88,1919.64,1914.88,1914.88,1914.88,1914.88,1914.88,1914.88,1914.88,1914.88,1914.88,1914.88], total: 26838.08, indent: true },
  { label: "Payroll Expenses", values: [78150,104330,119000,113740,124589,131685,130550,120550,131550,130550,152550,152068,149550,73631], total: 1712493, indent: true },
  { label: "Platform expenses", values: [0,0,78430.26,53438.50,15909.45,25707.50,0,0,31900.08,245,250,0,5508.75,0], total: 211389.54, indent: true },
  { label: "Realized Gain/Loss on Crypto", values: [0,0,0,0,0,0,0,2334.90,8019.13,-894.39,0,3612.47,0,0], total: 13072.11, indent: true },
  { label: "Rent or lease payments", values: [41044.05,41044.05,41044.05,41044.05,41044.05,41044.05,41044.05,41044.05,41044.05,41057.73,41057.73,40175.65,41057.73,41057.73], total: 573803.02, indent: true },
  { label: "Liquidity provider fees", values: [0,0,0,0,0,0,949.05,5049.64,110.10,0,0,0,754,116], total: 6978.79, indent: true },
  { label: "Software Expenses", values: [9232.45,8742.45,8742.45,0,4616.32,405.50,1290.24,1290.24,1290.24,2187.57,2922.39,2922.39,5851.44,149822.39], total: 199316.07, indent: true },
  { label: "Technology & Network", values: [21767.92,75,54430.34,62802.43,25771.62,24287.32,57366.52,19073.34,330.34,7163.36,13845.98,15548.38,17619.25,15871.81], total: 335953.61, indent: true },
  { label: "Transaction monitoring", values: [0,0,0,0,0,5366.66,5366.66,5366.66,5366.66,5366.66,5366.66,5366.66,5366.66,5366.66], total: 48299.94, indent: true },
  { label: "Travel expenses", values: [0,0,0,140,145,1050,4670,4355,350,4550,790,0,350,0], total: 16400, indent: true },
  { label: "VARA License expenses", values: [0,12503.33,12503.33,16670.83,20838.33,20838.33,20838.33,20838.33,20838.33,20838.33,35629.91,20838.33,20838.33,8335], total: 252349.04, indent: true },
  { label: "Visa Expenses", values: [1920.36,2387.36,1594.36,1594.36,1672.13,1893.96,2065.30,2065.30,2065.30,2055.88,2055.88,2055.88,2293.11,2062.95], total: 27782.13, indent: true },
  { label: "Wi-Fi & Mobile", values: [5554.50,231,3562.99,5885.78,0,2902.87,3054.08,3137.14,3489.35,3129.39,3318.65,3296.57,3292.47,3475.22], total: 44330.01, indent: true },
  { label: "Other small expenses", values: [493.69,2385.19,1140.34,1079.07,2138.71,2425.43,2078.91,1497.00,2538.09,2268.25,2020.00,1597.98,2275.05,38524], total: 62461.71, indent: true },
  { label: "Total Expenses", values: [197934.21,210562.73,496681.06,412711.63,332826.14,368338.80,354788.19,297962.72,356824.69,319163.78,365286.62,378032.63,349032.55,637363.66], total: 5077509.41, isTotal: true },
  { label: "Net Earnings", values: [-197934.21,-210562.73,-496681.06,-412234.63,-333217.58,-368410.22,-350093.42,-263221.15,-311336.97,-261373.59,-350137.69,-350402.28,-119680.08,-578709.41], total: -4603995.02, isTotal: true },
];

// Balance Sheet as of Feb 28, 2026
export const balanceSheet: MkxBalanceSheetItem[] = [
  { label: "Assets", value: 0, isSectionHeader: true },
  { label: "Current Assets", value: 0, isSectionHeader: true, indent: 1 },
  { label: "Client Money Account - Zand Bank", value: 1911111.16, indent: 2 },
  { label: "Mashreq Account - AED", value: 96286.75, indent: 2 },
  { label: "UTGL Card", value: 30.27, indent: 2 },
  { label: "Zand Bank", value: 92628.15, indent: 2 },
  { label: "Client VA assets stored in cold wallets", value: 128144.36, indent: 2 },
  { label: "Prepaid Custodial Service expenses", value: 49119.69, indent: 2 },
  { label: "Prepaid DED License fee", value: 5704.90, indent: 2 },
  { label: "Prepaid Employees Visa Expenses", value: 25357.06, indent: 2 },
  { label: "Prepaid Exhibition expenses", value: 15567.04, indent: 2 },
  { label: "Prepaid expenses - Medical Insurance", value: 7610.94, indent: 2 },
  { label: "Prepaid Parking fee", value: 5825.44, indent: 2 },
  { label: "Prepaid Rent Expenses", value: 181893.56, indent: 2 },
  { label: "Prepaid Software Expenses", value: 16915.34, indent: 2 },
  { label: "Prepaid Transaction monitoring expenses", value: 16100.06, indent: 2 },
  { label: "Prepaid VARA license expenses", value: 12502.62, indent: 2 },
  { label: "VA Asset Holdings (Fireblocks)", value: 1856037, indent: 2 },
  { label: "Total Current Assets", value: 4420834.34, isTotal: true, indent: 1 },
  { label: "Long-term Assets", value: 0, isSectionHeader: true, indent: 1 },
  { label: "Machinery & Equipment (Net)", value: 24809.59, indent: 2 },
  { label: "Office Renovation (Net)", value: 80243.23, indent: 2 },
  { label: "PPE-Software (Net)", value: 20340.40, indent: 2 },
  { label: "Paid Up Capital - Zand Bank", value: 739579, indent: 2 },
  { label: "Rental Security Deposit", value: 53070, indent: 2 },
  { label: "Total Long-term Assets", value: 918042.22, isTotal: true, indent: 1 },
  { label: "Total Assets", value: 5338876.56, isTotal: true },
  { label: "Liabilities & Shareholders' Equity", value: 0, isSectionHeader: true },
  { label: "Current Liabilities", value: 0, isSectionHeader: true, indent: 1 },
  { label: "Accounts Payable", value: 98439.89, indent: 2 },
  { label: "Fiat - Due to Customers", value: 429337.63, indent: 2 },
  { label: "Payroll Staff Payable", value: 363864.01, indent: 2 },
  { label: "VAT Control", value: -111961.07, indent: 2 },
  { label: "Virtual Assets - Due to Customers", value: 1619190.23, indent: 2 },
  { label: "Total Current Liabilities", value: 2398870.69, isTotal: true, indent: 1 },
  { label: "Shareholders' Equity", value: 0, isSectionHeader: true, indent: 1 },
  { label: "Net Income", value: -698389.49, indent: 2 },
  { label: "Retained Earnings", value: -7261014.27, indent: 2 },
  { label: "Share Capital - Mr. Ahmad", value: 5329871.48, indent: 2 },
  { label: "Share Capital - Mrs. Maria", value: 5573974.65, indent: 2 },
  { label: "Total Share Capital", value: 10903846.13, isTotal: true, indent: 2 },
  { label: "Total Shareholders' Equity", value: 2944442.37, isTotal: true, indent: 1 },
  { label: "Total Liabilities & Equity", value: 5343313.06, isTotal: true },
];

// Summary / averages
export const mkxSummary = {
  totalRevenue: monthlyData.reduce((s, m) => s + m.revenue, 0),
  totalGrossProfit: monthlyData.reduce((s, m) => s + m.grossProfit, 0),
  totalNetProfit: monthlyData.reduce((s, m) => s + m.netProfit, 0),
  totalExpenses: monthlyData.reduce((s, m) => s + m.totalExpenses, 0),
  avgRevenue: monthlyData.reduce((s, m) => s + m.revenue, 0) / monthlyData.length,
  avgGrossProfit: monthlyData.reduce((s, m) => s + m.grossProfit, 0) / monthlyData.length,
  avgNetProfit: monthlyData.reduce((s, m) => s + m.netProfit, 0) / monthlyData.length,
  avgTradingVolume: monthlyData.reduce((s, m) => s + m.tradingVolume, 0) / monthlyData.length,
  avgLiquidityBuffer: kpiData.reduce((s, k) => s + k.liquidityBuffer, 0) / kpiData.length,
  latestAssetMarketValue: monthlyData[monthlyData.length - 1].assetMarketValue,
  latestAssetBookValue: monthlyData[monthlyData.length - 1].assetBookValue,
  latestAssetCoverage: kpiData[kpiData.length - 1].assetCoverageRatio,
  totalTradingVolume: monthlyData.reduce((s, m) => s + m.tradingVolume, 0),
  // Full year P&L totals
  fullYearNetEarnings: -4603995.02,
  fullYearTotalIncome: 466758.71,
  fullYearTotalExpenses: 5077509.41,
  fullYearGrossProfit: 440219.65,
  totalAssets: 5343313.06,
  totalLiabilities: 2398870.69,
  totalEquity: 2944442.37,
};

export const formatAED = (value: number): string => {
  const abs = Math.abs(value);
  const formatted =
    abs >= 1_000_000
      ? `${(abs / 1_000_000).toFixed(2)}M`
      : abs >= 1_000
      ? `${(abs / 1_000).toFixed(1)}K`
      : abs.toFixed(0);
  return `${value < 0 ? "-" : ""}AED ${formatted}`;
};

export const formatAEDFull = (value: number): string => {
  return `${value < 0 ? "-" : ""}AED ${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};
