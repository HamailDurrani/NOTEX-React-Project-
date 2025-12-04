import React from 'react';
import { MessageSquare, FileText, Plus, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';


function NavItem({ to, icon: Icon, label }) {
    const location = useLocation();
    const active = location.pathname === to;
    return (
        <Link to={to} className={`flex items-center gap-3 px-4 py-2 rounded-lg ${active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-900'}`}>
            <Icon size={18} />
            <span className="font-medium">{label}</span>
        </Link>
    );
}


export default function Sidebar() {
    return (
        <aside className="w-72 bg-slate-900 p-4 flex flex-col gap-4 h-screen border-r border-slate-800">
            <div className="flex items-center justify-between">
                <div className="text-slate-200 font-semibold">Workspaces</div>
                <button className="p-2 rounded-md bg-slate-800 hover:bg-slate-700"><Plus size={16} /></button>
            </div>


            <div className="space-y-2">
                <NavItem to="/" icon={FileText} label="Notes" />
                <NavItem to="/chat" icon={MessageSquare} label="Chat" />
                <NavItem to="/teams" icon={Users} label="Teams" />
            </div>


            <div className="mt-auto text-slate-400 text-xs">Tip: drag & drop files into chat to upload</div>
        </aside>
    );
}