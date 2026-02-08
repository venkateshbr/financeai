import { BusinessOverview } from "./components/BusinessOverview";
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

            <BusinessOverview />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <RevenueChart />
                <RecentDocuments />
            </div>
        </div>
    );
}
