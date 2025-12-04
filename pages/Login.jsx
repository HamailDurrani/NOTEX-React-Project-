import { useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setError(null);

      
        const { data: userData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) {
            setError(loginError.message);
            return;
        }

   
        try {
            await createProfileIfNotExists(userData.user);
        } catch (err) {
            console.error("Profile creation error:", err);
        }

      
        navigate("/notes");
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <img
                src="/images/notex.png"
                alt="background"
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/70"></div>

            <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
                <form
                    onSubmit={handleLogin}
                    className="bg-[transparent] p-10 rounded-3xl w-full max-w-md shadow-[0_0_20px_#0ff] backdrop-blur-sm border border-[#0ff]"
                >
                    <h1 className="text-4xl font-extrabold mb-6 text-center text-[#0ff] drop-shadow-[0_0_10px_#0ff]">
                        Login
                    </h1>

                    {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full mb-4 p-3 rounded-xl bg-transparent outline-none border border-[#0ff] text-[#0ff] placeholder-[#0ff]/50 focus:shadow-[0_0_10px_#0ff] transition"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full mb-6 p-3 rounded-xl bg-transparent outline-none border border-[#0ff] text-[#0ff] placeholder-[#0ff]/50 focus:shadow-[0_0_10px_#0ff] transition"
                        required
                    />

                    <button className="w-full p-3 rounded-xl font-bold bg-[#0ff] text-black hover:shadow-[0_0_20px_#0ff] transition-all">
                        Login
                    </button>

                    <p className="mt-4 text-gray-400 text-center">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-[#0ff] hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}


async function createProfileIfNotExists(user) {
    if (!user) return;

    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

    if (error && error.code !== "PGRST116") {
      
        throw error;
    }

    if (!data) {
        await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            avatar_url: user.user_metadata?.avatar || null,
            created_at: new Date().toISOString(),
        });
    }
}
