import { FileText, CheckCircle, XCircle, Eye } from "lucide-react";

export default function InternalReview() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Review Queue</h1>
                <div className="text-sm text-muted-foreground">
                    15 documents pending review
                </div>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-0">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                                <th className="p-4 font-medium">Document</th>
                                <th className="p-4 font-medium">Client</th>
                                <th className="p-4 font-medium">Uploaded</th>
                                <th className="p-4 font-medium">Size</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="p-4 font-medium flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-primary" />
                                        Invoice_00{i}.pdf
                                    </td>
                                    <td className="p-4">Acme Corp</td>
                                    <td className="p-4 text-muted-foreground">Oct {10 + i}, 2023</td>
                                    <td className="p-4 text-muted-foreground">1.{i} MB</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 hover:bg-muted rounded-full transition-colors" title="View">
                                                <Eye className="w-4 h-4 text-foreground" />
                                            </button>
                                            <button className="p-2 hover:bg-green-500/10 rounded-full transition-colors text-green-600" title="Approve">
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-red-500/10 rounded-full transition-colors text-red-600" title="Reject">
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
