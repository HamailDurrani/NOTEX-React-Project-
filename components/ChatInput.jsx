import React, { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthProvider";
import { Paperclip, Send } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../supabase/supabaseClient";

export default function ChatInput({ selectedUser, selectedGroup, onSend, allowFiles = true }) {
    const { user } = useAuth();
    const [text, setText] = useState("");
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef();

   
    const handleSendText = () => {
        if (!text.trim()) return;

        const newMsg = {
            temp_id: uuidv4(),
            sender: user.id,
            sender_email: user.email,
            receiver: selectedUser ? selectedUser.id : null,
            group_id: selectedGroup ? selectedGroup.id : null,
            text: text.trim(),
            file_url: null,
            file_type: null,
            created_at: new Date().toISOString(),
        };

        onSend(newMsg);
        setText("");
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const filePath = `chat-media/${user.id}/${Date.now()}-${file.name}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from("chat-media")
                .upload(filePath, file, { cacheControl: "3600", upsert: false });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from("chat-media").getPublicUrl(filePath);

            const newMsg = {
                temp_id: uuidv4(),
                sender: user.id,
                sender_email: user.email,
                receiver: selectedUser ? selectedUser.id : null,
                group_id: selectedGroup ? selectedGroup.id : null,
                text: "",
                file_url: data.publicUrl,
                file_type: file.type,
                created_at: new Date().toISOString(),
            };

            onSend(newMsg);
        } catch (err) {
            console.error("Upload failed:", err.message || err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-800 flex gap-2 items-center">
            {allowFiles && (
                <>
                    <button
                        type="button"
                        onClick={() => fileRef.current.click()}
                        disabled={uploading}
                        className="p-2 rounded hover:bg-gray-700"
                    >
                        <Paperclip size={18} />
                    </button>
                    <input
                        ref={fileRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                </>
            )}

            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 p-2 rounded text-white"
                disabled={uploading}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendText();
                    }
                }}
            />

            <button
                onClick={handleSendText}
                disabled={!text.trim() && uploading}
                className="bg-blue-600 px-4 py-2 rounded flex items-center"
            >
                <Send size={16} />
            </button>
        </div>
    );
}







