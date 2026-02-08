import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
    onUpload: (data: any) => void;
    className?: string;
}


export function FileUpload({ onUpload, className }: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [logs, setLogs] = useState<any[]>([]);

    const pollStatus = async (requestId: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/processing/${requestId}`);
                if (!res.ok) return; // Wait for next tick
                const data = await res.json();

                setLogs(data.logs || []);

                // Calculate Progress
                const steps = data.logs || [];
                const lastLog = steps[steps.length - 1];
                let currentProgress = 5;

                if (data.status === 'completed') {
                    currentProgress = 100;
                    clearInterval(interval);
                    setStatus("success");
                    setMessage("Processing Complete!");
                    setUploading(false);
                    onUpload(data); // Refresh parent
                    setTimeout(() => {
                        setStatus("idle");
                        setLogs([]);
                        setProgress(0);
                    }, 5000);
                    return;
                } else if (data.status === 'failed') {
                    clearInterval(interval);
                    setStatus("error");
                    setMessage("Processing Failed.");
                    setUploading(false);
                    return;
                }

                // Heuristic Progress
                if (lastLog) {
                    setMessage(`${lastLog.agent_name}: ${lastLog.action}`);
                    if (lastLog.action === 'Parse PDF') currentProgress = 20;
                    if (lastLog.action === 'Extract Invoice Data') currentProgress = 40;
                    if (lastLog.action === 'Extract Invoice Data' && lastLog.status === 'completed') currentProgress = 50;
                    if (lastLog.action === 'Fetch Chart of Accounts') currentProgress = 55;
                    if (lastLog.action === 'Classify Line Items') currentProgress = 60;
                    if (lastLog.action === 'Classify Item') currentProgress = 70;
                    if (lastLog.action === 'Create Draft Invoice') currentProgress = 90;
                    if (lastLog.action === 'Upload Attachment') currentProgress = 95;
                }

                setProgress(prev => Math.max(prev, currentProgress));

            } catch (err) {
                console.error("Polling Error", err);
            }
        }, 1000);
    };

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 0) return;

            const file = acceptedFiles[0];
            setUploading(true);
            setStatus("processing");
            setProgress(5);
            setMessage("Initializing Upload...");
            setLogs([]);

            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error("Upload Failed: " + errText);
                }

                const data = await res.json();
                if (data.requestId) {
                    await pollStatus(data.requestId);
                } else {
                    throw new Error("No Request ID returned");
                }

            } catch (err: any) {
                console.error("Upload error:", err);
                setStatus("error");
                setMessage(err.message || "Failed to initiate process");
                setUploading(false);
            }
        },
        [onUpload]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
        },
        disabled: uploading
    });

    return (
        <div
            {...getRootProps()}
            className={cn(
                "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors duration-200 ease-in-out relative overflow-hidden",
                isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50",
                uploading && "cursor-default",
                status === "error" && "border-red-500 bg-red-50",
                status === "success" && "border-green-500 bg-green-50",
                className
            )}
        >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center justify-center gap-4 relative z-10">
                <div className={cn("p-4 bg-background rounded-full border border-border shadow-sm",
                    status === "success" && "border-green-500",
                    status === "error" && "border-red-500"
                )}>
                    {status === "processing" ? (
                        <div className="relative">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold">
                                {progress}%
                            </span>
                        </div>
                    ) : status === "success" ? (
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    ) : status === "error" ? (
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    ) : (
                        <UploadCloud className="w-8 h-8 text-primary" />
                    )}
                </div>

                <div className="space-y-1 max-w-sm mx-auto">
                    {uploading || status === "processing" ? (
                        <div className="space-y-2">
                            <p className="text-lg font-medium animate-pulse">{message}</p>
                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border">
                                <div
                                    className="h-full bg-primary transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            {logs.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    Last action: {logs[logs.length - 1].details?.mimetype || logs[logs.length - 1].action}
                                </p>
                            )}
                        </div>
                    ) : status === "success" ? (
                        <p className="text-lg font-medium text-green-600">{message}</p>
                    ) : status === "error" ? (
                        <p className="text-lg font-medium text-red-600">{message}</p>
                    ) : (
                        <>
                            <p className="text-lg font-medium">Click to upload or drag and drop</p>
                            <p className="text-sm text-muted-foreground">
                                Upload Invoice (PDF) for AI Processing
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
