import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";


const recentDocs = [
    { id: 1, name: "Invoice_INV001.pdf", status: "completed", date: "Today, 10:23 AM", size: "1.2 MB" },
    { id: 2, name: "Expense_Report_Q1.pdf", status: "processing", date: "Yesterday, 4:15 PM", size: "2.4 MB" },
    { id: 3, name: "Bank_Statement_Jan.pdf", status: "pending", date: "Jan 30, 9:00 AM", size: "850 KB" },
];

export function RecentDocuments() {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow col-span-4 lg:col-span-1">
            <div className="p-6 pb-2">
                <h3 className="text-lg font-medium">Recent Documents</h3>
                <p className="text-sm text-muted-foreground">Status of uploaded files</p>
            </div>
            <div className="p-4 space-y-4">
                {recentDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-background rounded-md border border-border">
                                <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium">{doc.name}</p>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {doc.date}
                                </div>
                            </div>
                        </div>
                        <StatusIcon status={doc.status} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatusIcon({ status }: { status: string }) {
    if (status === "completed") return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === "processing") return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
    return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
}
