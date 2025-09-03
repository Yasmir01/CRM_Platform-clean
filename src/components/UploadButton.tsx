import React, { useState } from "react";

export default function UploadButton() {
  const [status, setStatus] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("Requesting upload URL...");
    const presignRes = await fetch("/api/storage/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      credentials: "include",
    });

    if (!presignRes.ok) {
      setStatus("Failed to get upload URL");
      return;
    }

    const { uploadUrl, key, allowedMime, maxSize } = await presignRes.json();

    if (!allowedMime.includes(file.type) || file.size > maxSize) {
      setStatus("File not allowed");
      return;
    }

    setStatus("Uploading...");
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    if (!uploadRes.ok) {
      setStatus("Upload failed");
      return;
    }

    setStatus(`Uploaded successfully: ${key}`);
  }

  return (
    <div>
      <input type="file" onChange={handleFile} />
      {status && <p>{status}</p>}
    </div>
  );
}
