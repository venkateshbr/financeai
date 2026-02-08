import { useEffect, useState } from 'react';
import { FileText, Eye, DollarSign, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

interface Invoice {
    invoiceID: string;
    invoiceNumber: string;
    reference: string;
    contact: { name: string };
    dateString?: string;
    dueDateString?: string;
    date?: string; // Fallback
    dueDate?: string; // Fallback
    total: number;
    status: string;
}

const formatDate = (date: any) => {
    if (!date) return 'N/A';
    // Handle specific Microsoft format if needed, but usually new Date parses it or we need regex
    // Xero sometimes sends /Date(123456789+0000)/
    if (typeof date === 'string' && date.includes('/Date(')) {
        const timestamp = parseInt(date.replace(/\D/g, ''));
        if (!isNaN(timestamp)) return new Date(timestamp).toLocaleDateString();
    }
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleDateString();
};

export default function InternalReview() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await fetch('http://localhost:3156/api/xero/invoices');
                if (res.ok) {
                    const data = await res.json();
                    console.log("Fetched Invoices:", data); // Debug log
                    setInvoices(data);
                }
            } catch (error) {
                console.error("Failed to fetch invoices", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    if (loading) return <div className="p-8">Loading review queue...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Review Queue</h1>
                <div className="text-sm text-muted-foreground">
                    {invoices.length} documents pending review
                </div>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-0">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                                <th className="p-4 font-medium">Document</th>
                                <th className="p-4 font-medium">Client</th>
                                <th className="p-4 font-medium">Dates</th>
                                <th className="p-4 font-medium">Amount</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">No pending invoices.</td>
                                </tr>
                            ) : (
                                invoices.map((invoice) => (
                                    <tr key={invoice.invoiceID} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="p-4 font-medium">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-primary" />
                                                <div>
                                                    <div className="font-semibold">{invoice.reference || 'No Ref'}</div>
                                                    <div className="text-xs text-muted-foreground">{invoice.invoiceNumber}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">{invoice.contact?.name}</td>
                                        <td className="p-4 text-muted-foreground">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1 text-xs">
                                                    <Calendar className="w-3 h-3" /> Issued: {formatDate(invoice.dateString || invoice.date)}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-red-500">
                                                    <Calendar className="w-3 h-3" /> Due: {formatDate(invoice.dueDateString || invoice.dueDate)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium">
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="w-3 h-3 text-muted-foreground" />
                                                {invoice.total?.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link to={`/internal/reviews/${invoice.invoiceID}`}>
                                                <button className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-xs font-medium transition-colors inline-flex items-center gap-2">
                                                    <Eye className="w-3 h-3" /> Review
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
