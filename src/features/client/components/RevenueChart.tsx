import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { MoveUpRight, MoveDownRight } from "lucide-react";

interface RevenueChartProps {
    data?: {
        name: string;
        revenue: number;
        expenses: number;
    }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="rounded-xl border bg-card text-card-foreground shadow col-span-4 lg:col-span-3 p-6">
                Loading Chart...
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow col-span-4 lg:col-span-3">
            <div className="p-6 pb-2">
                <h3 className="text-lg font-medium">Cash Flow Overview (Last 6 Months)</h3>
                <p className="text-sm text-muted-foreground">Monthly cash in (revenue) vs cash out (expenses)</p>
            </div>
            <div className="h-[300px] w-full p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
                        <XAxis dataKey="name" className="text-xs text-muted-foreground" tickLine={false} axisLine={false} />
                        <YAxis className="text-xs text-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-emerald-500">Cash In</span>
                                                    <span className="font-bold">{`$${payload[0].value?.toLocaleString()}`}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-red-500">Cash Out</span>
                                                    <span className="font-bold">{`$${payload[1].value?.toLocaleString()}`}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            name="Revenue"
                        />
                        <Area
                            type="monotone"
                            dataKey="expenses"
                            stroke="#ef4444"
                            fillOpacity={1}
                            fill="url(#colorExpenses)"
                            name="Expenses"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
