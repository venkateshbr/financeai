import { useEffect, useState } from "react";
import { FileText, Clock, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

interface XeroInvoice {
    invoiceID: string;
    invoiceNumber: string;
    status: string;
    date: string; // ISO string from Xero
    contact: { name: string };
    total: number;
}


export function RecentDocuments({ refreshTrigger, onInvoiceClick }: { refreshTrigger?: number, onInvoiceClick?: (invoice: XeroInvoice) => void }) {
    const [invoices, setInvoices] = useState<XeroInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchInvoices();
    }, [refreshTrigger]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3156/api/xero/invoices');
            if (!res.ok) throw new Error("Failed to fetch documents");
            const data = await res.json();
            const sorted = data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setInvoices(sorted.slice(0, 10));
        } catch (err) {
            console.error(err);
            setError("Could not load recent documents");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow col-span-4 lg:col-span-1 flex flex-col">
            <div className="p-6 pb-2 flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-medium">Recent Draft Invoices</h3>
                    <p className="text-sm text-muted-foreground">From Xero (ACCPAY)</p>
                </div>
                <button onClick={fetchInvoices} className="p-1 hover:bg-muted rounded text-muted-foreground" title="Refresh">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="p-4 space-y-4 flex-1 max-h-[600px] overflow-y-auto custom-scrollbar">
                {loading && invoices.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500 text-sm">{error}</div>
                ) : invoices.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">No draft invoices found.</div>
                ) : (
                    invoices.map((doc) => (
                        <div
                            key={doc.invoiceID}
                            onClick={() => onInvoiceClick && onInvoiceClick(doc)}
                            className="rounded-lg bg-muted/30 border border-border/50 overflow-hidden cursor-pointer hover:border-primary/50 transition-all"
                        >
                            <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
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
                                            {new Date(doc.date).toLocaleDateString()} • {doc.invoiceNumber}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-right shrink-0">
                                    <div>
                                        <span className="block text-sm font-medium">${doc.total}</span>
                                        <StatusIcon status={doc.status} />
                                    </div>
                                </div>
                            </div>
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
