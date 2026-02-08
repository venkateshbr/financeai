import { useEffect, useState } from "react";
import { FileText, Clock, CheckCircle, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface XeroInvoice {
    invoiceID: string;
    invoiceNumber: string;
    status: string;
    dateString: string;
    contact: { name: string };
    total: number;
}

interface AgentLog {
    id: number;
    agent_name: string;
    action: string;
    status: string;
    details: any;
    timestamp: string;
}

export function RecentDocuments({ refreshTrigger }: { refreshTrigger?: number }) {
    const [invoices, setInvoices] = useState<XeroInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);
    const [logs, setLogs] = useState<AgentLog[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    useEffect(() => {
        fetchInvoices();
    }, [refreshTrigger]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3156/api/xero/invoices');
            if (!res.ok) throw new Error("Failed to fetch documents");
            const data = await res.json();
            const sorted = data.sort((a: any, b: any) => new Date(b.dateString).getTime() - new Date(a.dateString).getTime());
            setInvoices(sorted.slice(0, 5));
        } catch (err) {
            console.error(err);
            setError("Could not load recent documents");
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = async (invoiceId: string) => {
        if (expandedInvoiceId === invoiceId) {
            setExpandedInvoiceId(null);
            setLogs([]);
            return;
        }

        setExpandedInvoiceId(invoiceId);
        setLoadingLogs(true);
        try {
            const res = await fetch(`http://localhost:3156/api/processing/logs/invoice/${invoiceId}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            } else {
                setLogs([]);
            }
        } catch (err) {
            console.error("Failed to fetch logs", err);
            setLogs([]);
        } finally {
            setLoadingLogs(false);
        }
    };

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow col-span-4 lg:col-span-1 h-full flex flex-col">
            <div className="p-6 pb-2 flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-medium">Recent Draft Invoices</h3>
                    <p className="text-sm text-muted-foreground">From Xero (ACCPAY)</p>
                </div>
                <button onClick={fetchInvoices} className="p-1 hover:bg-muted rounded text-muted-foreground" title="Refresh">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="p-4 space-y-4 flex-1 overflow-auto">
                {loading && invoices.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500 text-sm">{error}</div>
                ) : invoices.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">No draft invoices found.</div>
                ) : (
                    invoices.map((doc) => (
                        <div key={doc.invoiceID} className="rounded-lg bg-muted/30 border border-border/50 overflow-hidden">
                            <div
                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => toggleExpand(doc.invoiceID)}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-background rounded-md border border-border shrink-0">
                                        <FileText className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="space-y-0.5 min-w-0">
                                        <p className="text-sm font-medium truncate" title={doc.contact.name}>
                                            {doc.contact.name}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            {new Date(doc.dateString).toLocaleDateString()} • {doc.invoiceNumber}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-right shrink-0">
                                    <div>
                                        <span className="block text-sm font-medium">${doc.total}</span>
                                        <StatusIcon status={doc.status} />
                                    </div>
                                    {expandedInvoiceId === doc.invoiceID ? (
                                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </div>
                            </div>

                            {/* Logs Section */}
                            {expandedInvoiceId === doc.invoiceID && (
                                <div className="p-4 bg-background border-t border-border/50 text-xs animate-in slide-in-from-top-2 duration-200">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <Terminal className="w-4 h-4" /> Agent Processing Logs
                                    </h4>
                                    {loadingLogs ? (
                                        <div className="text-muted-foreground flex items-center gap-2">
                                            <RefreshCw className="w-3 h-3 animate-spin" /> Loading logs...
                                        </div>
                                    ) : logs.length === 0 ? (
                                        <div className="text-muted-foreground">No logs available for this invoice.</div>
                                    ) : (
                                        <div className="overflow-x-auto rounded-md border border-border">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-muted text-muted-foreground font-medium">
                                                    <tr>
                                                        <th className="p-2 border-b border-border w-[180px]">Agent</th>
                                                        <th className="p-2 border-b border-border w-[200px]">Action</th>
                                                        <th className="p-2 border-b border-border w-[100px]">Status</th>
                                                        <th className="p-2 border-b border-border">Details</th>
                                                        <th className="p-2 border-b border-border w-[140px] text-right">Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {logs.map((log, i) => (
                                                        <tr key={i} className="hover:bg-muted/50 transition-colors">
                                                            <td className="p-2 font-medium text-primary">{log.agent_name}</td>
                                                            <td className="p-2">{log.action}</td>
                                                            <td className="p-2">
                                                                <span className={cn(
                                                                    "px-2 py-0.5 rounded-full text-[10px] font-medium capitalize",
                                                                    log.status === 'completed' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                                                    log.status === 'in-progress' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                                                                    log.status === 'failed' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                                                                    log.status === 'started' && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                                                )}>
                                                                    {log.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-2 font-mono text-[10px] text-muted-foreground max-w-[300px] truncate" title={JSON.stringify(log.details, null, 2)}>
                                                                {log.details && Object.keys(log.details).length > 0
                                                                    ? JSON.stringify(log.details).substring(0, 100) + (JSON.stringify(log.details).length > 100 ? '...' : '')
                                                                    : '-'
                                                                }
                                                            </td>
                                                            <td className="p-2 text-right text-muted-foreground">
                                                                {new Date(log.timestamp).toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function StatusIcon({ status }: { status: string }) {
    if (status === "AUTHORISED" || status === "PAID") return <div className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="w-3 h-3" /> {status}</div>;
    if (status === "DRAFT") return <div className="flex items-center gap-1 text-xs text-yellow-600"><Clock className="w-3 h-3" /> {status}</div>;
    return <div className="flex items-center gap-1 text-xs text-muted-foreground"><AlertCircle className="w-3 h-3" /> {status}</div>;
}
