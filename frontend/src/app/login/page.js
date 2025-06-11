"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";
import Link from "next/link";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState("");
    const router = useRouter();

    // Redirect to home if the user is already logged in
    useEffect(() => {
        if (localStorage.getItem("authToken")) {
            router.push("/");  // Redirect to home page
        }
    }, [router]);

    const onSubmit = async (data) => {
        setError("");
        try {
            const response = await axios.post(backendUrl+"/api/v1/login", data);
            localStorage.setItem("authToken", response.data.token);
            router.push("/");  // Redirect to home page after successful login
        } catch (err) {
            setError(err.response?.data?.error || "Invalid username or password");
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center p-6 bg-base-200">
            <div className="bg-base-100 p-8 rounded-lg shadow-lg w-full max-w-sm space-y-6">
                <h1 className="text-3xl font-bold text-white text-center">Login</h1>
                {error && <p className="text-red-500 text-center">{error}</p>}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <input 
                            type="text" 
                            {...register("username", { required: true })} 
                            placeholder="Username" 
                            className="input input-bordered w-full" 
                        />
                        {errors.username && <p className="text-red-500 text-xs mt-1">Username is required</p>}
                    </div>

                    <div>
                        <input 
                            type="password" 
                            {...register("password", { required: true })} 
                            placeholder="Password" 
                            className="input input-bordered w-full" 
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">Password is required</p>}
                    </div>

                    <button type="submit" className="btn btn-primary w-full">Login</button>
                </form>

                <p className="text-center text-sm text-white">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-blue-400 hover:underline">
                        Register here
                    </Link>
                </p>
            </div>
        </main>
    );
}
