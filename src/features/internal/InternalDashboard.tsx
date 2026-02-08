import { useEffect, useState } from 'react';
import { Users, FileText, CheckSquare, Building2 } from "lucide-react";
import { StatsCard } from "@/components/common/StatsCard";
import { Link } from "react-router-dom";

interface DashboardStats {
    tenantCount: number;
    pendingReviews: number;
    processedDocs: number;
    recentActivity: any[];
}

export default function InternalDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        tenantCount: 0,
        pendingReviews: 0,
        processedDocs: 0,
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('http://localhost:3156/api/internal/dashboard');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="p-8">Loading dashboard metrics...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Internal Dashboard</h1>
                <div className="text-sm text-muted-foreground">
                    Overview of Xero Integration
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Organizations Configured"
                    value={stats.tenantCount.toString()}
                    trend="Connected Tenants"
                    trendUp={true}
                    icon={Building2}
                />
                <StatsCard
                    title="Pending Reviews"
                    value={stats.pendingReviews.toString()}
                    trend="Invoices awaiting approval"
                    trendUp={stats.pendingReviews > 0 ? false : true} // Red if pending > 0 is arguably bad/busy, or green? Let's say false means "attention needed"
                    icon={FileText}
                    className="border-yellow-500/50 bg-yellow-500/5"
                />
                <StatsCard
                    title="Processed Docs"
                    value={stats.processedDocs.toString()}
                    trend="Authorised Invoices"
                    trendUp={true}
                    icon={CheckSquare}
                />
                {/* Placeholder for future metric */}
                <StatsCard
                    title="Active Clients"
                    value="1"
                    trend="Custom Connection"
                    trendUp={true}
                    icon={Users}
                />
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h3 className="text-lg font-medium">Recent Client Activity (Draft Invoices)</h3>
                    <Link to="/internal/reviews" className="text-sm text-primary hover:underline">View All Requests</Link>
                </div>
                <div className="p-0">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                                <th className="p-4 font-medium">Invoice #</th>
                                <th className="p-4 font-medium">Contact</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">Total</th>
                                <th className="p-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentActivity.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">No recent activity.</td>
                                </tr>
                            ) : (
                                stats.recentActivity.map((invoice: any) => (
                                    <tr key={invoice.invoiceID} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="p-4 font-medium">{invoice.invoiceNumber || invoice.reference || 'N/A'}</td>
                                        <td className="p-4">{invoice.contact?.name || 'Unknown'}</td>
                                        <td className="p-4 text-muted-foreground">{new Date(invoice.dateString || invoice.date).toLocaleDateString()}</td>
                                        <td className="p-4 font-medium">${invoice.total?.toFixed(2)}</td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-600">
                                                {invoice.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
