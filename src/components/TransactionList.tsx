import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Transaction } from '../lib/types';
import { formatDate } from '../lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
        <p className="text-sm text-gray-600">Mock wallet ledger</p>
      </div>
      <div className="divide-y divide-gray-100">
        {transactions.map((txn) => (
          <div key={txn.id} className="flex items-center justify-between px-5 py-3 text-sm">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  txn.type === 'credit' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {txn.type === 'credit' ? (
                  <ArrowDownRight className="h-4 w-4" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
              </span>
              <div>
                <p className="font-semibold text-gray-800">{txn.description}</p>
                <p className="text-xs text-gray-500">{formatDate(txn.date)}</p>
              </div>
            </div>
            <span className="font-semibold text-gray-800">
              {txn.type === 'credit' ? '+' : '-'}
              {txn.amount} tokens
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
