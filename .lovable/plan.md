

## Plan: Add Month Selection Dropdown to All Dashboards

### Overview
Add a month/period dropdown filter to each dashboard so users can view data for a specific month (or "All Time"). This will make dashboards shorter and more focused, showing only the selected period's data while keeping cumulative/YTD totals accessible.

### Dashboards and Their Monthly Data

| Dashboard | Monthly Data Available | Filter Behavior |
|-----------|----------------------|-----------------|
| **OTC Trading** | 16 months (Jan-Dec 2024 through Mar 2026) | Filter P&L table, charts, recalculate summary cards for selected month |
| **MK Auto Garage** | 16 months (Nov 24 through Feb 26) | Filter P&L rows, update summary cards, charts show selected month |
| **MKX Crypto** | Monthly data columns (Jan 25 - Mar 26) | Filter to selected month's P&L, KPIs, balance sheet |
| **MK Autos Cars** | 28 months of income data (Dec 23 - Mar 26) | Filter monthly income table/chart to selected month |
| **RYA Gold** | Already has date range filters | Add a quick month preset dropdown alongside existing date pickers |

### Implementation

**1. Create a shared `MonthFilter` component** (`src/components/MonthFilter.tsx`)
- A `Select` dropdown with options: "All Time" + each available month
- Accepts `months: string[]` and `onChange` callback
- Consistent styling across all dashboards, placed in each dashboard's header area

**2. Update each dashboard:**

- **OTC Dashboard**: Add state for selected month. When a month is selected, show only that month's row in the P&L table, update summary cards (gross profit, net profit, expenses) to show that month's figures, and highlight the selected bar in charts.

- **Garage Dashboard**: Same pattern -- filter `monthlyPL` array to selected month, recalculate summary totals. Balance sheet remains static (point-in-time).

- **MKX Dashboard**: Filter the columnar P&L data to show only the selected month's column, update KPI cards to that month's metrics.

- **MK Autos Cars**: Filter `monthlyIncome` to selected month, update the income chart. Vehicle-level summary data (ROI, NBV) stays static as it's cumulative.

- **RYA Gold**: Add a month preset dropdown that auto-sets the existing date range filters to the first/last day of the selected month.

**3. UX Details:**
- Default selection: "All Time" (current behavior, nothing changes)
- Dropdown placed in the header bar next to the back button
- When a specific month is selected, summary cards show that month's numbers with a small "Monthly" label
- Charts either highlight the selected month or show only that month's data

### Technical Details
- Reusable `MonthFilter` component using existing `Select` UI component
- Each dashboard extracts its unique month list from its data source
- `useMemo` for filtered data to avoid unnecessary recalculations
- No data structure changes needed -- all filtering happens at the component level

### Files to Create/Modify
- **Create**: `src/components/MonthFilter.tsx`
- **Modify**: `src/pages/OtcDashboard.tsx`, `src/pages/GarageDashboard.tsx`, `src/pages/MkxDashboard.tsx`, `src/pages/MkAutosCarsDashboard.tsx`, `src/pages/RyaDashboard.tsx`

