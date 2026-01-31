import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from './Button';
import { User, Camera, Loader, Save } from 'lucide-react';

interface Profile {
    id: string;
    username: string;
    avatar_url: string | null;
    updated_at: string;
}

export const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            getProfile();
        }
    }, [user]);

    const getProfile = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data) {
                setUsername(data.username || '');
                setAvatarUrl(data.avatar_url);
            } else if (user?.user_metadata?.username) {
                // Fallback to metadata if no profile record yet
                setUsername(user.user_metadata.username);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async () => {
        try {
            setLoading(true);
            setMessage(null);

            const updates = {
                id: user?.id,
                username,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) throw error;
            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            // Also update local user metadata if possible, but upsert is mainly for table
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Error updating profile!' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                User Profile
            </h2>

            <div className="glass-card p-6 rounded-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer">
                        <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-cyber-cyan/50 flex items-center justify-center overflow-hidden">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User size={40} className="text-gray-400" />
                            )}
                        </div>
                        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={24} className="text-white" />
                        </div>
                        {/* Note: Real file upload requires bucket setup. For now this is just UI or we can implement text URL input */}
                    </div>
                    <p className="text-gray-400 mt-2 text-sm">{user?.email}</p>
                </div>

                <div className="space-y-4 max-w-md mx-auto">
                    {message && (
                        <div className={`p-3 rounded-xl border text-sm ${message.type === 'success'
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input-field"
                            placeholder="Enter username"
                        />
                    </div>

                    {/* 
                For a simple avatar implementation without bucket, we can let user paste a URL 
                or just stick to Username for now to avoid complexity of Storage buckets if not requested.
                I'll add a URL input for Avatar for now.
             */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Avatar URL</label>
                        <input
                            type="url"
                            value={avatarUrl || ''}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            className="input-field"
                            placeholder="https://example.com/avatar.png"
                        />
                    </div>

                    <div className="pt-4 space-y-4">
                        <Button onClick={updateProfile} disabled={loading} className="w-full">
                            {loading ? <Loader className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
                            Save Changes
                        </Button>

                        <div className="pt-6 border-t border-white/10">
                            <h3 className="text-red-400 font-bold mb-2">Danger Zone</h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Once you delete your data, there is no going back. Please be certain.
                            </p>
                            <Button
                                type="button"
                                onClick={async () => {
                                    if (confirm('Are you sure you want to delete ALL your expenses and budgets? This action cannot be undone.')) {
                                        setLoading(true);
                                        try {
                                            const { error: expError } = await supabase
                                                .from('expenses')
                                                .delete()
                                                .eq('user_id', user?.id);

                                            if (expError) throw expError;

                                            const { error: budError } = await supabase
                                                .from('budgets')
                                                .delete()
                                                .eq('user_id', user?.id);

                                            if (budError) throw budError;

                                            setMessage({ type: 'success', text: 'All data has been reset successfully.' });
                                        } catch (err) {
                                            console.error('Error resetting data:', err);
                                            setMessage({ type: 'error', text: 'Failed to reset data.' });
                                        } finally {
                                            setLoading(false);
                                        }
                                    }
                                }}
                                disabled={loading}
                                className="w-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30"
                            >
                                Reset Account Data
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
