import { FileText, ChevronRight, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VerificationItem {
    id: string;
    clientName: string;
    date: string;
    amount: string;
    suggestedGL: string;
    confidence: number;
    status: "pending" | "reviewed" | "flagged";
    fileName: string;
}

interface VerificationTableProps {
    items: VerificationItem[];
    onSelect: (item: VerificationItem) => void;
    selectedId?: string;
}

export function VerificationTable({ items, onSelect, selectedId }: VerificationTableProps) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Client</th>
                            <th className="p-4 font-medium">Date</th>
                            <th className="p-4 font-medium">Amount</th>
                            <th className="p-4 font-medium">Suggested GL</th>
                            <th className="p-4 font-medium">Confidence</th>
                            <th className="p-4 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr
                                key={item.id}
                                onClick={() => onSelect(item)}
                                className={cn(
                                    "border-b last:border-0 cursor-pointer transition-colors",
                                    selectedId === item.id
                                        ? "bg-primary/5 border-l-2 border-l-primary"
                                        : "hover:bg-muted/30 border-l-2 border-l-transparent"
                                )}
                            >
                                <td className="p-4">
                                    <StatusBadge status={item.status} />
                                </td>
                                <td className="p-4 font-medium">{item.clientName}</td>
                                <td className="p-4 text-muted-foreground">{item.date}</td>
                                <td className="p-4 font-mono">{item.amount}</td>
                                <td className="p-4">
                                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10">
                                        {item.suggestedGL}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <ConfidenceBar score={item.confidence} />
                                </td>
                                <td className="p-4 text-right">
                                    <ChevronRight className="ml-auto w-4 h-4 text-muted-foreground" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === "reviewed") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                <CheckCircle className="w-3 h-3" /> Reviewed
            </span>
        );
    }
    if (status === "flagged") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600">
                <AlertCircle className="w-3 h-3" /> Flagged
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600">
            <FileText className="w-3 h-3" /> Pending
        </span>
    );
}

function ConfidenceBar({ score }: { score: number }) {
    const color = score > 80 ? "bg-green-500" : score > 50 ? "bg-yellow-500" : "bg-red-500";
    return (
        <div className="flex items-center gap-2">
            <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                <div className={cn("h-full transition-all", color)} style={{ width: `${score}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{score}%</span>
        </div>
    );
}
