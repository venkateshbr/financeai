
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Activity } from "lucide-react";
import { StatsCard } from "@/components/common/StatsCard";
import { useEffect, useState } from "react";
import { RevenueChart } from "./RevenueChart";

interface PnLData {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
}

export function BusinessOverview() {
    const [data, setData] = useState<PnLData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        checkConnection();
    }, []);

    const [chartData, setChartData] = useState<any[]>([]);
    const [orgName, setOrgName] = useState<string>("");

    const checkConnection = async () => {
        try {
            const res = await fetch('/api/xero/connected');
            if (res.ok) {
                const json = await res.json();
                setConnected(json.connected);
                if (json.connected) {
                    fetchData();
                } else {
                    setLoading(false);
                }
            }
        } catch (err) {
            console.error("Failed to check connection", err);
            setLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            const res = await fetch('/api/xero/overview');
            if (!res.ok) throw new Error("Failed to fetch data");
            const json = await res.json();

            console.log("Xero Data Received:", json);
            setOrgName(json.organisationName || "Xero Connected");

            // --- 1. Yearly Stats Parsing (Last Calendar Year) ---
            const plYear = json.profitAndLossYear || {};
            // Check if it's a wrapper { Reports: [] } or the Report itself { Rows: [] }
            // API behavior can vary, so we normalize.
            let yearRows: any[] = [];
            if (plYear.rows || plYear.Rows) {
                yearRows = plYear.rows || plYear.Rows; // Direct object
            } else if ((plYear.reports || plYear.Reports) && (plYear.reports || plYear.Reports).length > 0) {
                const rep = (plYear.reports || plYear.Reports)[0];
                yearRows = rep.rows || rep.Rows || [];
            }

            console.log("Yearly Rows Found:", yearRows.length);

            if (yearRows.length > 0) {
                const incomeStr = findValueRecursively(yearRows, ["Total Income", "Total Revenue", "Income", "Revenue", "Turnover"]);
                const expenseStr = findValueRecursively(yearRows, ["Total Operating Expenses", "Operating Expenses", "Total Expenses"]);
                const profitStr = findValueRecursively(yearRows, ["Net Profit", "Net Loss", "Total Profit"]);

                setData({
                    totalIncome: parseFloat(incomeStr || "0"),
                    totalExpenses: parseFloat(expenseStr || "0"),
                    netProfit: parseFloat(profitStr || "0")
                });
            }

            // --- 2. Monthly Trend Parsing (Last 6 Months) ---
            const plMonthly = json.profitAndLossMonthly || {};
            let monthlyRows: any[] = [];

            if (plMonthly.rows || plMonthly.Rows) {
                monthlyRows = plMonthly.rows || plMonthly.Rows;
            } else if ((plMonthly.reports || plMonthly.Reports) && (plMonthly.reports || plMonthly.Reports).length > 0) {
                const rep = (plMonthly.reports || plMonthly.Reports)[0];
                monthlyRows = rep.rows || rep.Rows || [];
            }

            console.log("Monthly Rows Found:", monthlyRows.length);

            if (monthlyRows.length > 0) {
                const headerRow = findRowByTypeRecursively(monthlyRows, "Header");
                const cells = headerRow?.cells || headerRow?.Cells || [];
                // Skip first cell (Account Name)
                const periods = cells.slice(1).map((c: any) => c.value || c.Value) || [];

                // Initialize periods
                const trendData = periods.map((p: string) => ({ name: p, revenue: 0, expenses: 0 }));

                // Find Income Row (Array of values)
                const incomeValues = findValuesRowRecursively(monthlyRows, ["Total Income", "Total Revenue", "Income"]);
                if (incomeValues) {
                    incomeValues.slice(1).forEach((val: string, index: number) => {
                        if (trendData[index]) trendData[index].revenue = parseFloat(val || "0");
                    });
                }

                // Find Expense Row (Array of values)
                const expenseValues = findValuesRowRecursively(monthlyRows, ["Total Operating Expenses", "Operating Expenses"]);
                if (expenseValues) {
                    expenseValues.slice(1).forEach((val: string, index: number) => {
                        if (trendData[index]) trendData[index].expenses = parseFloat(val || "0");
                    });
                }

                setChartData(trendData.reverse());
            }

            setLoading(false);
        } catch (err) {
            console.error("Error parsing Xero data:", err);
            setError("Failed to load Xero data");
            setLoading(false);
        }
    };

    // --- Recursive Helper Functions ---

    // Finds the *first* cell value (column 1) for a given row title
    const findValueRecursively = (rows: any[], titles: string[]): string | null => {
        if (!rows || !Array.isArray(rows)) return null;

        for (const row of rows) {
            let rowTitle = row.title || row.Title || "";
            const cells = row.cells || row.Cells;

            // Xero often puts the label in the first cell for data rows
            if (cells && cells.length > 0 && (cells[0].value || cells[0].Value)) {
                const cellLabel = cells[0].value || cells[0].Value;
                // If rowTitle is empty, or just to be safe, check the cell label too
                if (!rowTitle) rowTitle = cellLabel;
                // Alternatively, check matches against cellLabel directly
                if (titles.includes(cellLabel.trim())) {
                    return cells.length > 1 ? (cells[1].value || cells[1].Value) : null;
                }
            }

            // Check match against Row Title property
            if (titles.includes(rowTitle.trim()) && cells && cells.length > 1) {
                return cells[1].value || cells[1].Value;
            }

            // Recurse into nested sections
            if (row.rows || row.Rows) {
                const found = findValueRecursively(row.rows || row.Rows, titles);
                if (found) return found;
            }
        }
        return null;
    };

    // Finds the *entire* array of cell values for a given row title
    const findValuesRowRecursively = (rows: any[], titles: string[]): string[] | null => {
        if (!rows || !Array.isArray(rows)) return null;

        for (const row of rows) {
            let rowTitle = row.title || row.Title || "";
            const cells = row.cells || row.Cells;

            // Check match against First Cell
            if (cells && cells.length > 0 && (cells[0].value || cells[0].Value)) {
                const cellLabel = cells[0].value || cells[0].Value;
                if (titles.includes(cellLabel.trim())) {
                    return cells.map((c: any) => c.value || c.Value);
                }
            }

            // Check match against Row Title property
            if (titles.includes(rowTitle.trim()) && cells) {
                return cells.map((c: any) => c.value || c.Value);
            }

            if (row.rows || row.Rows) {
                const found = findValuesRowRecursively(row.rows || row.Rows, titles);
                if (found) return found;
            }
        }
        return null;
    };

    const findRowByTypeRecursively = (rows: any[], type: string): any | null => {
        if (!rows || !Array.isArray(rows)) return null;
        for (const row of rows) {
            const rowType = row.rowType || row.RowType;
            if (rowType === type) return row;
            if (row.rows || row.Rows) {
                const found = findRowByTypeRecursively(row.rows || row.Rows, type);
                if (found) return found;
            }
        }
        return null;
    }

    if (loading) return <div className="p-4 text-center">Loading {orgName}...</div>;

    if (!connected) {
        return (
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span>Connecting to Xero...</span>
                </div>
            </div>
        );
    }

    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6 lg:col-span-4 bg-muted/20">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        Connected to: {orgName}
                    </h2>
                    <p className="text-sm text-muted-foreground">Displaying data for Demo Company (Last Calendar Year)</p>
                </div>

                <StatsCard
                    title="Total Revenue (2025)"
                    value={`$${data?.totalIncome.toLocaleString()}`}
                    trend="Annual"
                    trendUp={true}
                    icon={DollarSign}
                />
                <StatsCard
                    title="Total Expenses (2025)"
                    value={`$${data?.totalExpenses.toLocaleString()}`}
                    trend="Annual"
                    trendUp={false}
                    icon={CreditCard}
                />
                <StatsCard
                    title="Net Profit (2025)"
                    value={`$${data?.netProfit.toLocaleString()}`}
                    trend="Annual"
                    trendUp={data?.netProfit! >= 0}
                    icon={TrendingUp}
                />
            </div>

            {/* Pass chartData to the parent layout or make BusinessOverview full width? 
                Actually RevenueChart is sibling in Dashboard. We should lift state or just render it here if refactoring.
                For now, the USER requested "update the dashboard".
                I will hack this by changing `ClientDashboard` to receive data or context, 
                OR export this Chart Component here?
                Better: I will just render the chart INSIDE BusinessOverview for now to simplify data passing, 
                as the file structure is effectively coupling them. 
            */}
            <div className="grid gap-4 md:grid-cols-1">
                <RevenueChart data={chartData} />
            </div>
        </div>
    );
}
