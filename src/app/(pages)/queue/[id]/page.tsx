"use client";

import { use, useEffect, useState } from "react";
import { statusConfig } from "./lib/StatusConfig";

type QueueDetail = {
  id: number;
  queue_code: string;
  status: string;
  service_name: string;
  created_at: string;
};

export default function QueueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [queue, setQueue] = useState<QueueDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/queues/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setQueue(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 px-4">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-md p-8">
        {loading && (
          <p className="text-center text-lg font-medium text-zinc-700">
            Loading queue...
          </p>
        )}

        {!loading && !queue && (
          <p className="text-center text-lg font-medium text-red-600">
            Queue not found
          </p>
        )}

        {!loading && queue && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold text-zinc-900 mb-6">
                Queue Detail
              </h1>

              <p className="text-zinc-500 mb-1">Queue Number</p>
              <p className="text-5xl font-extrabold text-blue-600 mb-6">
                {queue.queue_code}
              </p>

              <div className="space-y-3 text-zinc-700 text-base">
                <div>
                  <span className="font-semibold">Service</span>
                  <p>{queue.service_name}</p>
                </div>

                <div>
                  <span className="font-semibold">Status</span>
                  <p className={`font-bold ${statusConfig[queue.status].color}`}>
                    {queue.status}
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">
                    {statusConfig[queue.status].message}
                  </p>
                </div>

                <div>
                  <span className="font-semibold">Created At</span>
                  <p>{new Date(queue.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <p className="mb-4 text-sm font-medium text-zinc-500">
                Scan for queue status
              </p>

              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  `${window.location.origin}/queue/${queue.id}`,
                )}`}
                alt="Queue QR Code"
                className="rounded-lg border p-2"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
