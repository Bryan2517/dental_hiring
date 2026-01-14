import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../lib/utils';
export function Tabs({ tabs, active, onChange, className }) {
    return (_jsx("div", { className: cn('flex flex-wrap gap-2 rounded-xl border border-gray-100 bg-white p-2', className), children: tabs.map((tab) => {
            const isActive = tab.id === active;
            return (_jsx("button", { onClick: () => onChange(tab.id), className: cn('rounded-lg px-4 py-2 text-sm font-medium transition', isActive
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'), children: tab.label }, tab.id));
        }) }));
}
