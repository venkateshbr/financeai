import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SplitLayoutProps {
    left: ReactNode;
    right: ReactNode;
    className?: string;
    leftPanelClassName?: string;
    rightPanelClassName?: string;
}

export function SplitLayout({
    left,
    right,
    className,
    leftPanelClassName,
    rightPanelClassName,
}: SplitLayoutProps) {
    return (
        <div className={cn("flex h-[calc(100vh-6rem)] gap-4 overflow-hidden", className)}>
            <div className={cn("w-1/2 flex flex-col overflow-hidden rounded-xl border bg-card shadow", leftPanelClassName)}>
                {left}
            </div>
            <div className={cn("w-1/2 flex flex-col overflow-hidden rounded-xl border bg-card shadow", rightPanelClassName)}>
                {right}
            </div>
        </div>
    );
}
