import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './Button';
import { Mail, Lock, User, ArrowRight, Loader, Wallet } from 'lucide-react';

export const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            username: formData.username,
                        },
                    },
                });
                if (error) throw error;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)] overflow-hidden relative">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-purple/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-cyan/20 rounded-full blur-[100px]"></div>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-sm relative z-10">
                {/* Logo & Header */}
                <div className="text-center mb-6">
                    <div className="relative inline-block mb-4">
                        <div className="w-14 h-14 bg-gradient-to-tr from-cyber-cyan to-cyber-purple rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                            <Wallet className="text-white" size={28} />
                        </div>
                    </div>
                    <h2 className="text-lg font-bold text-white mb-1">
                        Expense <span className="text-cyber-cyan">Tracker</span>
                    </h2>
                    <h1 className="text-2xl font-bold text-white mb-1">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-gray-400 text-sm">
                        {isLogin ? 'Access your financial dashboard' : 'Start your financial journey'}
                    </p>
                </div>

                {/* Form Card */}
                <div className="glass-panel p-6 rounded-xl border border-white/10 shadow-2xl backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                <p className="font-semibold flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                    {error}
                                </p>
                            </div>
                        )}

                        {!isLogin && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Username</label>
                                <div className="relative group">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyber-cyan transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan text-sm"
                                        placeholder="Your username"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Email</label>
                            <div className="relative group">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyber-cyan transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan text-sm"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Password</label>
                            <div className="relative group">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyber-cyan transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan text-sm"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full py-3 text-sm shadow-lg shadow-purple-500/20">
                            {loading ? (
                                <Loader className="animate-spin" size={18} />
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight size={16} />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="mt-4 pt-4 border-t border-white/5 text-center">
                        <p className="text-gray-400 text-sm">
                            {isLogin ? "New here? " : "Have an account? "}
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-cyber-cyan hover:text-white font-semibold transition-colors"
                            >
                                {isLogin ? 'Create Account' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            {/* Copyright Footer */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-gray-600 text-xs">
                    © {new Date().getFullYear()} Bhumisvara. All rights reserved.
                </p>
            </div>
        </div>
    );
};
