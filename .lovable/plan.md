
## Auto-Select Latest Month for Executive Summary

Make the MK Autos Company dashboard automatically default to the **latest available month** (Mar-26) so the Executive Summary and all KPIs render with the most recent data on load — no manual selection required.

### What changes
- On the MK Autos Company dashboard, the month filter will initialize to the most recent month from `balanceSheetSnapshots` instead of `"all"`.
- Executive Summary, KPI cards, and Financial Ratios will populate immediately with current-month vs previous-month comparison (Mar-26 vs Feb-26).
- User can still switch to "All Time" or any prior month via the existing dropdown.

### Technical details
- File: `src/pages/MkAutosCompanyDashboard.tsx`
- Change initial state: `useState<string>(balanceSheetSnapshots[balanceSheetSnapshots.length - 1].monthKey)` instead of `"all"`.
- All downstream `useMemo` blocks (`view`, `execSummary`, ratios) already react to `selectedMonth`, so no further logic changes required.
