import React from "react";
import useApiRequest from "../hooks/useApiRequest";
import "./contactsList.css";

// Types – adjust to your API
type Contact = {
  id: string;
  name: string;
  email: string;
};

// Example fetcher – replace with a real endpoint/client
async function fetchContacts(): Promise<Contact[]> {
  const resp = await fetch("/api/contacts");
  if (!resp.ok) {
    throw new Error(`Server responded ${resp.status}`);
  }
  const json = await resp.json();
  return Array.isArray(json) ? json : [];
}

export const ContactsList: React.FC = () => {
  const { data, error, loading, refetch } = useApiRequest<Contact[]>(fetchContacts, []);

  if (loading) {
    return (
      <div className="centered" aria-busy>
        <svg className="spinner" width="48" height="48" viewBox="0 0 44 44" aria-label="Loading">
          <circle cx="22" cy="22" r="20" fill="none" strokeWidth="4" stroke="#555" strokeDasharray="90" strokeLinecap="round" />
        </svg>
        <p>Loading contacts…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state" role="alert">
        <h2>Unable to load contacts</h2>
        <p>{error.message}</p>
        <button onClick={refetch} className="retry-btn">↻ Retry</button>
      </div>
    );
  }

  if (data && data.length === 0) {
    return (
      <div className="empty-state">
        <h2>No Contacts Found</h2>
        <p>Try adding a new contact or check your filters.</p>
        <button onClick={() => alert("Open create-contact modal")} className="primary-btn">Create Contact</button>
      </div>
    );
  }

  return (
    <ul className="contacts-list">
      {data!.map((c) => (
        <li key={c.id} className="contact-item">
          <strong>{c.name}</strong> – <a href={`mailto:${c.email}`}>{c.email}</a>
        </li>
      ))}
    </ul>
  );
};

export default ContactsList;
