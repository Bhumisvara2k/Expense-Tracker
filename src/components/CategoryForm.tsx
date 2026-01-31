import { useState } from 'react';
import { Type } from 'lucide-react';
import { Button } from './Button';
import { IconComponent, iconNames } from './IconComponent';

interface CategoryFormProps {
    onSuccess: (category: { name: string; color: string; icon: string }, initialBudget?: number) => Promise<void>;
    onCancel: () => void;
}

const PRESET_COLORS = [
    '#FF5733', // Red-Orange
    '#33FF57', // Green
    '#3357FF', // Blue
    '#F333FF', // Magenta
    '#FF3333', // Red
    '#33FFF5', // Cyan
    '#F5FF33', // Yellow
    '#FF8C33', // Orange
    '#33FF8C', // Mint
    '#8C33FF', // Purple
    '#FFB833', // Gold
    '#00F2FF', // Neon Cyan
];

export const CategoryForm = ({ onSuccess, onCancel }: CategoryFormProps) => {
    const [name, setName] = useState('');
    const [budget, setBudget] = useState('');
    const [color, setColor] = useState(PRESET_COLORS[0]);
    const [icon, setIcon] = useState(iconNames[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await onSuccess({ name, color, icon }, budget ? parseFloat(budget) : 0);
            setName('');
            setBudget('');
            setColor(PRESET_COLORS[0]);
            setIcon(iconNames[0]);
        } catch (err: any) {
            setError(err.message || 'Failed to add category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Category Name</label>
                <div className="relative">
                    <Type size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field pl-11"
                        placeholder="e.g., Crypto, Gaming..."
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Add Amount</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="input-field pl-10"
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Color</label>
                <div className="grid grid-cols-6 gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
                    {PRESET_COLORS.map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setColor(c)}
                            className={`w-8 h-8 rounded-lg transition-all duration-300 ${color === c ? 'scale-110 ring-2 ring-white' : 'hover:scale-105 opacity-70 hover:opacity-100'
                                }`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Icon</label>
                <div className="grid grid-cols-6 gap-2 bg-white/5 p-3 rounded-xl border border-white/10 max-h-40 overflow-y-auto custom-scrollbar">
                    {iconNames.map((iconName) => (
                        <button
                            key={iconName}
                            type="button"
                            onClick={() => setIcon(iconName)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${icon === iconName
                                ? 'bg-cyber-cyan text-black scale-110'
                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <IconComponent name={iconName} size={18} />
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={onCancel} type="button" className="flex-1">
                    Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Adding...' : 'Create Category'}
                </Button>
            </div>
        </form>
    );
};
