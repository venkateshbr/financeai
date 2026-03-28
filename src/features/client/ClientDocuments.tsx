import { useState, useEffect } from "react";
import { FileUpload } from "./components/FileUpload";
import { RecentDocuments } from "./components/RecentDocuments";
import { ProcessingLogsTable, type AgentLog } from "./components/ProcessingLogsTable";
import { FileText, Loader2 } from "lucide-react";

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
        // Show logs automatically during upload
        setActiveRequestId(requestId);
        setIsProcessing(true);
        setSelectedInvoiceId(null);
        setViewingLogs(true);
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
                    
                    if (data.logs) {
                        setActiveLogs(data.logs);
                    }

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
        <div className="flex flex-col gap-6 pb-8">
            {/* Top 70% Section: Upload + Logs */}
            <div className="h-[70vh] min-h-[400px] grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-1 h-full min-h-0">
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6 h-full flex flex-col">
                        <h3 className="text-lg font-medium mb-4 flex-none">Upload New Invoice</h3>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <FileUpload onUpload={handleUploadComplete} onProcessingStart={handleProcessingStart} />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 h-full min-h-0">
                    {/* Processing Logs - Right Side */}
                    {viewingLogs ? (
                        <div className="flex flex-col h-full animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between flex-none mb-2">
                                <h3 className="text-lg font-medium flex items-center">
                                    Processing Logs 
                                    {selectedInvoiceId && <span className="text-sm text-muted-foreground font-normal ml-2">(Invoice: {selectedInvoiceId})</span>}
                                    {isProcessing && !selectedInvoiceId && <Loader2 className="ml-3 h-4 w-4 animate-spin text-muted-foreground" />}
                                </h3>
                            </div>
                            {activeLogs.length > 0 ? (
                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    <ProcessingLogsTable logs={activeLogs} title={`Audit Trail`} />
                                </div>
                            ) : (
                                <div className="flex-1 rounded-xl border bg-muted/20 p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                            <span>Waiting for processing to begin...</span>
                                        </>
                                    ) : (
                                        <span>No processing logs found for this invoice.</span>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                            <FileText className="h-8 w-8 mb-3 opacity-50" />
                            <p>Upload an invoice or select a recent draft to view processing logs here.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Documents - Bottom */}
            <div className="w-full">
                <RecentDocuments refreshTrigger={refreshTrigger} onInvoiceClick={handleInvoiceClick} />
            </div>
        </div>
    );
}
