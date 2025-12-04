# NOTEX-React-Project

NoteX Chat & Notes App

A real-time chat and notes application built with React and Supabase. Users can send direct messages, create groups, and manage notes. Realtime updates allow instant messaging without refreshing the page.

# Features
* Chat

1-to-1 messaging between users

Group chat with multiple members

Instant message delivery using Supabase Realtime

File attachments (images, documents)

Online/offline indicators

Sidebar with search and quick user selection
--------------------------------------------------------
* Notes

Personal notes management

Create, edit, delete notes

Notes are user-specific
-------------------------------------------------------
* Groups

Create groups with custom names

Add multiple users to a group

View group members

Realtime group chat
--------------------------------------------------------------
* UI

Dark theme with modern look

Responsive layout for desktop

Collapsible chat sidebar

Notification toast for new messages
--------------------------------------------------------------
* Tech Stack

Frontend: React, TailwindCSS, React Router

Backend / Database: Supabase (PostgreSQL + Realtime)

Authentication: Supabase Auth

Storage: Supabase Storage (for attachments)

Notifications: react-hot-toast

Realtime Messaging: Supabase Realtime (WebSocket)
--------------------------------------------------------------
* Database Structure

profiles: User info (id, email, username, avatar_url, created_at)

messages: Chat messages (id, sender, receiver, group_id, text, file_url, created_at)

groups: Group info (id, name, created_by, created_at)

group_members: Group participants (id, group_id, user_id, joined_at)

notes: Personal notes (id, user_id, title, content, created_at)

Realtime Setup:

messages table is published in supabase_realtime for instant message broadcasting.
---------------------------------------------------------------------------------------
* Installation

Install dependencies:

npm install
npm create vite@latest react-notes-chat --template react
cd react-notes-chat

npm install @supabase/supabase-js react-router-dom tailwindcss postcss autoprefixer
npm install @radix-ui/react-avatar @radix-ui/react-dialog
npm install lucide-react clsx
npx tailwindcss init -p


Set up environment variables in .env:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key


Run the development server:

npm run dev
--------------------------------------------------------------
* Usage

Register or log in using Supabase Auth.

Start chatting by selecting a user or a group.

Create groups via the “Group” button in the sidebar.

Add notes from the Notes page.

Search users and messages using the search bar.
-------------------------------------------------------------
