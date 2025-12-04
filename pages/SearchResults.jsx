import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { useAuth } from "../contexts/AuthProvider";
import NoteCard from "../components/NoteCard";
import ChatMessage from "../components/ChatMessage";

export default function SearchResults({ search }) {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        async function loadData() {
            const { data: notesData } = await supabase
                .from("notes")
                .select("*")
                .eq("user_id", user.id);

            setNotes(notesData || []);

            const { data: usersData } = await supabase
                .from("profiles")
                .select("*")
                .neq("id", user.id);

            setUsers(usersData || []);

            const { data: messagesData } = await supabase
                .from("messages")
                .select("*");

            setMessages(messagesData || []);
        }

        if (user) loadData();
    }, [user]);

    const filteredNotes = notes.filter(n =>
        n.title?.toLowerCase().includes(search.toLowerCase()) ||
        n.content?.toLowerCase().includes(search.toLowerCase())
    );

    const filteredUsers = users.filter(u =>
        (u.username || u.email).toLowerCase().includes(search.toLowerCase())
    );

    const filteredMessages = messages.filter(m =>
        m.text?.toLowerCase().includes(search.toLowerCase())
    );

    if (!search) return <p className="p-6 text-gray-400">Type something to search...</p>;

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="font-bold text-lg mb-2">Notes</h2>
                {filteredNotes.length ? (
                    filteredNotes.map(n => <NoteCard key={n.id} note={n} />)
                ) : (
                    <p className="text-gray-400">No matching notes found.</p>
                )}
            </div>

            <div>
                <h2 className="font-bold text-lg mb-2">Users</h2>
                {filteredUsers.length ? (
                    filteredUsers.map(u => (
                        <div key={u.id} className="p-2 border-b">
                            {u.username || u.email}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400">No matching users found.</p>
                )}
            </div>

            <div>
                <h2 className="font-bold text-lg mb-2">Messages</h2>
                {filteredMessages.length ? (
                    filteredMessages.map(m => <ChatMessage key={m.id} message={m} />)
                ) : (
                    <p className="text-gray-400">No matching messages found.</p>
                )}
            </div>
        </div>
    );
}
