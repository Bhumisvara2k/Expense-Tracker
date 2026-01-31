import { LayoutDashboard, History, User, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Tab = 'dashboard' | 'history' | 'profile';

interface SidebarProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
    const { user, signOut } = useAuth();

    const menuItems = [
        { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'history' as Tab, label: 'History', icon: History },
        { id: 'profile' as Tab, label: 'Profile', icon: User },
    ];

    return (
        <div className="w-64 h-screen fixed left-0 top-0 bg-[#0f1016]/95 backdrop-blur-xl border-r border-white/5 flex flex-col z-50 transition-all duration-300">
            {/* Logo Area */}
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyber-cyan to-cyber-purple flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Wallet className="text-white" size={20} />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Expense <span className="text-cyber-cyan">Tracker</span>
                    </h1>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 space-y-2">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Menu</p>

                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                ? 'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <Icon
                                size={20}
                                className={`transition-colors duration-300 ${isActive ? 'text-cyber-cyan' : 'text-gray-500 group-hover:text-white'}`}
                            />
                            <span className="font-medium">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyber-cyan shadow-[0_0_10px_currentColor]"></div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* User Footer */}
            <div className="p-4 border-t border-white/5">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyber-purple to-cyber-magenta flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-purple-500/20">
                            {user?.email?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.user_metadata?.username || 'User'}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={signOut}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all text-xs font-semibold border border-red-500/20"
                    >
                        <LogOut size={14} />
                        Sign Out
                    </button>
                </div>

                {/* Copyright */}
                <p className="text-center text-gray-600 text-xs mt-3">
                    © {new Date().getFullYear()} Bhumisvara
                </p>
            </div>
        </div>
    );
};
