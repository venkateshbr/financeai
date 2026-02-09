import { useState } from "react";
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { ProcessingLogsTable, type AgentLog } from "./components/ProcessingLogsTable";

export default function BulkUpload() {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState<{ filename: string, status: string, requestId?: string }[]>([]);
    const [activeLogs, setActiveLogs] = useState<AgentLog[]>([]);
    const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleBulkUpload = async () => {
        if (files.length === 0) return;
        setUploading(true);
        setUploadResults([]);

        const results = [];

        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('http://localhost:3156/api/upload', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'x-tenant-id': 'mock-tenant-id' // Should come from context/auth
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    results.push({ filename: file.name, status: 'success', requestId: data.requestId });
                } else {
                    results.push({ filename: file.name, status: 'error' });
                }
            } catch (err) {
                console.error(err);
                results.push({ filename: file.name, status: 'error' });
            }
        }

        setUploadResults(results);
        setUploading(false);
    };

    const viewLogs = async (index: number) => {
        const result = uploadResults[index];
        if (!result.requestId) return;

        setSelectedResultIndex(index);
        setActiveLogs([]);

        // Fetch logs once (or could poll)
        try {
            const res = await fetch(`http://localhost:3156/api/processing/${result.requestId}`);
            const data = await res.json();
            setActiveLogs(data.logs || []);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Bulk Upload</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-colors">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                                id="bulk-file-upload"
                                accept=".pdf,.png,.jpg,.jpeg"
                            />
                            <label htmlFor="bulk-file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                <div className="p-4 bg-primary/10 rounded-full text-primary mb-2">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <h3 className="font-semibold text-lg">Select Multiple Files</h3>
                                <p className="text-sm text-muted-foreground">
                                    Drag and drop or click to upload
                                </p>
                            </label>
                        </div>

                        {files.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">Selected Files ({files.length})</h4>
                                {files.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                                        <span className="truncate">{f.name}</span>
                                        <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>
                                            <X className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={handleBulkUpload}
                                    disabled={uploading}
                                    className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {uploading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</span> : "Start Upload"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {uploadResults.length > 0 && (
                        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                            <h3 className="text-lg font-medium mb-4">Upload Results</h3>
                            <div className="space-y-2">
                                {uploadResults.map((res, i) => (
                                    <div key={i}
                                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedResultIndex === i ? 'bg-primary/10 border-primary' : 'bg-muted/30 border-border/50 hover:bg-muted/50'}`}
                                        onClick={() => viewLogs(i)}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <FileText className="w-4 h-4 text-primary" />
                                            <span className="text-sm font-medium truncate">{res.filename}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {res.status === 'success' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedResultIndex !== null && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <ProcessingLogsTable logs={activeLogs} title={`Logs for ${uploadResults[selectedResultIndex].filename}`} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
