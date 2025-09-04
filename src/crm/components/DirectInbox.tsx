import * as React from 'react';
import AttachmentList from './AttachmentList';

export default function DirectInbox() {
  const [messages, setMessages] = React.useState<any[]>([]);
  const [content, setContent] = React.useState('');
  const [receiverId, setReceiverId] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [files, setFiles] = React.useState<FileList | null>(null);

  const loadInbox = React.useCallback(() => {
    fetch('/api/messages/inbox', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((d) => setMessages(Array.isArray(d) ? d : []))
      .catch(() => setMessages([]));
  }, []);

  React.useEffect(() => { loadInbox(); }, [loadInbox]);

  async function uploadFileForMessage(messageId: string, file: File) {
    const presign = await fetch('/api/storage/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ contentType: file.type, fileName: file.name }),
    });
    if (!presign.ok) throw new Error('Failed to presign');
    const { uploadUrl, key } = await presign.json();

    const put = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    if (!put.ok) throw new Error('Failed to upload');

    const attachRes = await fetch('/api/messages/attach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ messageId, key, filename: file.name, mimeType: file.type }),
    });
    if (!attachRes.ok) throw new Error('Failed to register attachment');
  }

  const sendMessage = async () => {
    if (!receiverId || !content) return;
    setBusy(true);
    try {
      const resp = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ receiverId, content }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        alert(err?.error || 'Failed to send');
        return;
      }
      const message = await resp.json();

      if (files && files.length > 0) {
        for (const f of Array.from(files)) {
          await uploadFileForMessage(message.id, f);
        }
      }

      setContent('');
      setFiles(null);
      await loadInbox();
      alert('Message sent!');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Inbox</h2>
      <div className="space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="border rounded p-2 bg-gray-50">
            <p className="font-semibold">{m.sender?.name || m.sender?.email || 'Unknown'}</p>
            <p>{m.content}</p>
            {Array.isArray(m.attachments) && m.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="font-medium text-sm">Attachments:</p>
                {m.attachments.map((a: any) => (
                  <a
                    key={a.id}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    📎 {a.filename}
                  </a>
                ))}
              </div>
            )}
            <span className="text-xs text-gray-500">{new Date(m.createdAt).toLocaleString()}</span>
          </div>
        ))}
        {messages.length === 0 && <p className="text-sm text-gray-600">No messages.</p>}
      </div>

      <div className="mt-4 border-t pt-4">
        <h3 className="font-semibold mb-2">Send Message</h3>
        <input
          type="text"
          placeholder="Receiver ID"
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your message..."
          className="border p-2 rounded w-full mb-2"
        />
        <input
          type="file"
          multiple
          onChange={(e) => setFiles(e.target.files)}
          className="block w-full text-sm text-gray-600 mb-2"
        />
        <button onClick={sendMessage} disabled={busy} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          {busy ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  );
}
