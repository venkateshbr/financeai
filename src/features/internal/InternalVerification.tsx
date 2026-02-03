import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { SplitLayout } from "@/components/common/SplitLayout";
import { VerificationTable, type VerificationItem } from "./components/VerificationTable";
import { InvoiceForm } from "./components/InvoiceForm";

const MOCK_QUEUE: VerificationItem[] = [
    { id: "1", clientName: "Acme Corp", date: "2023-10-12", amount: "$1,200.00", suggestedGL: "6200", confidence: 92, status: "pending", fileName: "inv_123.pdf" },
    { id: "2", clientName: "Globex Inc", date: "2023-10-14", amount: "$450.50", suggestedGL: "6300", confidence: 65, status: "pending", fileName: "rec_992.jpg" },
    { id: "3", clientName: "Soylent Corp", date: "2023-10-11", amount: "$3,400.00", suggestedGL: "4000", confidence: 45, status: "flagged", fileName: "bill_322.pdf" },
    { id: "4", clientName: "Umbrella Corp", date: "2023-10-15", amount: "$890.00", suggestedGL: "6500", confidence: 88, status: "pending", fileName: "util_55.pdf" },
];

export default function InternalVerification() {
    const [queue, setQueue] = useState<VerificationItem[]>(MOCK_QUEUE);
    const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null);

    const handleApprove = async (data: any) => {
        if (!selectedItem) return;

        // Simulate Webhook Call
        console.log("Sending to n8n Webhook:", { ...data, invoiceId: selectedItem.id });

        // Optimistic Update
        setQueue(prev => prev.filter(i => i.id !== selectedItem.id));
        setSelectedItem(null);

        // Mock Success Toast (could use actual toast lib later)
        alert(`Invoice ${selectedItem.id} Approved & Sent to Xero!`);
    };

    const handleFlag = () => {
        if (!selectedItem) return;
        setQueue(prev => prev.map(i => i.id === selectedItem.id ? { ...i, status: "flagged" } : i));
        setSelectedItem(null);
    };

    if (selectedItem) {
        return (
            <div className="h-screen flex flex-col bg-background p-4 gap-4">
                <div className="flex items-center gap-4 px-2">
                    <button
                        onClick={() => setSelectedItem(null)}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold">Verifying: {selectedItem.fileName}</h1>
                    <span className="text-sm text-muted-foreground ml-auto">Confidence: {selectedItem.confidence}%</span>
                </div>

                <SplitLayout
                    className="flex-1"
                    left={
                        <div className="flex items-center justify-center h-full bg-muted/20 text-muted-foreground p-8 text-center">
                            <div>
                                <p className="text-lg font-medium mb-2">Document Preview</p>
                                <p className="text-sm">Mock PDF Viewer for {selectedItem.fileName}</p>
                                <div className="mt-8 border-2 border-dashed border-gray-300 rounded-lg w-64 h-96 mx-auto flex items-center justify-center bg-white">
                                    [PDF Image Placeholder]
                                </div>
                            </div>
                        </div>
                    }
                    right={
                        <InvoiceForm
                            item={selectedItem}
                            onApprove={handleApprove}
                            onFlag={handleFlag}
                        />
                    }
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Verification Queue</h1>
                <div className="text-sm text-muted-foreground">
                    {queue.length} items needing attention
                </div>
            </div>

            <VerificationTable
                items={queue}
                onSelect={setSelectedItem}
            />
        </div>
    );
}
