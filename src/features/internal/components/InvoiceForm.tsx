import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, Search } from "lucide-react";
import type { VerificationItem } from "./VerificationTable";

interface InvoiceFormProps {
    item: VerificationItem;
    onApprove: (data: any) => void;
    onFlag: () => void;
}

const GL_CODES = [
    { code: "4000", name: "Sales" },
    { code: "5000", name: "COGS" },
    { code: "6100", name: "Advertising" },
    { code: "6200", name: "Software Subscription" },
    { code: "6300", name: "Office Supplies" },
    { code: "6400", name: "Rent" },
    { code: "6500", name: "Utilities" },
];

export function InvoiceForm({ item, onApprove, onFlag }: InvoiceFormProps) {
    const [formData, setFormData] = useState({
        supplier: "",
        date: "",
        net: 0,
        tax: 0,
        total: 0,
        glCode: "",
    });

    const [searchGl, setSearchGl] = useState("");
    const [showGlDropdown, setShowGlDropdown] = useState(false);

    // Initialize form with mock data based on item
    useEffect(() => {
        setFormData({
            supplier: item.clientName === "Acme Corp" ? "AWS" : "Office Depot", // Mock inference
            date: item.date,
            net: parseFloat(item.amount.replace("$", "").replace(",", "")) * 0.9,
            tax: parseFloat(item.amount.replace("$", "").replace(",", "")) * 0.1,
            total: parseFloat(item.amount.replace("$", "").replace(",", "")),
            glCode: item.suggestedGL,
        });
    }, [item]);

    const filteredGLs = GL_CODES.filter(
        (gl) =>
            gl.code.includes(searchGl) || gl.name.toLowerCase().includes(searchGl.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onApprove(formData);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-border bg-muted/10">
                <h2 className="text-lg font-medium">Invoice Details</h2>
                <p className="text-sm text-muted-foreground">Verify and edit extracted data</p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Supplier</label>
                    <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Date</label>
                        <input
                            type="date"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={new Date().toISOString().split('T')[0]} // Mock default
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">GL Code</label>
                        <div className="relative">
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.glCode}
                                onChange={(e) => {
                                    setFormData({ ...formData, glCode: e.target.value });
                                    setSearchGl(e.target.value);
                                    setShowGlDropdown(true);
                                }}
                                onFocus={() => setShowGlDropdown(true)}
                                placeholder="Search Code..."
                            />
                            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />

                            {showGlDropdown && (
                                <div className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md max-h-40 overflow-auto">
                                    {filteredGLs.map(gl => (
                                        <button
                                            key={gl.code}
                                            type="button"
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                                            onClick={() => {
                                                setFormData({ ...formData, glCode: gl.code });
                                                setShowGlDropdown(false);
                                            }}
                                        >
                                            <span className="font-semibold">{gl.code}</span> - {gl.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Net</label>
                        <input
                            type="number"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={formData.net.toFixed(2)}
                            onChange={(e) => setFormData({ ...formData, net: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Tax</label>
                        <input
                            type="number"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={formData.tax.toFixed(2)}
                            onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Total</label>
                        <input
                            type="number"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-bold"
                            value={formData.total.toFixed(2)}
                            onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) })}
                        />
                    </div>
                </div>
            </form>

            <div className="p-6 border-t border-border bg-muted/10 flex gap-4">
                <button
                    onClick={onFlag}
                    className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-yellow-500 hover:bg-yellow-600 text-white h-10 py-2 px-4"
                >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Flag for Review
                </button>
                <button
                    onClick={handleSubmit}
                    className="flex-[2] inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-green-600 hover:bg-green-700 text-white h-10 py-2 px-4"
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve & Send to Xero
                </button>
            </div>
        </div>
    );
}
