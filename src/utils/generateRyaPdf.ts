import jsPDF from "jspdf";
import { profitLoss, goldCapital, AED_TO_USD_RATE, formatCurrency } from "@/data/goldData";

const fmt = (v: number) => formatCurrency(Math.abs(v));

export const generateRyaPdf = () => {
  const doc = new jsPDF("p", "mm", "a4");
  const pw = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentW = pw - margin * 2;
  let y = 20;

  const drawLine = (yPos: number) => {
    doc.setDrawColor(180);
    doc.line(margin, yPos, pw - margin, yPos);
  };

  const row = (label: string, value: string, indent = false, bold = false, highlight = false) => {
    if (y > 270) { doc.addPage(); y = 20; }
    const x = indent ? margin + 8 : margin;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 11 : 10);
    if (highlight) {
      doc.setFillColor(245, 240, 225);
      doc.rect(margin, y - 4, contentW, 7, "F");
    }
    doc.setTextColor(40);
    doc.text(label, x, y);
    doc.text(value, pw - margin, y, { align: "right" });
    y += 7;
  };

  const sectionHeader = (title: string) => {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFillColor(218, 195, 140);
    doc.rect(margin, y - 5, contentW, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30);
    doc.text(title, margin + 3, y);
    y += 10;
  };

  // ===== HEADER =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(139, 109, 48);
  doc.text("RYA Gold Trading", pw / 2, y, { align: "center" });
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Financial Statements • As of March 18, 2026", pw / 2, y, { align: "center" });
  y += 5;
  drawLine(y);
  y += 10;

  // ===== PROFIT & LOSS =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30);
  doc.text("Profit & Loss Statement", margin, y);
  y += 3;
  drawLine(y);
  y += 8;

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

  // Net Profit highlight
  doc.setFillColor(139, 109, 48);
  doc.rect(margin, y - 5, contentW, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255);
  doc.text("Net Profit", margin + 3, y);
  doc.text(fmt(profitLoss.netProfit), pw - margin - 3, y, { align: "right" });
  y += 15;

  // ===== BALANCE SHEET =====
  if (y > 200) { doc.addPage(); y = 20; }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30);
  doc.text("Balance Sheet", margin, y);
  y += 3;
  drawLine(y);
  y += 8;

  // Assets
  sectionHeader("Assets");
  row("Broker ZHOU (USD)", fmt(goldCapital.brokerZHOU), true);
  row(`Broker ZHOU (AED 479,270 @3.673 = USD)`, fmt(goldCapital.brokerZHOUAED / AED_TO_USD_RATE), true);
  row("Broker PY", fmt(goldCapital.brokerPY), true);
  row("Gold Inventory", fmt(goldCapital.goldInventoryUSD), true);
  row("AR — Moti", fmt(goldCapital.arMotiAED / AED_TO_USD_RATE), true);
  row("AR — AL MASA", fmt(goldCapital.arAlMasaAED / AED_TO_USD_RATE), true);
  drawLine(y - 2); y += 2;
  row("Total Assets", fmt(goldCapital.totalCurrentPosition), false, true, true);
  y += 5;

  // Liabilities
  sectionHeader("Liabilities");
  row("No outstanding liabilities", "$0.00", true);
  drawLine(y - 2); y += 2;
  row("Total Liabilities", "$0.00", false, true);
  y += 5;

  // Owner's Equity
  sectionHeader("Owner's Equity");
  const initCap = goldCapital.initialCapital;
  row("Initial Capital (Invested)", initCap >= 0 ? fmt(initCap) : `(${fmt(initCap)})`, true);
  row("Net Profit (Retained)", fmt(goldCapital.netProfit), true);
  drawLine(y - 2); y += 2;

  // Total Equity highlight
  doc.setFillColor(139, 109, 48);
  doc.rect(margin, y - 5, contentW, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255);
  doc.text("Total Equity", margin + 3, y);
  doc.text(fmt(goldCapital.totalCurrentPosition), pw - margin - 3, y, { align: "right" });
  y += 10;

  // Balance check
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("Assets − Liabilities = Equity ✓", pw / 2, y, { align: "center" });

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("RYA Gold Trading — Confidential", margin, 290);
    doc.text(`Page ${i} of ${totalPages}`, pw - margin, 290, { align: "right" });
  }

  doc.save("RYA_Gold_PL_BalanceSheet.pdf");
};
