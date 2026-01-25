"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Service = {
  id: number;
  name: string;
};

export default function QueuePage() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoadingServices(true);
    fetch("/api/services")
      .then((res) => res.json())
      .then((res) => setServices(res.data))
      .finally(() => setLoadingServices(false));
  }, []);

  const handleQueue = async () => {
    if (!selectedService) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/queues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_id: selectedService }),
      });

      const data = await res.json();
      router.push(`/queue/${data.data.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 px-4">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-md p-8">
        <h1 className="text-3xl font-extrabold text-center mb-10 text-zinc-900">
          Take a Queue Number
        </h1>

        <div className="mx-auto mb-10 flex flex-wrap justify-center gap-4 min-h-24">
          {loadingServices ? (
            <div className="flex items-center gap-3 text-zinc-600">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-600" />
              <p className="text-lg">Loading services...</p>
            </div>
          ) : (
            services.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`px-6 py-4 rounded-xl border text-lg font-semibold transition-all
                  ${
                    selectedService === service.id
                      ? "bg-blue-600 text-white border-blue-600 ring-4 ring-blue-200 scale-105"
                      : "bg-white text-zinc-800 hover:bg-zinc-50 hover:shadow"
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
            disabled={!selectedService || submitting}
            className="px-10 py-4 rounded-xl bg-green-600 text-white text-lg font-bold
              transition hover:bg-green-700 active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Processing..." : "Get Queue Number"}
          </button>
        </div>
      </div>
    </div>
  );
}
