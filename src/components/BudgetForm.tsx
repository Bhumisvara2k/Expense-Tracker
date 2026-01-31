import { useState } from 'react';
import { Button } from './Button';
import { IconComponent } from './IconComponent';

interface BudgetFormProps {
    category: any;
    currentBudget: number;
    onSave: (amount: number) => Promise<void>;
    onCancel: () => void;
}

export const BudgetForm = ({ category, currentBudget, onSave, onCancel }: BudgetFormProps) => {
    const [amount, setAmount] = useState(currentBudget.toString());
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onSave(parseFloat(amount));
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}15`, color: category.color }}
                >
                    <IconComponent name={category.icon} size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg">{category.name}</h3>
                    <p className="text-gray-400 text-sm">Set monthly budget goal</p>
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Budget Amount</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="input-field pl-10 text-xl font-bold"
                        placeholder="0.00"
                    />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                    Enter 0 to disable budget tracking for this category.
                </p>
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
                    Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Saving...' : 'Save Budget'}
                </Button>
            </div>
        </form>
    );
};
