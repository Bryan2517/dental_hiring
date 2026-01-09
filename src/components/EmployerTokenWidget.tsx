import { ArrowRight, ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WalletStats } from '../lib/types';
import { Button } from './ui/button';

interface EmployerTokenWidgetProps {
  wallet: WalletStats;
}

export function EmployerTokenWidget({ wallet }: EmployerTokenWidgetProps) {
  const progress = Math.max(0, Math.min(100, (1 - wallet.nextTierIn / 500) * 100));

  return (
    <div className="rounded-3xl border border-gray-100 bg-white/95 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Tokens from MR.BUR purchases</p>
          <p className="text-3xl font-bold text-gray-900">{wallet.balance.toLocaleString()} tokens</p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">{wallet.tier}</span>
            <span className="text-gray-500">Next tier in {wallet.nextTierIn} tokens</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link to="/employer/dashboard#wallet">View Wallet</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="#tokens">Learn how tokens work</a>
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs text-gray-500">Earned this month</p>
          <p className="text-xl font-semibold text-gray-900">+{wallet.earnedThisMonth}</p>
          <p className="text-xs text-emerald-600 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            12% vs last month
          </p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs text-gray-500">Spent this month</p>
          <p className="text-xl font-semibold text-gray-900">-{wallet.spentThisMonth}</p>
          <p className="text-xs text-amber-600 flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            8% lower
          </p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs text-gray-500">Next reward</p>
          <p className="text-xl font-semibold text-gray-900">VIP perks</p>
          <p className="text-xs text-gray-500">Faster shortlisting + boosts</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Progress to next tier</span>
          <span>{wallet.nextTierIn} tokens to go</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-5 grid gap-2 text-sm">
        {wallet.recentTransactions.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3">
            <div className="flex items-center gap-2">
              {item.delta > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
              ) : (
                <ArrowRight className="h-4 w-4 text-amber-600" />
              )}
              <span className="font-medium text-gray-800">{item.label}</span>
            </div>
            <span className={`text-sm font-semibold ${item.delta > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {item.delta > 0 ? '+' : ''}
              {item.delta} tokens
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
