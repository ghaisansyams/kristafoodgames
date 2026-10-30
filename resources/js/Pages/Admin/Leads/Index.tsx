import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Download, Mail, Handshake } from 'lucide-react';

interface DecisionResult {
    role: string | null;
    product: string | null;
}

interface LeadRow {
    id: number;
    name: string;
    company: string;
    job_title: string;
    contact: string;
    email_sent_at: string | null;
    handoff_requested_at: string | null;
    created_at: string;
    decision_results: DecisionResult[];
}

export default function Index({ leads }: { leads: LeadRow[] }) {
    return (
        <AdminLayout title="Leads">
            <Head title="Leads" />

            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    Every visitor captured through either experience, newest first.
                </p>
                <a
                    href={route('admin.leads.export')}
                    className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                    <Download className="h-4 w-4" /> Export CSV
                </a>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                        <tr>
                            <th className="px-5 py-3">Visitor</th>
                            <th className="px-5 py-3">Contact</th>
                            <th className="px-5 py-3">Decision Lab</th>
                            <th className="px-5 py-3">Follow-up</th>
                            <th className="px-5 py-3">Captured</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {leads.map((lead) => (
                            <tr key={lead.id}>
                                <td className="px-5 py-3">
                                    <p className="font-semibold text-slate-900">{lead.name}</p>
                                    <p className="text-slate-500">{lead.company} · {lead.job_title}</p>
                                </td>
                                <td className="px-5 py-3 text-slate-600">{lead.contact}</td>
                                <td className="px-5 py-3">
                                    {lead.decision_results.length === 0 && <span className="text-slate-400">—</span>}
                                    {lead.decision_results.map((r, i) => (
                                        <div key={i} className="text-xs text-slate-600">
                                            <span className="font-bold text-slate-900">{r.product ?? '—'}</span>
                                            {r.role && <span> · {r.role === 'converter' ? 'Converter' : 'Brand Owner'}</span>}
                                        </div>
                                    ))}
                                </td>
                                <td className="px-5 py-3">
                                    <div className="flex gap-2">
                                        {lead.email_sent_at && (
                                            <span title="Result emailed">
                                                <Mail className="h-4 w-4 text-emerald-600" />
                                            </span>
                                        )}
                                        {lead.handoff_requested_at && (
                                            <span title="Talk to expert requested">
                                                <Handshake className="h-4 w-4 text-amber-600" />
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-5 py-3 text-xs text-slate-400">{new Date(lead.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                        {leads.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                                    No leads captured yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
