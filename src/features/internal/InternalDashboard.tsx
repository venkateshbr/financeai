import { Users, FileText, AlertTriangle, CheckSquare } from "lucide-react";
import { StatsCard } from "@/components/common/StatsCard";

export default function InternalDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Internal Dashboard</h1>
                <div className="text-sm text-muted-foreground">
                    Overview of all client activities
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Clients"
                    value="128"
                    trend="+4 this month"
                    trendUp={true}
                    icon={Users}
                />
                <StatsCard
                    title="Pending Reviews"
                    value="15"
                    trend="+5 from yesterday"
                    trendUp={false}
                    icon={FileText}
                    className="border-yellow-500/50 bg-yellow-500/5"
                />
                <StatsCard
                    title="System Alerts"
                    value="2"
                    trend="Server load high"
                    trendUp={false}
                    icon={AlertTriangle}
                    className="border-red-500/50 bg-red-500/5"
                />
                <StatsCard
                    title="Processed Docs"
                    value="1,429"
                    trend="+12% from last month"
                    trendUp={true}
                    icon={CheckSquare}
                />
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-medium">Recent Client Activity</h3>
                </div>
                <div className="p-0">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                                <th className="p-4 font-medium">Client</th>
                                <th className="p-4 font-medium">Action</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                <td className="p-4 font-medium">Acme Corp</td>
                                <td className="p-4">Uploaded 'Q3 Financials.pdf'</td>
                                <td className="p-4 text-muted-foreground">2 mins ago</td>
                                <td className="p-4"><span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-600">Pending Review</span></td>
                            </tr>
                            <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                <td className="p-4 font-medium">Globex Inc</td>
                                <td className="p-4">Updated Company Profile</td>
                                <td className="p-4 text-muted-foreground">15 mins ago</td>
                                <td className="p-4"><span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600">Active</span></td>
                            </tr>
                            <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                <td className="p-4 font-medium">Soylent Corp</td>
                                <td className="p-4">Uploaded 'Invoice #5521'</td>
                                <td className="p-4 text-muted-foreground">1 hour ago</td>
                                <td className="p-4"><span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-600">Pending Review</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
