import { useState } from "react";

export default function SSNForm({ applicantId }: { applicantId: string }) {
  const [ssn, setSsn] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/screening/transunion", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicantId, ssn }),
      });
      setSsn("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} autoComplete="off">
      <label className="sr-only">SSN</label>
      <input
        aria-label="SSN"
        type="password"
        inputMode="numeric"
        value={ssn}
        onChange={(e) => setSsn(e.target.value)}
        className="border rounded p-2 w-full"
      />
      <button disabled={submitting || ssn.length < 4} className="mt-3 px-4 py-2 rounded bg-black text-white">
        {submitting ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
