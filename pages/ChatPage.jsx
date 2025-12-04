import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../supabase/supabaseClient";
import { useAuth } from "../contexts/AuthProvider";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import Navbar from "../components/Navbar";
import toast, { Toaster } from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

export default function ChatPage({ search = "", setSearch }) {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [showAllUsers, setShowAllUsers] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [groupMembers, setGroupMembers] = useState([]);
    const [chatOpen, setChatOpen] = useState(true);
    const messagesEndRef = useRef();

    const scrollToBottom = () =>
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });


    useEffect(() => {
        if (!user) return;
        supabase
            .from("profiles")
            .select("*")
            .then(({ data, error }) => {
                if (error) return console.error(error);
                setUsers(data.filter((u) => u.id !== user.id));
            });
    }, [user]);


    useEffect(() => {
        if (!user) return;

        async function loadGroups() {
            try {
                const { data: memberships, error: memError } = await supabase
                    .from("group_members")
                    .select("group_id, groups(name)")
                    .eq("user_id", user.id);
                if (memError) throw memError;

                const groupIds = memberships.map((m) => m.group_id);

                const { data: membersData, error: membersError } = await supabase
                    .from("group_members")
                    .select("group_id, user_id")
                    .in("group_id", groupIds);
                if (membersError) throw membersError;

                const memberIds = membersData.map((m) => m.user_id);
                const { data: profiles } = await supabase
                    .from("profiles")
                    .select("id, username, email")
                    .in("id", memberIds);

                const grouped = memberships.map((m) => {
                    const members = membersData
                        .filter((mem) => mem.group_id === m.group_id)
                        .map((mem) => profiles.find((p) => p.id === mem.user_id));
                    return {
                        id: m.group_id,
                        name: m.groups.name,
                        members,
                    };
                });

                setGroups(grouped);
            } catch (err) {
                console.error(err);
            }
        }

        loadGroups();
    }, [user]);

    useEffect(() => {
        if (!user?.id) return;
        if (!selectedUser && !selectedGroup) {
            setMessages([]);
            return;
        }

        let query = supabase
            .from("messages")
            .select("*")
            .order("created_at", { ascending: true });

        if (selectedUser) {
            query = query.or(
                `and(sender.eq.${user.id},receiver.eq.${selectedUser.id}),` +
                `and(sender.eq.${selectedUser.id},receiver.eq.${user.id})`
            );
        } else if (selectedGroup) {
            query = query.eq("group_id", selectedGroup.id);
        }

        query.then(({ data, error }) => {
            if (error) return console.error(error);
            setMessages(data || []);
        });
    }, [selectedUser, selectedGroup, user?.id]);


    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel("live-messages")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "messages" },
                (payload) => {
                    const msg = payload.new;

                    const isRelevant =
                        (selectedGroup && msg.group_id === selectedGroup.id) ||
                        (selectedUser &&
                            ((msg.sender === selectedUser.id && msg.receiver === user.id) ||
                                (msg.sender === user.id && msg.receiver === selectedUser.id))) ||
                        (!selectedUser && !selectedGroup &&
                            (msg.receiver === user.id || msg.sender === user.id));

                  
                    setMessages((prev) => {
                        if (prev.some(
                            (m) => m.id === msg.id || (msg.temp_id && m.temp_id === msg.temp_id)
                        )) return prev;
                        return [...prev, msg];
                    });

             
                    if (!isRelevant && msg.sender !== user.id) {
                        let senderName = "Someone";
                        if (msg.group_id) {
                            const group = groups.find((g) => g.id === msg.group_id);
                            senderName = group ? group.name : "A group";
                        } else {
                            senderName = msg.sender_email || "Someone";
                        }

                        toast(`${senderName} sent a new message`, { icon: "💬" });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, selectedUser, selectedGroup, groups]);


    const handleSend = async (newMsg) => {
        const temp_id = uuidv4();
        const messageToSend = {
            ...newMsg,
            temp_id,
            sender: user.id,
            created_at: new Date().toISOString(),
        };

        
        setMessages((prev) => [...prev, messageToSend]);

        try {
            const { data, error } = await supabase.from("messages").insert([messageToSend]).select();
            if (error) throw error;

          
            setMessages((prev) =>
                prev.map((m) => (m.temp_id === temp_id ? data[0] : m))
            );
        } catch (err) {
            console.error("Failed to send message:", err);
            toast.error("Failed to send message");
            setMessages((prev) => prev.filter((m) => m.temp_id !== temp_id));
        }
    };

    useEffect(scrollToBottom, [messages]);

    const filteredUsers = users.filter((u) =>
        (u.username || u.email).toLowerCase().includes(search.toLowerCase())
    );

    const usersWithMessages = users.filter((u) =>
        messages.some(
            (m) =>
                (m.sender === u.id && m.receiver === user.id) ||
                (m.receiver === u.id && m.sender === user.id)
        )
    );

    const displayedUsers = showAllUsers
        ? [
            ...usersWithMessages,
            ...filteredUsers.filter((u) => !usersWithMessages.includes(u)),
        ]
        : usersWithMessages;

    const filteredMessages = messages.filter((m) =>
        m.text?.toLowerCase().includes(search.toLowerCase())
    );

    const openGroupModal = () => {
        setGroupName("");
        setGroupMembers([]);
        setModalOpen(true);
    };

    const createGroup = async (e) => {
        e.preventDefault();
        if (!groupName) return toast.error("Group name is required");
        if (groupMembers.length === 0) return toast.error("Add at least one member");

        try {
            const { data: groupData, error: groupError } = await supabase
                .from("groups")
                .insert([{ name: groupName, created_by: user.id }])
                .select();
            if (groupError) throw groupError;

            const groupId = groupData[0].id;
            const membersData = groupMembers.map((m) => ({ group_id: groupId, user_id: m.id }));
            membersData.push({ group_id: groupId, user_id: user.id });

            const { error: membersError } = await supabase.from("group_members").insert(membersData);
            if (membersError) throw membersError;

            setGroups([
                ...groups,
                {
                    ...groupData[0],
                    members: [...groupMembers, { id: user.id, username: user.username, email: user.email }],
                },
            ]);
            setModalOpen(false);
            toast.success("Group created!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to create group");
        }
    };


    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            <Toaster position="top-right" reverseOrder={false} />
            <Navbar search={search} setSearch={setSearch} user={user} />

            <div className="flex flex-1 overflow-hidden">
              
                <div className={`bg-gray-800 flex flex-col transition-all duration-300 ${chatOpen ? "w-64" : "w-20"}`}>
                    <div className="p-4 text-xl font-bold border-b border-gray-700 flex justify-between items-center">
                        {chatOpen && <span>Chats</span>}
                        <div className="flex gap-2">
                            {chatOpen && (
                                <>
                                    <button
                                        onClick={() => setShowAllUsers(!showAllUsers)}
                                        className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm"
                                    >
                                        +
                                    </button>
                                    <button
                                        onClick={openGroupModal}
                                        className="px-2 py-1 bg-purple-600 hover:bg-purple-500 rounded text-sm"
                                    >
                                        Group
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                    
                        {groups.map((group) => (
                            <div key={group.id} className="flex flex-col">
                                <div
                                    className={`flex items-center justify-between p-2 cursor-pointer rounded hover:bg-gray-700 ${selectedGroup?.id === group.id ? "bg-blue-600" : ""}`}
                                    onClick={() => {
                                        setSelectedGroup(group);
                                        setSelectedUser(null);
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                                            {group.name[0].toUpperCase()}
                                        </div>
                                        {chatOpen && (
                                            <div className="flex flex-col">
                                                <span>{group.name}</span>
                                                <span className="text-xs text-gray-400">{group.members.length} members</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        
                        {chatOpen && (
                            <div className="mt-2">
                                {displayedUsers.map((u) => (
                                    <div
                                        key={u.id}
                                        onClick={() => {
                                            setSelectedUser(u);
                                            setSelectedGroup(null);
                                        }}
                                        className={`flex items-center gap-3 p-3 cursor-pointer rounded hover:bg-gray-700 ${selectedUser?.id === u.id ? "bg-blue-600" : ""}`}
                                    >
                                        <div className="relative w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                            {(u.username ? u.username[0] : u.email[0]).toUpperCase()}
                                            <span
                                                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-800 ${u.is_online ? "bg-green-400" : "bg-gray-500"}`}
                                            ></span>
                                        </div>
                                        <span>{u.username || u.email}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

          
                <div className={`flex-1 flex flex-col transition-all duration-300 ${chatOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                        {(selectedUser || selectedGroup) ? (
                            filteredMessages.map((msg) => (
                                <ChatMessage key={msg.id || msg.temp_id || msg.created_at} message={msg} />
                            ))
                        ) : (
                            <p className="text-gray-400 text-center mt-10">Select a chat to start messaging</p>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {(selectedUser || selectedGroup) && (
                        <ChatInput
                            selectedUser={selectedUser}
                            selectedGroup={selectedGroup}
                            onSend={handleSend}
                            allowFiles={true}
                        />
                    )}
                </div>
            </div>

            
            {modalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <form
                        onSubmit={createGroup}
                        className="bg-[#1a1a1a] p-6 rounded-2xl w-full max-w-md shadow-lg flex flex-col gap-4"
                    >
                        <h2 className="text-xl font-bold text-center">Create Group</h2>
                        <input
                            type="text"
                            placeholder="Group Name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="p-3 rounded-xl bg-[#111] outline-none text-white placeholder-gray-400"
                        />
                        <div className="flex flex-col max-h-40 overflow-y-auto gap-2">
                            {users.map((u) => (
                                <label key={u.id} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={groupMembers.some((m) => m.id === u.id)}
                                        onChange={(e) =>
                                            e.target.checked
                                                ? setGroupMembers([...groupMembers, u])
                                                : setGroupMembers(groupMembers.filter((m) => m.id !== u.id))
                                        }
                                    />
                                    <span>{u.username || u.email}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500"
                            >
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
