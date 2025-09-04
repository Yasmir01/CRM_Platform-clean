import * as React from 'react';

export default function DirectInbox() {
  const [messages, setMessages] = React.useState<any[]>([]);
  const [content, setContent] = React.useState('');
  const [receiverId, setReceiverId] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/messages/inbox', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((d) => setMessages(Array.isArray(d) ? d : []))
      .catch(() => setMessages([]));
  }, []);

  const sendMessage = async () => {
    if (!receiverId || !content) return;
    setBusy(true);
    try {
      await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ receiverId, content }),
      });
      setContent('');
      // reload inbox after sending (optional)
      const res = await fetch('/api/messages/inbox', { credentials: 'include' });
      if (res.ok) setMessages(await res.json());
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
        <button onClick={sendMessage} disabled={busy} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          {busy ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  );
}
