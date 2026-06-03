import { useState } from "react";
import axios from "axios";

export default function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setError("");

        try {
            const res = await axios.post("http://localhost:5700/api/admin/login", {
                email,
                password
            });
            onLogin?.(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">

            <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">

                {/* Title */}
                <h1 className="text-3xl font-bold text-white text-center mb-6">
                    Zanosa Admin Login
                </h1>

                <p className="text-gray-400 text-center mb-6">
                    Sign in to access dashboard
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <p className="text-rose-500 text-sm text-center font-medium bg-rose-500/10 border border-rose-500/25 p-2 rounded">
                            {error}
                        </p>
                    )}

                    {/* Email */}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 rounded bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Password */}
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 rounded bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold"
                    >
                        Login
                    </button>

                </form>

                {/* Footer */}
                <p className="text-gray-500 text-center mt-6 text-sm">
                    © Zanosa Admin Panel
                </p>

            </div>
        </div>
    );
}