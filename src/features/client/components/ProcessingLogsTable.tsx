import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AgentLog {
    id?: number;
    agent_name: string;
    action: string;
    status: string;
    details: any;
    timestamp: string;
}

export function ProcessingLogsTable({ logs, title = "Agent Processing Logs" }: { logs: AgentLog[], title?: string }) {
    if (!logs || logs.length === 0) return null;

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
            <div className="p-4 border-b bg-muted/40 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-medium text-sm">{title}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="bg-muted text-muted-foreground font-medium">
                        <tr>
                            <th className="p-3 border-b w-[150px]">Agent</th>
                            <th className="p-3 border-b w-[200px]">Action</th>
                            <th className="p-3 border-b w-[100px]">Status</th>
                            <th className="p-3 border-b">Details</th>
                            <th className="p-3 border-b w-[140px] text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {logs.map((log, i) => (
                            <tr key={i} className="hover:bg-muted/50 transition-colors">
                                <td className="p-3 font-medium text-primary">{log.agent_name}</td>
                                <td className="p-3">{log.action}</td>
                                <td className="p-3">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[10px] font-medium capitalize",
                                        log.status === 'completed' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                        log.status === 'in-progress' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                                        log.status === 'failed' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                                        log.status === 'started' && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                    )}>
                                        {log.status}
                                    </span>
                                </td>
                                <td className="p-3 font-mono text-[10px] text-muted-foreground max-w-[300px] truncate" title={JSON.stringify(log.details, null, 2)}>
                                    {log.details && Object.keys(log.details).length > 0
                                        ? JSON.stringify(log.details).substring(0, 100) + (JSON.stringify(log.details).length > 100 ? '...' : '')
                                        : '-'
                                    }
                                </td>
                                <td className="p-3 text-right text-muted-foreground">
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
