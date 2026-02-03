import { Outlet } from "react-router-dom";
import { LayoutDashboard, FileText, UserCircle } from "lucide-react";
import { Sidebar } from "@/components/common/Sidebar";

const clientLinks = [
    { label: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
    { label: "Documents", href: "/client/documents", icon: FileText },
    { label: "Company Profile", href: "/client/profile", icon: UserCircle },
];

export default function ClientLayout() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar title="Client" links={clientLinks} />
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
