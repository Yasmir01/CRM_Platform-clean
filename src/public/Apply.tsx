import React, { useState } from 'react';

export default function Apply() {
  const params = new URLSearchParams(window.location.search);
  const initialPropertyId = window.location.pathname.split('/').pop() || params.get('propertyId') || '';
  const [propertyId] = useState(initialPropertyId);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [moveIn, setMoveIn] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('id');
  const [appId, setAppId] = useState<string | null>(null);

  const submit = async () => {
    const res = await fetch('/api/applications/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ propertyId, applicantName: name, email, phone, moveInDate: moveIn }) });
    const app = await res.json();
    if (!res.ok) return alert(app?.error || 'Failed');
    setAppId(app.id);
    alert('Application submitted!');
  };

  const uploadDoc = async () => {
    if (!appId || !file) return alert('Submit application first and choose a file');
    const p = await fetch('/api/applications/presign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appId, type: docType }) }).then((r) => r.json());
    await fetch(p.uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'application/pdf' }, body: file });
    await fetch('/api/applications/attach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appId, type: docType, key: p.key }) });
    alert('Document uploaded');
  };

  return (
    <div style={{ maxWidth: 640, margin: '24px auto', padding: 16, background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Apply for this Property</h1>
      <div style={{ display: 'grid', gap: 8 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" style={{ border: '1px solid #ddd', padding: 8, borderRadius: 8 }} />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ border: '1px solid #ddd', padding: 8, borderRadius: 8 }} />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" style={{ border: '1px solid #ddd', padding: 8, borderRadius: 8 }} />
        <input type="date" value={moveIn} onChange={(e) => setMoveIn(e.target.value)} style={{ border: '1px solid #ddd', padding: 8, borderRadius: 8 }} />
        <button onClick={submit} style={{ padding: '8px 12px', background: '#2563eb', color: '#fff', borderRadius: 8, border: 0 }}>Submit Application</button>
      </div>

      <div style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Upload Documents</h2>
        <select value={docType} onChange={(e) => setDocType(e.target.value)} style={{ border: '1px solid #ddd', padding: 8, borderRadius: 8, marginRight: 8 }}>
          <option value="id">ID</option>
          <option value="paystub">Paystub</option>
          <option value="reference">Reference</option>
          <option value="other">Other</option>
        </select>
        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={uploadDoc} style={{ marginLeft: 8, padding: '6px 10px', borderRadius: 8 }}>Upload</button>
      </div>
    </div>
  );
}
