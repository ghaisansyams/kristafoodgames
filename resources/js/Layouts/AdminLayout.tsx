import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';
import {
    LayoutDashboard,
    Briefcase,
    MapPin,
    ListOrdered,
    Package,
    Users,
    LogOut,
} from 'lucide-react';

const NAV = [
    { href: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: 'admin.business-cases.index', label: 'Business Cases', icon: Briefcase },
    { href: 'admin.markets.index', label: 'Markets', icon: MapPin },
    { href: 'admin.priorities.index', label: 'Priorities', icon: ListOrdered },
    { href: 'admin.packaging-options.index', label: 'Packaging Options', icon: Package },
    { href: 'admin.leads.index', label: 'Leads', icon: Users },
];

export default function AdminLayout({ title, children }: PropsWithChildren<{ title: ReactNode }>) {
    const user = usePage().props.auth.user;

    return (
        <div className="flex min-h-screen bg-slate-50">
            <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-6 py-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">KRISTA FOOD 2026</p>
                    <p className="text-lg font-black text-slate-900">Content Admin</p>
                </div>
                <nav className="flex-1 space-y-1 p-3">
                    {NAV.map((item) => {
                        const active = route().current(item.href) || route().current(`${item.href.replace('.index', '')}.*`);
                        const ItemIcon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={route(item.href)}
                                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                    active
                                        ? 'bg-emerald-700 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <ItemIcon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="border-t border-slate-200 p-4">
                    <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="mt-3 flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                        <LogOut className="h-4 w-4" />
                        Log Out
                    </Link>
                </div>
            </aside>

            <div className="flex-1">
                <header className="border-b border-slate-200 bg-white px-8 py-5">
                    <h1 className="text-2xl font-black text-slate-900">{title}</h1>
                </header>
                <main className="p-8">{children}</main>
            </div>
        </div>
    );
}
