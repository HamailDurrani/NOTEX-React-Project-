import React from "react";
import { useAuth } from "../contexts/AuthProvider";

export default function ChatMessage({ message }) {
    const { user } = useAuth();
    const mine = message.sender === user.id;

    return (
        <div className={`flex gap-3 ${mine ? "justify-end" : "justify-start"}`}>
            {!mine && (
                <div className="w-9 h-9 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                    {message.sender_email[0].toUpperCase()}
                </div>
            )}

            <div
                className={`max-w-[70%] p-3 rounded-2xl ${mine ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200"
                    }`}
            >
                <div className="text-xs text-gray-300 mb-1">{message.sender_email}</div>

                {message.text && <div>{message.text}</div>}

                {message.file_url && (
                    <div className="mt-2">
                        {message.file_type?.startsWith("image") ? (
                            <img src={message.file_url} className="max-h-60 rounded" />
                        ) : (
                            <a
                                href={message.file_url}
                                className="underline"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Download file
                            </a>
                        )}
                    </div>
                )}

                <div className="text-xs text-gray-400 mt-2">
                    {new Date(message.created_at).toLocaleTimeString()}
                </div>
            </div>

            {mine && (
                <div className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                    {user.email[0].toUpperCase()}
                </div>
            )}
        </div>
    );
}
