import React from 'react';
import { LogOut, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';
import { supabase } from '../supabase/supabaseClient';

export default function Navbar({ search, setSearch }) {
    const { user } = useAuth();

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    async function logout() {
        await supabase.auth.signOut();
    }

    return (
        <header className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-black shadow-lg">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    NX
                </div>
                <div>
                    <h1 className="text-white font-semibold text-lg">Notex</h1>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative hidden md:block">
                    <input
                        type="text"
                        placeholder="Search notes, messages, users..."
                        value={search}
                        onChange={handleSearchChange}
                        className="pl-10 pr-4 py-2 rounded-full bg-slate-900 text-sm placeholder:text-slate-500 outline-none w-72"
                    />
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                </div>
                <div className="flex items-center gap-3">
                                  {user && (
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={user?.user_metadata?.avatar || `https://api.dicebear.com/6.x/pixel-art/svg?seed=${user.id}`}
                                                alt="avatar"
                                                className="w-9 h-9 rounded-full ring-1 ring-slate-700"
                                            />
                                            <div className="text-sm text-slate-200">
                                                <div className="font-medium">{user.email}</div>
                                                <div className="text-xs text-slate-400">Online</div>
                                            </div>
                                        </div>
                                    )}


                                    <button onClick={logout} className="p-2 rounded-full hover:bg-slate-800">
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            </div>
                        </header>
    );
}

