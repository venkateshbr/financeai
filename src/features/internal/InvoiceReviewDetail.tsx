import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Plus, Trash2 } from "lucide-react";
import { SplitLayout } from "@/components/common/SplitLayout";

const formatDateForInput = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    // If it's a full ISO string (2023-10-12T00:00:00), split at T
    if (dateStr.includes('T')) return dateStr.split('T')[0];

    // If it's /Date(...)/ format
    if (dateStr.includes('/Date(')) {
        const timestamp = parseInt(dateStr.replace(/\D/g, ''));
        if (!isNaN(timestamp)) {
            const d = new Date(timestamp);
            return d.toISOString().split('T')[0];
        }
    }

    // Attempt standard parse
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];

    return '';
};

interface LineItem {
    lineItemID?: string;
    description: string;
    quantity: number;
    unitAmount: number;
    accountCode: string;
    taxType?: string;
    lineAmount?: number;
}

interface Invoice {
    invoiceID: string;
    invoiceNumber: string;
    reference: string;
    contact: { name: string };
    dateString?: string; // Used for Input state (YYYY-MM-DD)
    dueDateString?: string; // Used for Input state (YYYY-MM-DD)
    date?: string; // API value
    dueDate?: string; // API value
    lineItems: LineItem[];
    status: string;
    subTotal: number;
    totalTax: number;
    total: number;
}

export default function InvoiceReviewDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]); // New State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                // Fetch Invoice
                const invoiceRes = await fetch(`http://localhost:3156/api/xero/invoices/${id}`);
                const invoiceData = await invoiceRes.json();

                // Initialize date strings for inputs
                if (invoiceData.date) {
                    invoiceData.dateString = formatDateForInput(invoiceData.date);
                }
                if (invoiceData.dueDate) {
                    invoiceData.dueDateString = formatDateForInput(invoiceData.dueDate);
                }

                setInvoice(invoiceData);

                // Fetch Accounts
                const accountsRes = await fetch('http://localhost:3156/api/xero/accounts');
                const accountsData = await accountsRes.json();
                setAccounts(accountsData);

                // Fetch Attachments List
                const attachRes = await fetch(`http://localhost:3156/api/xero/invoices/${id}/attachments`);
                const attachData = await attachRes.json();
                setAttachments(attachData);

                // Fetch Content of First Attachment (if PDF)
                if (attachData.length > 0) {
                    const firstAtt = attachData[0];
                    if (firstAtt.mimeType === 'application/pdf') {
                        const contentRes = await fetch(`http://localhost:3156/api/xero/invoices/${id}/attachments/${firstAtt.attachmentID}/content`);
                        const blob = await contentRes.blob();
                        console.log("PDF Blob Size:", blob.size); // Debug
                        setPdfBlobUrl(URL.createObjectURL(blob));
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleLineItemChange = (index: number, field: keyof LineItem, value: any) => {
        if (!invoice) return;
        const newLines = [...invoice.lineItems];
        newLines[index] = { ...newLines[index], [field]: value };
        setInvoice({ ...invoice, lineItems: newLines });
    };

    const handleAddLine = () => {
        if (!invoice) return;
        setInvoice({
            ...invoice,
            lineItems: [...invoice.lineItems, { description: "", quantity: 1, unitAmount: 0, accountCode: "400" }]
        });
    };

    const handleRemoveLine = (index: number) => {
        if (!invoice) return;
        const newLines = invoice.lineItems.filter((_, i) => i !== index);
        setInvoice({ ...invoice, lineItems: newLines });
    };

    const handleSaveAndApprove = async () => {
        if (!invoice || !id) return;
        setSaving(true);
        try {
            // 1. Update Invoice
            const updateRes = await fetch(`http://localhost:3156/api/xero/invoices/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contact: invoice.contact,
                    date: invoice.dateString,
                    dueDate: invoice.dueDateString,
                    reference: invoice.reference,
                    lineItems: invoice.lineItems.map(item => ({
                        description: item.description,
                        quantity: Number(item.quantity),
                        unitAmount: Number(item.unitAmount),
                        accountCode: item.accountCode
                    }))
                })
            });

            if (!updateRes.ok) throw new Error("Failed to update invoice");

            // 2. Approve Invoice
            const approveRes = await fetch(`http://localhost:3156/api/xero/invoices/${id}/approve`, {
                method: 'POST'
            });

            if (!approveRes.ok) throw new Error("Failed to approve invoice");

            navigate('/internal/reviews');
        } catch (error) {
            console.error("Error saving invoice:", error);
            alert("Failed to save and approve. Check console for details.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading details...</div>;
    if (!invoice) return <div className="p-8">Invoice not found.</div>;

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col gap-4">
            <div className="flex items-center gap-4 px-2 shrink-0">
                <button
                    onClick={() => navigate('/internal/reviews')}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold">{invoice.contact?.name}</h1>
                    <p className="text-sm text-muted-foreground">{invoice.reference} • {invoice.invoiceNumber}</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <button
                        onClick={handleSaveAndApprove}
                        disabled={saving}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? "Processing..." : (
                            <>
                                <CheckCircle className="w-4 h-4" /> Save & Approve
                            </>
                        )}
                    </button>
                </div>
            </div>

            <SplitLayout
                className="flex-1 min-h-0"
                left={
                    <div className="h-full bg-muted/20 border-r border-border p-4 flex flex-col">
                        <div className="mb-2 font-medium text-sm flex justify-between">
                            <span>Document Preview</span>
                            <span className="text-muted-foreground text-xs">{attachments.length > 0 ? attachments[0].fileName : 'No Attachment'}</span>
                        </div>
                        <div className="flex-1 bg-white rounded-lg border shadow-sm overflow-hidden flex items-center justify-center">
                            {pdfBlobUrl ? (
                                <iframe src={pdfBlobUrl} className="w-full h-full" title="Invoice PDF" />
                            ) : (
                                <div className="text-muted-foreground text-center">
                                    <p>No PDF Preview Available</p>
                                    <p className="text-xs mt-2">Format: {attachments[0]?.mimeType}</p>
                                </div>
                            )}
                        </div>
                    </div>
                }
                right={
                    <div className="h-full overflow-y-auto p-6 space-y-8">
                        {/* Header Details */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Invoice Date</label>
                                <input
                                    type="date"
                                    className="w-full p-2 rounded-md border bg-background"
                                    value={invoice.dateString || ''}
                                    onChange={(e) => setInvoice({ ...invoice, dateString: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Due Date</label>
                                <input
                                    type="date"
                                    className="w-full p-2 rounded-md border bg-background"
                                    value={invoice.dueDateString || ''}
                                    onChange={(e) => setInvoice({ ...invoice, dueDateString: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-sm font-medium">Reference</label>
                                <input
                                    type="text"
                                    className="w-full p-2 rounded-md border bg-background"
                                    value={invoice.reference}
                                    onChange={(e) => setInvoice({ ...invoice, reference: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Line Items</h3>
                                <button
                                    onClick={handleAddLine}
                                    className="text-xs flex items-center gap-1 text-primary hover:underline"
                                >
                                    <Plus className="w-3 h-3" /> Add Item
                                </button>
                            </div>

                            <div className="space-y-4">
                                {invoice.lineItems.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-start p-3 rounded-lg border bg-card/50">
                                        <div className="col-span-6 space-y-1">
                                            <input
                                                type="text"
                                                placeholder="Description"
                                                className="w-full p-1.5 text-sm rounded border bg-transparent"
                                                value={item.description}
                                                onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                                            />
                                            <select
                                                className="w-full p-1.5 text-xs rounded border bg-transparent text-muted-foreground"
                                                value={item.accountCode}
                                                onChange={(e) => handleLineItemChange(idx, 'accountCode', e.target.value)}
                                            >
                                                <option value="">Select Account...</option>
                                                {accounts.map((acc: any) => (
                                                    <option key={acc.accountID} value={acc.code}>
                                                        {acc.code} - {acc.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                className="w-full p-1.5 text-sm rounded border bg-transparent text-center"
                                                value={item.quantity}
                                                onChange={(e) => handleLineItemChange(idx, 'quantity', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                className="w-full p-1.5 text-sm rounded border bg-transparent text-right"
                                                value={item.unitAmount}
                                                onChange={(e) => handleLineItemChange(idx, 'unitAmount', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-1 flex justify-end pt-2">
                                            <button
                                                onClick={() => handleRemoveLine(idx)}
                                                className="text-muted-foreground hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end pt-4 border-t">
                            <div className="w-48 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${invoice.subTotal?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span>${invoice.totalTax?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span>Total</span>
                                    <span>${invoice.total?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            />
        </div>
    );
}
