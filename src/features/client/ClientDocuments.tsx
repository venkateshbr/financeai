import { useState, useEffect } from "react";
import { FileUpload } from "./components/FileUpload";
import { RecentDocuments } from "./components/RecentDocuments";
import { ProcessingLogsTable, type AgentLog } from "./components/ProcessingLogsTable";
import { FileText, CheckCircle, Loader2 } from "lucide-react";

export default function ClientDocuments() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
    const [activeLogs, setActiveLogs] = useState<AgentLog[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
    const [viewingLogs, setViewingLogs] = useState<boolean>(false);

    const handleUploadComplete = (data: any) => {
        console.log("Upload complete:", data);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleProcessingStart = (requestId: string) => {
        // Do NOT show logs automatically during upload
        setActiveRequestId(requestId);
        setIsProcessing(true);
        // Ensure logs are hidden until user clicks an invoice
        setViewingLogs(false);
        setActiveLogs([]);
    };

    const handleInvoiceClick = async (invoice: any) => {
        console.log("Invoice clicked:", invoice.invoiceID);
        setSelectedInvoiceId(invoice.invoiceID);
        setViewingLogs(true);

        // Fetch logs for this invoice
        try {
            const res = await fetch(`http://localhost:3156/api/processing/logs/invoice/${invoice.invoiceID}`);
            if (res.ok) {
                const logs = await res.json();
                setActiveLogs(logs);
            } else {
                setActiveLogs([]);
            }
        } catch (err) {
            console.error("Error fetching logs for invoice:", err);
            setActiveLogs([]);
        }
    };

    // Poll for logs if processing AND showing logs (only if activeRequestId matches selected?)
    // Actually, "activeLogs" is used for display. 
    // If IS PROCESSING, we want to update "activeLogs" IF we are viewing that request.
    // But since we hide logs during upload, we don't need real-time updates VISIBLE.
    // However, if the user clicks a completed invoice, we just fetched static logs.
    // If the user clicks an "In Progress" invoice (if we added it to the list), we'd want live updates.
    // Since "RecentDocuments" only shows completed, we assume static logs mostly.

    // We can keep the polling for internal state (isProcessing) but not update activeLogs if viewing historical.
    useEffect(() => {
        if (!activeRequestId || !isProcessing) return;

        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`http://localhost:3156/api/processing/${activeRequestId}`);
                if (res.ok) {
                    const data = await res.json();
                    // Do NOT update activeLogs here if we are viewing a different invoice
                    // Only update isProcessing state
                    if (data.status === 'completed' || data.status === 'failed') {
                        setIsProcessing(false);
                        setRefreshTrigger(prev => prev + 1); // Refresh list on complete
                    }
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 1000);

        return () => clearInterval(pollInterval);
    }, [activeRequestId, isProcessing]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Documents</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <h3 className="text-lg font-medium mb-4">Upload New Invoice</h3>
                        <FileUpload onUpload={handleUploadComplete} onProcessingStart={handleProcessingStart} />
                    </div>

                </div>

                <div className="space-y-6">
                    <RecentDocuments refreshTrigger={refreshTrigger} onInvoiceClick={handleInvoiceClick} />
                </div>
            </div>

            {/* Processing Logs - Full Width at Bottom */}
            {viewingLogs && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Processing Logs {selectedInvoiceId && <span className="text-sm text-muted-foreground font-normal ml-2">(Invoice: {selectedInvoiceId})</span>}</h3>
                        {/* Only show spinner if the selected invoice is the one currently processing? 
                            Since we only show logs for clicked invoice, and RecentDocuments are usually done, 
                            we probably don't need spinner unless we support clicking 'pending' items. */}
                    </div>
                    {activeLogs.length > 0 ? (
                        <ProcessingLogsTable logs={activeLogs} title={`Audit Trail`} />
                    ) : (
                        <div className="rounded-xl border bg-muted/20 p-8 text-center text-muted-foreground">
                            No processing logs found for this invoice.
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
