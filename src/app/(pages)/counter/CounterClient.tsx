"use client";

import { useEffect, useState } from "react";

type Queue = {
  id: number;
  queue_code: string;
  status: "WAITING" | "CALLING" | "DONE" | "SKIPPED";
  created_at: string;
};

export default function CounterClient({ token }: { token?: string }) {
  const [data, setData] = useState<{ counter_name: string; nextQueues: Queue[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNext, setShowNext] = useState(false);
  const [error, setError] = useState("");

  async function fetchQueues() {
    try {
      const token = localStorage.getItem("sqs-token")

      if (!token) {
        setError("Please login first");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/counters/queues", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Unauthorized");
      }

      const json = await res.json();
      setData(json.data);
      setError("");
    } catch {
      setError("Session expired, please login again");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQueues();
    const interval = setInterval(fetchQueues, 3000);
    return () => clearInterval(interval);
  }, []);

  async function action(type: "call" | "finish" | "skip") {
    try {
      const authToken = token ?? (typeof window !== "undefined" ? localStorage.getItem("sqs-token") : "");

      await fetch(`/api/queues/${type}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ queue_id: data?.nextQueues?.[0]?.id }),
      });

      fetchQueues();
    } catch {
      alert("Action failed");
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100">
        <p className="text-zinc-600 text-lg font-medium">Loading counter...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );

  const current = data?.nextQueues?.[0];
  const nextQueues = data?.nextQueues?.slice(1) || [];

  return (
    <div className="min-h-screen bg-zinc-100 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <h1 className="text-3xl font-bold text-center text-zinc-900">
          {data?.counter_name || "Counter"}
        </h1>

        <div className="rounded-2xl bg-white shadow-md p-10 text-center">
          <p className="text-zinc-500 text-sm mb-2">Now Serving</p>

          <div className="text-8xl font-extrabold tracking-widest text-blue-600">
            {current?.queue_code || "-"}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => action("call")}
              disabled={current?.status === "CALLING"}
              className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow hover:bg-blue-700 disabled:bg-blue-300"
            >
              Call
            </button>

            <button
              onClick={() => action("finish")}
              disabled={!current}
              className="rounded-lg bg-emerald-600 px-8 py-3 font-semibold text-white shadow hover:bg-emerald-700 disabled:bg-emerald-300"
            >
              Finish
            </button>

            <button
              onClick={() => action("skip")}
              disabled={!current}
              className="rounded-lg bg-red-600 px-8 py-3 font-semibold text-white shadow hover:bg-red-700 disabled:bg-red-300"
            >
              Skip
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-800">
              Upcoming Queues
            </h2>

            <button
              onClick={() => setShowNext(!showNext)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              {showNext ? "Hide" : "Show"}
            </button>
          </div>

          {showNext && (
            <>
              {nextQueues.length === 0 ? (
                <p className="text-zinc-400 text-sm">No upcoming queues</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {nextQueues.map((q: Queue) => (
                    <div
                      key={q.id}
                      className="rounded-lg bg-zinc-100 py-4 text-center text-2xl font-bold text-zinc-700"
                    >
                      {q.queue_code}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <p className="text-center text-xs text-zinc-400">
          Counter is connected to the display in real-time
        </p>
      </div>
    </div>
  );
}
