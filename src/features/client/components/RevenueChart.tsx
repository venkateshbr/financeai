import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const data = [
    { name: "Jan", revenue: 4000, expenses: 2400 },
    { name: "Feb", revenue: 3000, expenses: 1398 },
    { name: "Mar", revenue: 2000, expenses: 9800 },
    { name: "Apr", revenue: 2780, expenses: 3908 },
    { name: "May", revenue: 1890, expenses: 4800 },
    { name: "Jun", revenue: 2390, expenses: 3800 },
    { name: "Jul", revenue: 3490, expenses: 4300 },
];

export function RevenueChart() {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow col-span-4 lg:col-span-3">
            <div className="p-6 pb-2">
                <h3 className="text-lg font-medium">Financial Overview</h3>
                <p className="text-sm text-muted-foreground">Monthly revenue vs expenses</p>
            </div>
            <div className="h-[300px] w-full p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">Revenue</span>
                                                    <span className="font-bold text-muted-foreground">{`$${payload[0].value}`}</span>
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
                            stroke="hsl(var(--primary))"
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
