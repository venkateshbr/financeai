import { useState } from "react";
import { User, Building, MapPin, Hash, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ClientProfile() {
    const [formData, setFormData] = useState({
        businessName: "Acme Corp",
        taxId: "US-8839210-X",
        address: "123 Innovation Dr, Tech City, CA",
        contactName: "John Doe",
    });

    const [saving, setSaving] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setTimeout(() => setSaving(false), 1000);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Company Profile</h1>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-6 border-b border-border">
                    <h2 className="text-lg font-medium">Registration Details</h2>
                    <p className="text-sm text-muted-foreground">Manage your business information</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="businessName">
                                Business Name
                            </label>
                            <div className="relative">
                                <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="businessName"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none" htmlFor="taxId">
                                Tax ID / EIN
                            </label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="taxId"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.taxId}
                                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none" htmlFor="address">
                                Business Address
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="address"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none" htmlFor="contactName">
                                Primary Contact
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="contactName"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.contactName}
                                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className={cn(
                                "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2",
                                saving && "opacity-70 cursor-wait"
                            )}
                        >
                            {saving ? (
                                "Saving..."
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
