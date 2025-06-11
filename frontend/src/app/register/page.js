"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";
import Link from "next/link";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
// Ensure the backend URL is set correctly
export default function Register() {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const [error, setError] = useState("");
    const router = useRouter();

    // Redirect to home if the user is already logged in
    useEffect(() => {
        if (localStorage.getItem("authToken")) {
            router.push("/");
        }
    }, [router]);

    const onSubmit = async (data) => {
        setError("");
        if (data.password !== data.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            await axios.post(backendUrl + "/api/v1/register", data);
            router.push("/login");
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed");
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center p-6 bg-base-200">
            <div className="bg-base-100 p-8 rounded-lg shadow-lg w-full max-w-sm space-y-6">
                <h1 className="text-3xl font-bold text-white text-center">Register</h1>
                {error && <p className="text-red-500 text-center">{error}</p>}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <input type="text" {...register("username", { required: true })} placeholder="Username" className="input input-bordered w-full" />
                    {errors.username && <p className="text-red-500 text-xs mt-1">Username is required</p>}

                    <input type="email" {...register("email", { required: true })} placeholder="Email" className="input input-bordered w-full" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">Email is required</p>}

                    <input type="text" {...register("profileImage", { required: false })} placeholder="Profile Image URL" className="input input-bordered w-full" />
                    {errors.profileImage && <p className="text-red-500 text-xs mt-1">Profile Image URL is required</p>}

                    <input type="password" {...register("password", { required: true })} placeholder="Password" className="input input-bordered w-full" />
                    {errors.password && <p className="text-red-500 text-xs mt-1">Password is required</p>}

                    <input type="password" {...register("confirmPassword", { required: true })} placeholder="Confirm Password" className="input input-bordered w-full" />
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">Confirmation is required</p>}

                    <button type="submit" className="btn btn-primary w-full">Register</button>
                </form>

                <p className="text-center text-sm text-white">
                    Already have an account? <Link href="/login" className="text-blue-400 hover:underline">Login here</Link>
                </p>
            </div>
        </main>
    );
}
