import { WalletStats } from '../lib/types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { TagPill } from './TagPill';

interface TokenWalletPanelProps {
  wallet: WalletStats;
}

export function TokenWalletPanel({ wallet }: TokenWalletPanelProps) {
  const progress = Math.max(0, Math.min(100, (1 - wallet.nextTierIn / 500) * 100));

  return (
    <Card id="wallet" className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand">Token Wallet</p>
          <p className="text-3xl font-bold text-gray-900">{wallet.balance.toLocaleString()} tokens</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="info">{wallet.tier} tier</Badge>
            <span className="text-xs text-gray-500">Next tier in {wallet.nextTierIn} tokens</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            Buy tokens
          </Button>
          <Button variant="outline" size="sm">
            Download statement
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs text-gray-500">Earned this month</p>
          <p className="text-xl font-semibold text-gray-900">+{wallet.earnedThisMonth}</p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs text-gray-500">Spent this month</p>
          <p className="text-xl font-semibold text-gray-900">-{wallet.spentThisMonth}</p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs text-gray-500">Next reward tier</p>
          <p className="text-xl font-semibold text-gray-900">{wallet.nextTierIn} tokens</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Reward progress</span>
          <span>{wallet.nextTierIn} tokens to go</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <TagPill label="Job post: 15 tokens" />
        <TagPill label="Boost: 10 tokens" />
        <TagPill label="Featured: 25 tokens" />
      </div>
    </Card>
  );
}
