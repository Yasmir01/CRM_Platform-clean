import React from "react";

interface PropertyLeadFormProps {
  propertyId?: string;
  submitLabel?: string;
  data?: any;
}

export default function PropertyLeadForm(props: PropertyLeadFormProps) {
  const data = props.data || {};
  const property = data.property || {};
  const propertyId = props.propertyId || property?.id || property?.slug || "";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const body = {
      name: (form.elements.namedItem("name") as HTMLInputElement)?.value || "",
      email: (form.elements.namedItem("email") as HTMLInputElement)?.value || "",
      phone: (form.elements.namedItem("phone") as HTMLInputElement)?.value || "",
      message: (form.elements.namedItem("message") as HTMLTextAreaElement)?.value || "",
      propertyId,
      source: typeof window !== "undefined" ? window.location.href : "",
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("network");
      alert("Thanks — we got your inquiry!");
      form.reset();
    } catch (err) {
      console.error(err);
      alert("There was an error. Please try again.");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg"
    >
      <input
        name="name"
        placeholder="Full name"
        required
        className="w-full mb-3 px-4 py-2 border rounded-md"
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="w-full mb-3 px-4 py-2 border rounded-md"
      />
      <input
        name="phone"
        placeholder="Phone (optional)"
        className="w-full mb-3 px-4 py-2 border rounded-md"
      />
      <textarea
        name="message"
        placeholder="Message (optional)"
        className="w-full mb-3 px-4 py-2 border rounded-md"
      />
      <button
        type="submit"
        className="w-full py-2 px-4 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition"
      >
        {props.submitLabel || "Contact"}
      </button>
    </form>
  );
}
