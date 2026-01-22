"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Service = {
  id: number;
  name: string;
};

export default function QueuePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((res) => setServices(res.data));
  }, []);

  const handleQueue = async () => {
    if (!selectedService) return;

    setLoading(true);
    try {
      const res = await fetch("/api/queues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_id: selectedService }),
      });

      const data = await res.json();
      router.push(`/queue/${data.data.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-md p-10">
        <h1 className="text-3xl font-bold text-center mb-8 text-zinc-900">
          Take a Queue Number
        </h1>

        <div className="mx-auto mb-8 flex flex-wrap justify-center gap-4 min-h-20">
          {loading ? (
            <div className="flex items-center gap-2 text-zinc-800">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-600" />
              <p className="text-lg">Loading services...</p>
            </div>
          ) : (
            services.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`p-4 rounded-lg border text-lg font-medium transition cursor-pointer
          ${
            selectedService === service.id
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-zinc-800 hover:bg-zinc-50"
          }`}
              >
                {service.name}
              </button>
            ))
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleQueue}
            disabled={!selectedService || loading}
            className="px-8 py-3 bg-green-600 text-white rounded-lg text-lg font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Get Queue Number"}
          </button>
        </div>
      </div>
    </div>
  );
}
