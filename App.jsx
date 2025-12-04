import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthProvider";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotesPage from "./pages/NotesPage";
import ChatPage from "./pages/ChatPage";
import SearchResults from "./pages/SearchResults";

export default function App() {
    const [search, setSearch] = React.useState(""); 

    return (
        <AuthProvider>
            <BrowserRouter>
                <RoutesWrapper search={search} setSearch={setSearch} />
            </BrowserRouter>
        </AuthProvider>
    );
}

function RoutesWrapper({ search, setSearch }) {
    const { user } = useAuth();

    return (
        <Routes>
            <Route
                path="/"
                element={user ? <NotesPage search={search} setSearch={setSearch} /> : <Home />}
            />

            {!user ? (
                <>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </>
            ) : (
                <>
                    <Route
                        path="/chat"
                        element={<ChatPage search={search} setSearch={setSearch} />}
                    />
                    <Route
                        path="/search"
                        element={<SearchResults search={search} setSearch={setSearch} />}
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                </>
            )}
        </Routes>
    );
}
