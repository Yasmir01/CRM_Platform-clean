"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ContactDetail() {
  const params = useParams();
  const id = (params as any)?.id;
  const [contact, setContact] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/contacts/${id}`)
      .then((res) => res.json())
      .then(setContact)
      .catch(() => setContact(null));
  }, [id]);

  if (!contact) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">
        {contact.firstName} {contact.lastName}
      </h1>
      <p className="text-gray-600">{contact.position}</p>
      <p className="text-sm">{contact.email}</p>
      <p className="text-sm">{contact.phone}</p>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">Notes</h2>
        <ul className="mt-2 space-y-2">
          {contact.notes?.map((n: any) => (
            <li key={n.id} className="p-2 border rounded bg-gray-50">
              {n.content}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
