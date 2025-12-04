import React from 'react';

export default function NoteCard({ note, onDelete, onEdit }) {
    return (
        <div className="bg-[#0a0a0a] p-4 rounded-2xl shadow-[0_0_20px_#00ffff] hover:shadow-[0_0_25px_#ff00ff] transition relative border border-[#00ffff] flex flex-col">

            
            <div className="text-[#00ffff]/70 text-xs mb-2">
                {new Date(note.created_at).toLocaleString()}
            </div>

           
            <div className="text-white font-bold text-lg whitespace-pre-wrap break-words drop-shadow-[0_0_10px_#ff00ff] mb-2">
                {note.title || 'Untitled'}
            </div>

           
            {note.content && (
                <div className="text-[#00ffff]/70 text-sm break-words whitespace-pre-wrap overflow-y-auto max-h-32 p-1 mb-2 drop-shadow-[0_0_5px_#00ffff]">
                    {note.content}
                </div>
            )}

        
            <div className="mt-auto flex gap-2">
                <button
                    onClick={() => onEdit && onEdit(note)}
                    className="text-[#ff00ff]/80 hover:text-[#ff00ff] text-sm px-3 py-1 rounded border border-[#ff00ff] hover:shadow-[0_0_10px_#ff00ff] transition"
                >
                    Edit
                </button>
                <button
                    onClick={() => onDelete && onDelete(note)}
                    className="text-[#00ffff]/80 hover:text-[#00ffff] text-sm px-3 py-1 rounded border border-[#00ffff] hover:shadow-[0_0_10px_#00ffff] transition"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
