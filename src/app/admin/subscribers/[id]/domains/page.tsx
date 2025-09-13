"use client";
import { useEffect, useState } from "react";

export default function AdminDomainControls({ params }: { params: { id: string } }) {
  const [subscriber, setSubscriber] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/subscribers/${params.id}/domains`);
      const data = await res.json();
      setSubscriber(data);
    }
    load();
  }, [params.id]);

  const update = async () => {
    await fetch(`/api/admin/subscribers/${params.id}/domains`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscriber),
    });
    alert("Domain settings updated by Super Admin!");
  };

  if (!subscriber) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Super Admin: Landing Pages & Custom Domain Overrides</h1>

      <div className="space-y-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(subscriber.landingPagesEnabledByAdmin)}
            onChange={(e) =>
              setSubscriber({
                ...subscriber,
                landingPagesEnabledByAdmin: e.target.checked,
              })
            }
          />
          Allow Landing Pages
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(subscriber.customDomainEnabledByAdmin)}
            onChange={(e) =>
              setSubscriber({
                ...subscriber,
                customDomainEnabledByAdmin: e.target.checked,
              })
            }
          />
          Allow Custom Domains
        </label>
      </div>

      <button onClick={update} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded">
        Save Overrides
      </button>
    </div>
  );
}
