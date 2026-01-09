import { Wallet } from 'lucide-react';
import { Button } from './ui/button';
import { Transaction } from '../lib/types';
import { formatDate } from '../lib/utils';

interface TokenCardProps {
  balance: number;
  transactions: Transaction[];
}

export function TokenCard({ balance, transactions }: TokenCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-brand/95 to-brand-hover text-white shadow-lg">
      <div className="flex items-start justify-between p-6">
        <div>
          <p className="text-sm text-white/80">Token Wallet</p>
          <p className="mt-1 text-3xl font-bold">{balance} tokens</p>
          <p className="text-white/80">Use tokens to post or boost jobs.</p>
          <div className="mt-4 flex gap-2">
            <Button variant="primary" size="sm" className="bg-white text-brand hover:bg-white/90">
              Buy tokens
            </Button>
            <Button variant="ghost" size="sm" className="bg-white/10 text-white hover:bg-white/20">
              Boost job
            </Button>
          </div>
        </div>
        <Wallet className="h-10 w-10 text-white/80" />
      </div>
      <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
        <p className="mb-2 text-sm font-semibold text-white/80">Recent activity</p>
        <div className="grid gap-2 text-sm">
          {transactions.slice(0, 4).map((txn) => (
            <div key={txn.id} className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
              <div>
                <p className="font-semibold">{txn.description}</p>
                <p className="text-xs text-white/70">{formatDate(txn.date)}</p>
              </div>
              <span className="font-bold">
                {txn.type === 'credit' ? '+' : '-'}
                {txn.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
