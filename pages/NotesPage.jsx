import { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";
import { useAuth } from "../contexts/AuthProvider";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import NoteCard from "../components/NoteCard";
import toast, { Toaster } from "react-hot-toast";

export default function NotesPage({ search = "", setSearch }) {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    useEffect(() => {
        async function loadNotes() {
            const { data, error } = await supabase
                .from("notes")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) toast.error(error.message);
            else setNotes(data || []);
            setLoading(false);
        }
        if (user) loadNotes();
    }, [user]);

    
    const filteredNotes = notes.filter(n =>
        n.title?.toLowerCase().includes(search.toLowerCase()) ||
        n.content?.toLowerCase().includes(search.toLowerCase())
    );

    const openModal = (note = null) => {
        setEditingNote(note);
        setTitle(note?.title || "");
        setContent(note?.content || "");
        setModalOpen(true);
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingNote(null);
        setTitle("");
        setContent("");
        document.body.style.overflow = "auto";
    };

    const saveNote = async (e) => {
        e.preventDefault();
        if (!title && !content) return toast.error("Note cannot be empty");

        if (editingNote) {
            const { data, error } = await supabase
                .from("notes")
                .update({ title, content })
                .eq("id", editingNote.id)
                .select();

            if (error) toast.error(error.message);
            else {
                setNotes(notes.map(n => n.id === editingNote.id ? data[0] : n));
                toast.success("Note updated!");
            }
        } else {
            const { data, error } = await supabase
                .from("notes")
                .insert([{ title, content, user_id: user.id }])
                .select();

            if (error) toast.error(error.message);
            else {
                setNotes([data[0], ...notes]);
                toast.success("Note created!");
            }
        }

        closeModal();
    };

    const deleteNote = async (note) => {
        const { error } = await supabase
            .from("notes")
            .delete()
            .eq("id", note.id);

        if (error) toast.error(error.message);
        else {
            setNotes(notes.filter(n => n.id !== note.id));
            toast.success("Note deleted!");
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0f0f0f] text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              
                <Navbar search={search} setSearch={setSearch} user={user} />

                <div className="flex justify-between items-center p-6">
                    <h1 className="text-3xl font-bold text-white">Your Notes</h1>
                    <button
                        onClick={() => openModal()}
                        className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 neon-button transition font-semibold"
                    >
                        + Create Note
                    </button>
                </div>

                {loading ? (
                    <p className="text-center mt-10">Loading notes...</p>
                ) : filteredNotes.length === 0 ? (
                    <p className="text-center mt-10 text-gray-400 text-lg">
                        No matching notes found.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {filteredNotes.map(note => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                onEdit={() => openModal(note)}
                                onDelete={() => deleteNote(note)}
                            />
                        ))}
                    </div>
                )}

                
                {modalOpen && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                        <form
                            onSubmit={saveNote}
                            className="bg-[#1a1a1a] p-6 rounded-2xl w-full max-w-md shadow-lg flex flex-col gap-4 neon-form"
                        >
                            <h2 className="text-xl font-bold text-center neon-text">
                                {editingNote ? "Edit Note" : "Create Note"}
                            </h2>
                            <input
                                type="text"
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="p-3 rounded-xl bg-[#111] outline-none text-white placeholder-gray-400"
                            />
                            <textarea
                                placeholder="Write your note..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="p-3 rounded-xl bg-[#111] outline-none text-white resize-none h-32"
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 neon-button"
                                >
                                    {editingNote ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <Toaster position="top-center" />

                <style>
                    {`
                        .neon-button {
                            box-shadow: 0 0 5px #0ff, 0 0 10px #0ff, 0 0 20px #0ff;
                        }
                        .neon-form {
                            box-shadow: 0 0 10px #0ff, 0 0 20px #0ff, 0 0 30px #0ff;
                        }
                        .neon-text {
                            text-shadow: 0 0 5px #0ff, 0 0 10px #0ff, 0 0 20px #0ff;
                        }
                    `}
                </style>
            </div>
        </div>
    );
}

