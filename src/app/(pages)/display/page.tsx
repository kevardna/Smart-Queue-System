"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

type DisplayService = {
  service_id: number;
  service_name: string;
  current: {
    id: number;
    queue_code: string;
    called_at: string;
  } | null;
  nextQueues: {
    id: number;
    queue_code: string;
    created_at: string;
  }[];
};

export default function DisplayPage() {
  const [services, setServices] = useState<DisplayService[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDisplay = async () => {
    try {
      const res = await fetch("/api/display/queues");
      const json = await res.json();
      setServices(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisplay();

    socket.on("display-updated", fetchDisplay);

    return () => {
      socket.off("display-updated", fetchDisplay);
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center px-6">
      <div className="w-full max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold text-center text-zinc-900">
          Antrian Sedang Dipanggil
        </h1>

        {loading && (
          <p className="text-center text-zinc-600">Loading display...</p>
        )}

        {!loading && services.length === 0 && (
          <p className="text-center text-zinc-600">
            Tidak ada antrian hari ini
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div
              key={service.service_id}
              className="rounded-xl bg-white shadow-md p-6"
            >
              {/* Service Title */}
              <h2 className="text-xl font-semibold text-zinc-800 mb-4">
                {service.service_name}
              </h2>

              {/* Current Queue */}
              <div className="text-center mb-6">
                <p className="text-sm text-zinc-500 mb-1">
                  Sedang Dipanggil
                </p>

                {service.current ? (
                  <p className="text-6xl font-extrabold text-blue-600">
                    {service.current.queue_code}
                  </p>
                ) : (
                  <p className="text-xl font-medium text-zinc-400">
                    Belum ada
                  </p>
                )}
              </div>

              {/* Next Queues */}
              <div>
                <p className="text-sm font-medium text-zinc-500 mb-2">
                  Antrian Berikutnya
                </p>

                {service.nextQueues.length === 0 ? (
                  <p className="text-zinc-400 text-sm">Tidak ada</p>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {service.nextQueues.map((q) => (
                      <div
                        key={q.id}
                        className="rounded-lg bg-zinc-100 py-3 text-center text-xl font-bold text-zinc-700"
                      >
                        {q.queue_code}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-zinc-400 mt-6">
          Display diperbarui otomatis
        </p>
      </div>
    </div>
  );
}
