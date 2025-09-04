import React, { useState } from 'react';

import React, { useState } from 'react';

export function MaintenanceRequestForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function handleUploadFile(f: File) {
    setStatus('Requesting upload URL…');
    const presignRes = await fetch('/api/storage/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ fileName: f.name, contentType: f.type }),
    });
    if (!presignRes.ok) { setStatus('Presign failed'); return null; }
    const { uploadUrl, key } = await presignRes.json();

    const put = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': f.type }, body: f });
    if (!put.ok) { setStatus('Upload failed'); return null; }
    return key as string;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Submitting maintenance request…');

    let s3Key: string | null = null;
    if (file) {
      s3Key = await handleUploadFile(file);
      if (!s3Key) { setStatus('File upload failed'); return; }
    }

    const res = await fetch('/api/maintenance/create', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, s3Key }),
    });
    if (!res.ok) { setStatus('Failed to create request'); return; }
    setStatus('Request created');
    setTitle(''); setDescription(''); setFile(null);
  }

  return (
    <div>
      <h3>Maintenance Request</h3>
      <form onSubmit={handleSubmit}>
        <label>Title<input value={title} onChange={e => setTitle(e.target.value)} required /></label>
        <label>Description<textarea value={description} onChange={e => setDescription(e.target.value)} required /></label>
        <label>
          Attachment
          <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
        </label>
        <button type="submit">Submit Request</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}
