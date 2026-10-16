import { FormEvent, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import FlashBanner from '@/Components/Admin/FlashBanner';
import ConfirmDeleteButton from '@/Components/Admin/ConfirmDeleteButton';
import { Plus, Pencil } from 'lucide-react';

const FACTORS = ['protection', 'shelf_life', 'cost', 'sustainability', 'convenience', 'presentation'] as const;

interface Scores {
    protection: number;
    shelf_life: number;
    cost: number;
    sustainability: number;
    convenience: number;
    presentation: number;
}

interface PackagingOptionRow {
    id: number;
    business_case_id: number;
    business_case: { id: number; title: string } | null;
    label: string;
    description: string;
    applicable_markets: string[] | null;
    scores: Scores;
    sort_order: number;
}

interface BusinessCaseOption {
    id: number;
    title: string;
}

interface MarketOption {
    id: number;
    slug: string;
    title: string;
}

const EMPTY_SCORES: Scores = {
    protection: 3,
    shelf_life: 3,
    cost: 3,
    sustainability: 3,
    convenience: 3,
    presentation: 3,
};

export default function Index({
    businessCases,
    markets,
    packagingOptions,
}: {
    businessCases: BusinessCaseOption[];
    markets: MarketOption[];
    packagingOptions: PackagingOptionRow[];
}) {
    const [editing, setEditing] = useState<PackagingOptionRow | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [filterBusinessCase, setFilterBusinessCase] = useState<number | 'all'>('all');

    const form = useForm({
        business_case_id: businessCases[0]?.id ?? 0,
        label: '',
        description: '',
        applicable_markets: [] as string[],
        scores: { ...EMPTY_SCORES },
        sort_order: 1,
    });

    function openCreate() {
        form.clearErrors();
        form.setData({
            business_case_id: businessCases[0]?.id ?? 0,
            label: '',
            description: '',
            applicable_markets: [],
            scores: { ...EMPTY_SCORES },
            sort_order: 1,
        });
        setEditing(null);
        setShowForm(true);
    }

    function openEdit(row: PackagingOptionRow) {
        form.clearErrors();
        form.setData({
            business_case_id: row.business_case_id,
            label: row.label,
            description: row.description,
            applicable_markets: row.applicable_markets ?? [],
            scores: { ...row.scores },
            sort_order: row.sort_order,
        });
        setEditing(row);
        setShowForm(true);
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        if (editing) {
            form.put(route('admin.packaging-options.update', editing.id), { onSuccess: () => setShowForm(false) });
        } else {
            form.post(route('admin.packaging-options.store'), { onSuccess: () => setShowForm(false) });
        }
    }

    function toggleMarket(slug: string) {
        const current = form.data.applicable_markets;
        form.setData(
            'applicable_markets',
            current.includes(slug) ? current.filter((m) => m !== slug) : [...current, slug],
        );
    }

    const visibleOptions =
        filterBusinessCase === 'all'
            ? packagingOptions
            : packagingOptions.filter((o) => o.business_case_id === filterBusinessCase);

    return (
        <AdminLayout title="Packaging Options">
            <Head title="Packaging Options" />
            <FlashBanner />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-2xl text-sm text-slate-500">
                    The 3 solutions shown per business case at Stage 6, with the 1–5 factor scores the scoring engine
                    uses. These are placeholder game-model values — replace them with figures validated by the
                    Krista Food product/technical team.
                </p>
                <div className="flex items-center gap-3">
                    <select
                        className="rounded-md border-gray-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        value={filterBusinessCase}
                        onChange={(e) => setFilterBusinessCase(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    >
                        <option value="all">All business cases</option>
                        {businessCases.map((bc) => (
                            <option key={bc.id} value={bc.id}>
                                {bc.title}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={openCreate}
                        className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                    >
                        <Plus className="h-4 w-4" /> Add Option
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                        <tr>
                            <th className="px-5 py-3">Business Case</th>
                            <th className="px-5 py-3">Label</th>
                            {FACTORS.map((f) => (
                                <th key={f} className="px-3 py-3 text-center capitalize">
                                    {f.replace('_', ' ')}
                                </th>
                            ))}
                            <th className="px-5 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {visibleOptions.map((row) => (
                            <tr key={row.id}>
                                <td className="px-5 py-3 text-slate-600">{row.business_case?.title}</td>
                                <td className="px-5 py-3 font-semibold text-slate-900">
                                    {row.label}
                                    <p className="font-normal text-slate-500">{row.description}</p>
                                </td>
                                {FACTORS.map((f) => (
                                    <td key={f} className="px-3 py-3 text-center font-mono text-slate-700">
                                        {row.scores[f]}
                                    </td>
                                ))}
                                <td className="px-5 py-3">
                                    <div className="flex items-center justify-end gap-3">
                                        <button onClick={() => openEdit(row)} className="text-slate-400 hover:text-emerald-700">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <ConfirmDeleteButton
                                            href={route('admin.packaging-options.destroy', row.id)}
                                            confirmText={`Delete "${row.label}"?`}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {visibleOptions.length === 0 && (
                            <tr>
                                <td colSpan={9} className="px-5 py-8 text-center text-slate-400">
                                    No packaging options yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal show={showForm} onClose={() => setShowForm(false)} maxWidth="2xl">
                <form onSubmit={submit} className="max-h-[85vh] overflow-y-auto p-6">
                    <h2 className="text-lg font-bold text-slate-900">{editing ? 'Edit Packaging Option' : 'Add Packaging Option'}</h2>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel value="Business Case" />
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                value={form.data.business_case_id}
                                onChange={(e) => form.setData('business_case_id', Number(e.target.value))}
                            >
                                {businessCases.map((bc) => (
                                    <option key={bc.id} value={bc.id}>
                                        {bc.title}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.business_case_id} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel value="Sort Order (A, B, C → 1, 2, 3)" />
                            <TextInput type="number" className="mt-1 block w-full" value={form.data.sort_order} onChange={(e) => form.setData('sort_order', Number(e.target.value))} />
                            <InputError message={form.errors.sort_order} className="mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel value="Label" />
                            <TextInput className="mt-1 block w-full" value={form.data.label} onChange={(e) => form.setData('label', e.target.value)} placeholder="Coffee Bag — Vertical Pack & Vacuum Sealing" />
                            <InputError message={form.errors.label} className="mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel value="Description" />
                            <TextInput className="mt-1 block w-full" value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                            <InputError message={form.errors.description} className="mt-1" />
                        </div>

                        <div className="sm:col-span-2">
                            <InputLabel value="Applicable Markets (leave empty for all markets)" />
                            <div className="mt-2 flex flex-wrap gap-2">
                                {markets.map((m) => (
                                    <button
                                        type="button"
                                        key={m.slug}
                                        onClick={() => toggleMarket(m.slug)}
                                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                            form.data.applicable_markets.includes(m.slug)
                                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                                : 'border-slate-300 text-slate-600'
                                        }`}
                                    >
                                        {m.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <InputLabel value="Scores (1–5)" />
                            <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
                                {FACTORS.map((factor) => (
                                    <div key={factor}>
                                        <label className="text-xs font-semibold capitalize text-slate-600">
                                            {factor.replace('_', ' ')}
                                        </label>
                                        <input
                                            type="range"
                                            min={1}
                                            max={5}
                                            value={form.data.scores[factor]}
                                            onChange={(e) =>
                                                form.setData('scores', { ...form.data.scores, [factor]: Number(e.target.value) })
                                            }
                                            className="mt-1 w-full accent-emerald-600"
                                        />
                                        <p className="text-center text-sm font-bold text-slate-900">{form.data.scores[factor]}</p>
                                    </div>
                                ))}
                            </div>
                            <InputError message={form.errors['scores.protection' as never]} className="mt-1" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setShowForm(false)} className="text-sm font-semibold text-slate-500">
                            Cancel
                        </button>
                        <PrimaryButton disabled={form.processing}>{editing ? 'Save Changes' : 'Create'}</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
