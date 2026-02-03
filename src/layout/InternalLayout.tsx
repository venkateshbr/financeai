import { Outlet } from "react-router-dom";
import { LayoutDashboard, CheckSquare } from "lucide-react";
import { Sidebar } from "@/components/common/Sidebar";

const internalLinks = [
    { label: "Dashboard", href: "/internal/dashboard", icon: LayoutDashboard },
    { label: "Review Queue", href: "/internal/reviews", icon: CheckSquare },
];

export default function InternalLayout() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar title="Internal" links={internalLinks} />
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
