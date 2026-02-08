import { useState } from "react";
import { User, Building, MapPin, Hash, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ClientProfile() {
    const [formData, setFormData] = useState({
        entityName: "FINANCE AI PTE. LTD.",
        uen: "202412345K",
        entityType: "Private Limited Company",
        address: "71 AYER RAJAH CRESCENT, #02-01, SINGAPORE 139951",
        ssicCode: "62011",
        ssicDescription: "DEVELOPMENT OF SOFTWARE AND APPLICATIONS (EXCEPT GAMES AND CYBERSECURITY)",
        contactName: "Tim Tan",
    });

    const [saving, setSaving] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setTimeout(() => setSaving(false), 1000);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Company Profile</h1>
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200">
                    ACRA Status: Live
                </div>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-6 border-b border-border">
                    <h2 className="text-lg font-medium">ACRA Registration Details</h2>
                    <p className="text-sm text-muted-foreground">Official business information as registered in Singapore</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none" htmlFor="uen">
                                UEN (Unique Entity Number)
                            </label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="uen"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background disabled:opacity-50"
                                    value={formData.uen}
                                    onChange={(e) => setFormData({ ...formData, uen: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none" htmlFor="entityName">
                                Entity Name
                            </label>
                            <div className="relative">
                                <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="entityName"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background disabled:opacity-50"
                                    value={formData.entityName}
                                    onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none" htmlFor="entityType">
                                Entity Type
                            </label>
                            <div className="relative">
                                <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="entityType"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background disabled:opacity-50"
                                    value={formData.entityType}
                                    onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none" htmlFor="contactName">
                                Primary Contact Officer
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="contactName"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background disabled:opacity-50"
                                    value={formData.contactName}
                                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none" htmlFor="address">
                            Registered Office Address
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                id="address"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background disabled:opacity-50"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="grid gap-2 md:col-span-1">
                            <label className="text-sm font-medium leading-none" htmlFor="ssicCode">
                                SSIC Code
                            </label>
                            <input
                                id="ssicCode"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:opacity-50"
                                value={formData.ssicCode}
                                onChange={(e) => setFormData({ ...formData, ssicCode: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2 md:col-span-3">
                            <label className="text-sm font-medium leading-none" htmlFor="ssicDescription">
                                Primary Activity
                            </label>
                            <input
                                id="ssicDescription"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:opacity-50"
                                value={formData.ssicDescription}
                                onChange={(e) => setFormData({ ...formData, ssicDescription: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
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

            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-medium">Company Officers (Directors / Secretaries)</h2>
                        <p className="text-sm text-muted-foreground">Appointed officers as per ACRA records</p>
                    </div>
                    <button className="text-sm text-primary hover:underline">
                        + Add Officer
                    </button>
                </div>
                <div className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Position</th>
                                    <th className="px-6 py-3">ID Number</th>
                                    <th className="px-6 py-3">Nationality</th>
                                    <th className="px-6 py-3">Appointed Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                <tr className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 font-medium">Tim Tan</td>
                                    <td className="px-6 py-4">Director</td>
                                    <td className="px-6 py-4">S1234567A</td>
                                    <td className="px-6 py-4">Singapore Citizen</td>
                                    <td className="px-6 py-4">01 Jan 2024</td>
                                </tr>
                                <tr className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4">Jane Tan</td>
                                    <td className="px-6 py-4">Secretary</td>
                                    <td className="px-6 py-4">S7654321Z</td>
                                    <td className="px-6 py-4">Singapore Citizen</td>
                                    <td className="px-6 py-4">01 Jan 2024</td>
                                </tr>
                                <tr className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4">Michael Lim</td>
                                    <td className="px-6 py-4">Director</td>
                                    <td className="px-6 py-4">S8888888D</td>
                                    <td className="px-6 py-4">Singapore Citizen</td>
                                    <td className="px-6 py-4">15 Feb 2024</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
