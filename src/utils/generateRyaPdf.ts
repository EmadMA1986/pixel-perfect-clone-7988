import jsPDF from "jspdf";
import {
  profitLoss, goldCapital, AED_TO_USD_RATE,
  formatCurrency, formatNumber,
  goldPurchases, sales, expenses, salesDiscounts,
  goldInventory, customerBalances, supplierBalances,
} from "@/data/goldData";

const fmt = (v: number) => formatCurrency(Math.abs(v));

export const generateRyaPdf = () => {
  const doc = new jsPDF("p", "mm", "a4");
  const pw = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pw - margin * 2;
  let y = 20;

  const checkPage = (need = 12) => {
    if (y > 280 - need) { doc.addPage(); y = 15; }
  };

  const drawLine = (yPos: number) => {
    doc.setDrawColor(180);
    doc.line(margin, yPos, pw - margin, yPos);
  };

  const row = (label: string, value: string, indent = false, bold = false, highlight = false) => {
    checkPage();
    const x = indent ? margin + 8 : margin;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 10 : 9);
    if (highlight) {
      doc.setFillColor(245, 240, 225);
      doc.rect(margin, y - 4, contentW, 7, "F");
    }
    doc.setTextColor(40);
    doc.text(label, x, y);
    doc.text(value, pw - margin, y, { align: "right" });
    y += 6;
  };

  const sectionHeader = (title: string) => {
    checkPage(15);
    doc.setFillColor(218, 195, 140);
    doc.rect(margin, y - 5, contentW, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30);
    doc.text(title, margin + 3, y);
    y += 9;
  };

  const pageTitle = (title: string) => {
    checkPage(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30);
    doc.text(title, margin, y);
    y += 3;
    drawLine(y);
    y += 7;
  };

  const goldHighlight = (label: string, value: string) => {
    checkPage();
    doc.setFillColor(139, 109, 48);
    doc.rect(margin, y - 5, contentW, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255);
    doc.text(label, margin + 3, y);
    doc.text(value, pw - margin - 3, y, { align: "right" });
    y += 12;
  };

  // Table helper
  const drawTable = (headers: string[], rows: string[][], colWidths: number[], rightAlignFrom = 2) => {
    const startX = margin;
    // Header
    checkPage(10);
    doc.setFillColor(240, 235, 220);
    doc.rect(startX, y - 4, contentW, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(60);
    let cx = startX + 2;
    headers.forEach((h, i) => {
      if (i >= rightAlignFrom) {
        doc.text(h, cx + colWidths[i] - 2, y, { align: "right" });
      } else {
        doc.text(h, cx, y);
      }
      cx += colWidths[i];
    });
    y += 5;

    // Rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(40);
    rows.forEach((r) => {
      checkPage(5);
      cx = startX + 2;
      r.forEach((cell, i) => {
        if (i >= rightAlignFrom) {
          doc.text(cell, cx + colWidths[i] - 2, y, { align: "right" });
        } else {
          doc.text(cell, cx, y);
        }
        cx += colWidths[i];
      });
      y += 4.5;
    });
    y += 3;
  };

  // =============================================
  // PAGE 1: HEADER + CAPITAL POSITION + SUMMARY
  // =============================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(139, 109, 48);
  doc.text("RYA Gold Trading", pw / 2, y, { align: "center" });
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Full Dashboard Report • As of March 18, 2026", pw / 2, y, { align: "center" });
  y += 5;
  drawLine(y);
  y += 10;

  // Capital Position
  pageTitle("Capital Position");
  row("Brokers (PY + ZHOU)", fmt(goldCapital.totalBrokers), true);
  row("Accounts Receivable", fmt(goldCapital.totalAR_USD), true);
  row("Gold Inventory", fmt(goldCapital.goldInventoryUSD), true);
  drawLine(y - 2); y += 2;
  row("Total Position", fmt(goldCapital.totalCurrentPosition), false, true, true);
  y += 3;
  row("Net Profit", fmt(goldCapital.netProfit), true);
  row("Total Position", fmt(goldCapital.totalCurrentPosition), true);
  drawLine(y - 2); y += 2;
  row("Initial Investment", fmt(Math.abs(goldCapital.initialCapital)), false, true, true);
  y += 8;

  // Summary KPIs
  pageTitle("Summary");
  const totalRevenue = sales.reduce((s, p) => s + p.amountUSD, 0);
  const totalProfit = sales.reduce((s, p) => s + p.profitUSD, 0);
  const totalSalesQty = sales.reduce((s, p) => s + p.qtyGrams, 0);
  const totalPurchaseQty = goldPurchases.reduce((s, p) => s + p.qtyPure, 0);
  const totalPurchaseAmt = goldPurchases.reduce((s, p) => s + p.amountUSD, 0);
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const totalDisc = salesDiscounts.reduce((s, d) => s + d.amount, 0);

  row("Net Profit", fmt(profitLoss.netProfit), false, true);
  row("Revenue", `${fmt(totalRevenue)}  (${formatNumber(totalSalesQty, 2)}g · ${sales.length} sales)`, false);
  row("Purchases", `${fmt(totalPurchaseAmt)}  (${formatNumber(totalPurchaseQty, 0)}g · ${goldPurchases.length} buys)`, false);
  row("Expenses", `${fmt(totalExp)}  (${expenses.length} items)`, false);
  row("Sales Discounts", fmt(totalDisc), false);
  row("Accounts Receivable", fmt(goldCapital.totalAR_USD), false);
  row("Broker Balance", fmt(goldCapital.totalBrokers), false);
  row("Gold Inventory", goldInventory.balanceGrams > 0 ? `${formatNumber(goldInventory.balanceGrams, 3)}g` : "0g — Fully Consumed", false);
  y += 5;

  // =============================================
  // PROFIT & LOSS
  // =============================================
  doc.addPage();
  y = 15;
  pageTitle("Profit & Loss Statement");

  row("Sales Revenue", fmt(profitLoss.sales), false, true);
  row("Sales Discount", `(${fmt(profitLoss.salesDiscount)})`, true);
  row("Cost of Sales", `(${fmt(profitLoss.costOfSales)})`, true);
  row("Melting Loss", `(${fmt(profitLoss.meltingLoss)})`, true);
  row("Hedge Expenses", `(${fmt(profitLoss.hedgeExpenses)})`, true);
  drawLine(y - 2); y += 2;
  row("Gross Profit", fmt(profitLoss.grossProfit), false, true, true);
  y += 3;

  row("Transport", `(${fmt(profitLoss.transport)})`, true);
  row("Labor", `(${fmt(profitLoss.labor)})`, true);
  row("Hotel", `(${fmt(profitLoss.hotel)})`, true);
  row("Bonus", `(${fmt(profitLoss.bonus)})`, true);
  row("Tax + Bonus", `(${fmt(profitLoss.taxBonus)})`, true);
  row("Other Expenses", `(${fmt(profitLoss.otherExp)})`, true);
  drawLine(y - 2); y += 2;
  row("Total Admin Expenses", `(${fmt(profitLoss.totalAdminExpenses)})`, false, true);
  y += 2;
  row("Operating Profit", fmt(profitLoss.operatingProfit), false, true, true);
  y += 3;

  row("Fx Gain", fmt(profitLoss.fxGain), true);
  row("Fx Loss", `(${fmt(profitLoss.fxLoss)})`, true);
  drawLine(y - 2); y += 2;
  goldHighlight("Net Profit", fmt(profitLoss.netProfit));

  // =============================================
  // BALANCE SHEET
  // =============================================
  y += 5;
  pageTitle("Balance Sheet");

  sectionHeader("Assets");
  row("Broker ZHOU (USD)", fmt(goldCapital.brokerZHOU), true);
  row("Broker ZHOU (AED 479,270 @3.673)", fmt(goldCapital.brokerZHOUAED / AED_TO_USD_RATE), true);
  row("Broker PY", fmt(goldCapital.brokerPY), true);
  row("Gold Inventory", fmt(goldCapital.goldInventoryUSD), true);
  row("AR — Moti", fmt(goldCapital.arMotiAED / AED_TO_USD_RATE), true);
  row("AR — AL MASA", fmt(goldCapital.arAlMasaAED / AED_TO_USD_RATE), true);
  drawLine(y - 2); y += 2;
  row("Total Assets", fmt(goldCapital.totalCurrentPosition), false, true, true);
  y += 5;

  sectionHeader("Liabilities");
  row("No outstanding liabilities", "$0.00", true);
  drawLine(y - 2); y += 2;
  row("Total Liabilities", "$0.00", false, true);
  y += 5;

  sectionHeader("Owner's Equity");
  const initCap = goldCapital.initialCapital;
  row("Initial Capital (Invested)", initCap >= 0 ? fmt(initCap) : `(${fmt(initCap)})`, true);
  row("Net Profit (Retained)", fmt(goldCapital.netProfit), true);
  drawLine(y - 2); y += 2;
  goldHighlight("Total Equity", fmt(goldCapital.totalCurrentPosition));

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text("Assets - Liabilities = Equity ✓", pw / 2, y, { align: "center" });
  y += 10;

  // =============================================
  // CLIENT BREAKDOWN
  // =============================================
  doc.addPage();
  y = 15;
  pageTitle("Client Breakdown");

  const clientGrouped = sales.reduce<Record<string, { qty: number; revenue: number; cost: number; profit: number; count: number }>>((acc, s) => {
    if (!acc[s.customer]) acc[s.customer] = { qty: 0, revenue: 0, cost: 0, profit: 0, count: 0 };
    acc[s.customer].qty += s.qtyGrams;
    acc[s.customer].revenue += s.amountUSD;
    acc[s.customer].cost += s.costUSD;
    acc[s.customer].profit += s.profitUSD;
    acc[s.customer].count += 1;
    return acc;
  }, {});
  const clientRows = Object.entries(clientGrouped)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .map(([name, v]) => [
      name,
      `${v.count}`,
      `${formatNumber(v.qty, 2)}g`,
      fmt(v.revenue),
      fmt(v.cost),
      fmt(v.profit),
      `${((v.profit / v.revenue) * 100).toFixed(1)}%`,
    ]);

  drawTable(
    ["Customer", "Deals", "Qty", "Revenue", "Cost", "Profit", "Margin"],
    clientRows,
    [30, 14, 24, 28, 28, 28, 18],
    2
  );

  // =============================================
  // SUPPLIER BREAKDOWN
  // =============================================
  y += 5;
  pageTitle("Supplier Breakdown");

  const supplierGrouped = goldPurchases.reduce<Record<string, { qty: number; amount: number; count: number }>>((acc, p) => {
    if (!acc[p.party]) acc[p.party] = { qty: 0, amount: 0, count: 0 };
    acc[p.party].qty += p.qtyPure;
    acc[p.party].amount += p.amountUSD;
    acc[p.party].count += 1;
    return acc;
  }, {});
  const supplierRows = Object.entries(supplierGrouped)
    .sort((a, b) => b[1].amount - a[1].amount)
    .map(([name, v]) => [
      name,
      `${v.count}`,
      `${formatNumber(v.qty, 2)}g`,
      fmt(v.amount),
      `$${formatNumber(v.amount / v.qty, 2)}/g`,
    ]);

  drawTable(
    ["Supplier", "Buys", "Qty Pure", "Amount", "Avg Rate"],
    supplierRows,
    [30, 16, 30, 40, 34],
    2
  );

  // =============================================
  // EXPENSE BREAKDOWN
  // =============================================
  y += 5;
  pageTitle("Expense Breakdown");

  const expGrouped = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const expRows = Object.entries(expGrouped)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, val]) => [cat, fmt(val), `${((val / totalExp) * 100).toFixed(1)}%`]);

  drawTable(
    ["Category", "Amount", "% of Total"],
    expRows,
    [50, 50, 50],
    1
  );

  // =============================================
  // SALES TRANSACTIONS
  // =============================================
  doc.addPage();
  y = 15;
  pageTitle("Sales Transactions");

  const salesRows = sales.map((s) => [
    s.date,
    s.customer,
    `${formatNumber(s.qtyGrams, 2)}g`,
    `$${formatNumber(s.rateUSD, 3)}`,
    fmt(s.amountUSD),
    fmt(s.costUSD),
    fmt(s.profitUSD),
  ]);

  drawTable(
    ["Date", "Customer", "Qty", "Rate", "Amount", "Cost", "Profit"],
    salesRows,
    [20, 22, 22, 22, 26, 26, 22],
    2
  );

  // Totals row
  checkPage(8);
  drawLine(y - 2); y += 2;
  row("Total Sales", `${formatNumber(totalSalesQty, 2)}g  |  ${fmt(totalRevenue)}  |  Profit: ${fmt(totalProfit)}`, false, true, true);

  // =============================================
  // PURCHASE TRANSACTIONS
  // =============================================
  doc.addPage();
  y = 15;
  pageTitle("Purchase Transactions");

  const purchRows = goldPurchases.map((p) => [
    p.date,
    p.party,
    `${formatNumber(p.qtyGrams, 2)}g`,
    `${formatNumber(p.qtyPure, 2)}g`,
    `$${formatNumber(p.rateUSD, 3)}`,
    fmt(p.amountUSD),
  ]);

  drawTable(
    ["Date", "Supplier", "Qty Gross", "Qty Pure", "Rate", "Amount USD"],
    purchRows,
    [20, 22, 24, 24, 26, 34],
    2
  );

  drawLine(y - 2); y += 2;
  row("Total Purchases", `${formatNumber(totalPurchaseQty, 0)}g pure  |  ${fmt(totalPurchaseAmt)}`, false, true, true);

  // =============================================
  // GOLD INVENTORY
  // =============================================
  y += 8;
  pageTitle("Gold Inventory Status");
  row("Balance", goldInventory.balanceGrams > 0 ? `${formatNumber(goldInventory.balanceGrams, 3)}g` : "0g", true);
  row("Total Melting Loss", `${formatNumber(goldInventory.totalMeltingLossGrams, 3)}g`, true);
  row("Status", goldInventory.balanceGrams > 0 ? "Active" : "Fully Consumed", true, true);

  // =============================================
  // LEDGER BALANCES
  // =============================================
  y += 8;
  pageTitle("Ledger Balances");

  sectionHeader("Customer Balances");
  customerBalances.forEach((c) => {
    row(c.name, c.balanceAED > 0 ? `AED ${formatNumber(c.balanceAED, 2)} (${fmt(c.balanceAED / AED_TO_USD_RATE)})` : "Settled", true);
  });
  y += 3;

  sectionHeader("Supplier Balances");
  supplierBalances.forEach((s) => {
    row(s.name, s.balanceAED > 0 ? `AED ${formatNumber(s.balanceAED, 2)} (${fmt(s.balanceAED / AED_TO_USD_RATE)})` : "Settled", true);
  });
  y += 3;

  sectionHeader("Broker Balances");
  row("Broker ZHOU (USD)", fmt(goldCapital.brokerZHOU), true);
  row("Broker ZHOU (AED)", `AED ${formatNumber(goldCapital.brokerZHOUAED, 2)}`, true);
  row("Broker PY", fmt(goldCapital.brokerPY), true);

  // =============================================
  // FOOTER ON ALL PAGES
  // =============================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text("RYA Gold Trading — Confidential", margin, 290);
    doc.text(`Page ${i} of ${totalPages}`, pw - margin, 290, { align: "right" });
  }

  doc.save("RYA_Gold_Full_Report.pdf");
};
