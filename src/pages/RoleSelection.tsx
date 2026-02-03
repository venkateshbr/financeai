import { useNavigate } from "react-router-dom";
import { Building2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RoleSelection() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    Finance<span className="text-primary">AI</span> Portal
                </h1>
                <p className="text-muted-foreground text-lg">
                    Select your portal to continue
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                <RoleCard
                    title="Client Portal"
                    description="Manage your documents and view financial health"
                    icon={<Building2 className="w-12 h-12 mb-4 text-primary" />}
                    onClick={() => navigate("/client")}
                    featured
                />
                <RoleCard
                    title="Internal Staff"
                    description="Review documents and manage client accounts"
                    icon={<Users className="w-12 h-12 mb-4 text-secondary-foreground" />}
                    onClick={() => navigate("/internal")}
                />
            </div>
        </div>
    );
}

function RoleCard({
    title,
    description,
    icon,
    onClick,
    featured,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    featured?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "group relative flex flex-col items-center justify-center p-8 rounded-xl border transition-all duration-300 hover:scale-[1.02]",
                featured
                    ? "bg-card border-primary/20 hover:border-primary/50 shadow-lg shadow-black/20"
                    : "bg-muted/30 border-border hover:border-foreground/20 hover:bg-muted/50"
            )}
        >
            <div className="transform transition-transform duration-300 group-hover:-translate-y-1">
                {icon}
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-foreground">{title}</h2>
            <p className="text-muted-foreground text-center">{description}</p>
        </button>
    );
}
