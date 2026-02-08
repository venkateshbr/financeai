import { useState } from "react";
import { FileUpload } from "./components/FileUpload";
import { RecentDocuments } from "./components/RecentDocuments";
import { FileText, CheckCircle } from "lucide-react";

export default function ClientDocuments() {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleUpload = (data: any) => {
        console.log("Upload success callback:", data);
        // Create a pseudo-file object or just a display object
        const newFile = {
            name: `Invoice ${data.invoice.reference || data.invoice.invoiceID}`,
            lastModified: Date.now(),
            size: 0,
            type: 'application/pdf'
        } as File;

        setUploadedFiles((prev) => [newFile, ...prev]);
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Documents</h1>
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Download All
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <h3 className="text-lg font-medium mb-4">Upload New Invoice</h3>
                        <FileUpload onUpload={handleUpload} />
                    </div>

                    {uploadedFiles.length > 0 && (
                        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                            <h3 className="text-lg font-medium mb-4">Just Uploaded</h3>
                            <div className="space-y-2">
                                {uploadedFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-4 h-4 text-primary" />
                                            <span className="text-sm font-medium">{file.name}</span>
                                        </div>
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <RecentDocuments refreshTrigger={refreshTrigger} />
                </div>
            </div>
        </div>
    );
}
