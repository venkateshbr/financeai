import { DollarSign, TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import { StatsCard } from "@/components/common/StatsCard";
import { RevenueChart } from "./components/RevenueChart";
import { RecentDocuments } from "./components/RecentDocuments";

export default function ClientDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                <div className="text-sm text-muted-foreground">
                    Last updated: Today, 10:23 AM
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Revenue"
                    value="$45,231.89"
                    trend="+20.1% from last month"
                    trendUp={true}
                    icon={DollarSign}
                />
                <StatsCard
                    title="Expenses"
                    value="$12,345.00"
                    trend="+4.5% from last month"
                    trendUp={false}
                    icon={CreditCard}
                />
                <StatsCard
                    title="Net Profit"
                    value="$32,886.89"
                    trend="+25.3% from last month"
                    trendUp={true}
                    icon={TrendingUp}
                />
                <StatsCard
                    title="Active Projects"
                    value="12"
                    trend="-2 from last month"
                    trendUp={false}
                    icon={TrendingDown}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <RevenueChart />
                <RecentDocuments />
            </div>
        </div>
    );
}
