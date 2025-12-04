import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden">
           
            <img
                src="/images/notex.png" 
                alt="background"
                className="absolute inset-0 w-full h-full object-cover"
            />

        
            <div className="absolute inset-0 bg-black/60"></div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center text-white animate-fadeIn">
                <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
                    NoteX
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl drop-shadow">
                    A modern workspace for Notes, Team Chat, and Collaboration | powered by Supabase.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        to="/login"
                        className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition transform hover:scale-105 font-semibold shadow-lg"
                    >
                        Login
                    </Link>
                    <Link
                        to="/signup"
                        className="px-8 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition transform hover:scale-105 font-semibold shadow-lg"
                    >
                        Signup
                    </Link>
                </div>
            </div>

            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fadeIn {
                        animation: fadeIn 1s ease-out forwards;
                    }
                `}
            </style>
        </div>
    );
}
