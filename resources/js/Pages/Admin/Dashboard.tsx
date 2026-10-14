import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Users, Target, Handshake, ListChecks } from 'lucide-react';

interface Stats {
    visitors: number;
    decision_sessions_completed: number;
    decision_sessions_started: number;
    handoffs_requested: number;
}

export default function Dashboard({ stats }: { stats: Stats }) {
    const cards = [
        { label: 'Total Visitors', value: stats.visitors, icon: Users },
        { label: 'Decision Lab Completed', value: stats.decision_sessions_completed, icon: Target },
        { label: 'Decision Lab Started', value: stats.decision_sessions_started, icon: ListChecks },
        { label: 'Handoffs Requested', value: stats.handoffs_requested, icon: Handshake },
    ];

    return (
        <AdminLayout title="Dashboard">
            <Head title="Admin Dashboard" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => {
                    const CardIcon = card.icon;
                    return (
                        <div key={card.label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                <CardIcon className="h-6 w-6" />
                            </span>
                            <div>
                                <p className="text-3xl font-black text-slate-900">{card.value}</p>
                                <p className="text-sm text-slate-500">{card.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </AdminLayout>
    );
}
