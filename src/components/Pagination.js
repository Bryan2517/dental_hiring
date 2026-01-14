import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
export function Pagination({ page, totalPages, onChange }) {
    const canPrev = page > 1;
    const canNext = page < totalPages;
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
    return (_jsxs("div", { className: "flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-700", children: [_jsxs("span", { children: ["Page ", page, " of ", totalPages] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => canPrev && onChange(page - 1), disabled: !canPrev, icon: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), pageNumbers.map((pageNumber) => (_jsx(Button, { variant: pageNumber === page ? 'primary' : 'outline', size: "sm", onClick: () => onChange(pageNumber), children: pageNumber }, pageNumber))), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => canNext && onChange(page + 1), disabled: !canNext, icon: _jsx(ChevronRight, { className: "h-4 w-4" }) })] })] }));
}
