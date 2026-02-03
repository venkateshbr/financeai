import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string;
    trend?: string;
    trendUp?: boolean;
    icon: LucideIcon;
    className?: string;
}

export function StatsCard({ title, value, trend, trendUp, icon: Icon, className }: StatsCardProps) {
    return (
        <div className={cn("rounded-xl border bg-card text-card-foreground shadow p-6", className)}>
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
                <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
                {trend && (
                    <span className={cn("text-xs font-medium", trendUp ? "text-green-500" : "text-red-500")}>
                        {trend}
                    </span>
                )}
            </div>
        </div>
    );
}
