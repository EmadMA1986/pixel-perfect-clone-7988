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
    assetBookValue: 1940507,
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
    assetBookValue: 1940507,
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
    assetBookValue: 1940507,
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
    assetBookValue: 1940507,
    clientLiabilitiesFiat: 480777,
    clientLiabilitiesVA: 739425,
    tradingVolume: 5796181,
    clientDepositsFiat: 3429833,
    clientWithdrawalsFiat: 2457961,
    clientDepositsVA: 2777679,
    clientWithdrawalsVA: 3386590,
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
    assetValuationDiff: -34197,
    assetValuationRatio: -0.01762,
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
    assetValuationDiff: -9527,
    assetValuationRatio: -0.00491,
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
    assetValuationDiff: -24807,
    assetValuationRatio: -0.01278,
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
    assetValuationDiff: -24807,
    assetValuationRatio: -0.01278,
  },
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
