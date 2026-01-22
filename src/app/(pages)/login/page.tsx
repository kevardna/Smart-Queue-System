"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await res.json();
      document.cookie = `token=${data.data.token}; path=/`;

      if (data.data.user.role === "ADMIN") {
        window.location.href = "/dashboard";
      } else if (data.data.user.role === "STAFF") {
        window.location.href = "/counter";
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-md md:flex-row">
        <div className="flex w-full flex-col justify-center p-10 md:w-1/2">
          <h1 className="max-w-sm text-3xl font-bold leading-10 tracking-tight text-black ">
            Please log in to access the Smart Queue System.
          </h1>
        </div>

        <div className="hidden w-px bg-zinc-200 md:block" />

        <div className="flex w-full flex-col justify-center gap-6 p-10 border-zinc-800 md:w-1/2 md:border-l">
          <div className="flex flex-col">
            <label className="font-semibold text-sm text-zinc-500">
              Email
            </label>
            <input
              type="email"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="mt-1 rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold text-sm text-zinc-500">
              Password
            </label>
            <input
              type="password"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-1 rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            className={`mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
              isLoading ? "cursor-not-allowed" : ""
            }`}
            onClick={(e) => handleLogin(e as any)}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </div>
      </div>
    </div>
  );
}
