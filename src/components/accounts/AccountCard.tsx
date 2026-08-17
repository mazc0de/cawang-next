'use client';
import type { Account } from '@/types/domain';
import { formatRupiah, cn } from '@/lib/utils';
import { Pencil, Trash2, ArrowRightLeft, Landmark, Smartphone, Banknote } from 'lucide-react';

export type AccountWithBalance = Account & { actual_balance: number };

interface AccountCardProps {
    account: AccountWithBalance;
    onEdit: (account: AccountWithBalance) => void;
    onDelete: (account: AccountWithBalance) => void;
    onReconcile: (account: AccountWithBalance) => void;
}

export function AccountCard({ account, onEdit, onDelete, onReconcile }: AccountCardProps) {
    const typeMap: Record<string, { label: string; bg: string; icon: any }> = {
        bank: { label: 'Bank', bg: 'bg-mint', icon: Landmark },
        e_wallet: { label: 'E-Wallet', bg: 'bg-lilac', icon: Smartphone },
        cash: { label: 'Tunai', bg: 'bg-canary', icon: Banknote },
    };

    const currentType = typeMap[account.type] || {
        label: account.type,
        bg: 'bg-canvas',
        icon: Landmark,
    };
    const Icon = currentType.icon;

    return (
        <div id={`account-card-${account.id}`} className="card-neubrutalism bg-white p-5 flex flex-col justify-between gap-5 group hover:-translate-y-1 transition-transform">
            {/* Top: Icon + Name + Badge */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={cn('w-11 h-11 rounded-[12px] border-2 border-ink flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#111111]', currentType.bg)}>
                        <Icon className="h-5 w-5 text-ink" strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-archivo-black text-lg text-ink truncate leading-tight">{account.name}</h3>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-canvas border border-ink font-space-mono text-[10px] font-bold text-ink uppercase">{currentType.label}</span>
                    </div>
                </div>
            </div>

            {/* Middle: Balance */}
            <div className="p-3.5 rounded-[14px] bg-canvas border-2 border-ink shadow-hard-sm">
                <p className="font-space-grotesk font-bold text-[11px] uppercase tracking-wider text-ink/60">Saldo Saat Ini</p>
                <p className="font-space-mono font-bold text-2xl text-ink tracking-tight truncate mt-1">{formatRupiah(account.actual_balance)}</p>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-5 border-t-2 border-ink/10">
                <button
                    id={`btn-reconcile-${account.id}`}
                    onClick={() => onReconcile(account)}
                    title="Sesuaikan Saldo (Reconcile)"
                    className="btn-neubrutalism bg-canvas text-ink text-xs px-3 py-1.5 font-space-grotesk flex items-center gap-1.5 hover:bg-canary"
                >
                    <ArrowRightLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Reconcile
                </button>

                <div className="flex items-center gap-1.5">
                    <button
                        id={`btn-edit-${account.id}`}
                        onClick={() => onEdit(account)}
                        title="Edit Akun"
                        className="w-8 h-8 rounded-full border-2 border-ink bg-white hover:bg-canvas flex items-center justify-center text-ink transition-colors cursor-pointer shadow-[1px_1px_0px_0px_#111]"
                    >
                        <Pencil className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                    <button
                        id={`btn-delete-${account.id}`}
                        onClick={() => onDelete(account)}
                        title="Hapus Akun"
                        className="w-8 h-8 rounded-full border-2 border-ink bg-white hover:bg-coral/20 hover:text-coral flex items-center justify-center text-ink transition-colors cursor-pointer shadow-[1px_1px_0px_0px_#111]"
                    >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </div>
    );
}
