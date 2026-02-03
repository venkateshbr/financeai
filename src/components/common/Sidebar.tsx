import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    title: string;
    links: {
        label: string;
        href: string;
        icon: React.ElementType;
    }[];
}

export function Sidebar({ title, links }: SidebarProps) {
    const navigate = useNavigate();

    return (
        <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col hidden md:flex">
            <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                    Finance<span className="text-primary">AI</span>
                    <span className="text-xs font-normal bg-muted px-2 py-0.5 rounded-full text-muted-foreground ml-auto">
                        {title}
                    </span>
                </h2>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {links.map((link) => (
                    <NavLink
                        key={link.href}
                        to={link.href}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )
                        }
                    >
                        <link.icon className="w-4 h-4" />
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-border">
                <button
                    onClick={() => navigate("/")}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Switch Portal
                </button>
            </div>
        </aside>
    );
}
