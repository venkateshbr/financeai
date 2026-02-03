import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
    onUpload: (files: File[]) => void;
    className?: string;
}

export function FileUpload({ onUpload, className }: FileUploadProps) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            onUpload(acceptedFiles);
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
    });

    return (
        <div
            {...getRootProps()}
            className={cn(
                "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors duration-200 ease-in-out",
                isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50",
                className
            )}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-4">
                <div className="p-4 bg-background rounded-full border border-border shadow-sm">
                    <UploadCloud className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-1">
                    <p className="text-lg font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">
                        PDF, JPG or PNG (max. 10MB)
                    </p>
                </div>
            </div>
        </div>
    );
}
