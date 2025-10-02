import React from 'react';
import { useParams } from 'react-router-dom';

export default function EscalationRequestView() {
  const params = useParams();
  const requestId = params.requestId as string;
  const [logs, setLogs] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!requestId) return;
    fetch(`/api/escalations/logs?requestId=${encodeURIComponent(requestId)}`, { credentials: 'include' })
      .then((r) => r.json())
      .then(setLogs);
  }, [requestId]);

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Escalation History - Request {requestId}</h2>
      <ul className="space-y-3">
        {logs.map((log) => (
          <li key={log.id} className="p-3 rounded bg-gray-50 border flex justify-between">
            <span><b>Level {log.level}</b> → {log.role}</span>
            <span className="text-sm text-gray-500">{new Date(log.triggeredAt).toLocaleString()}</span>
          </li>
        ))}
        {logs.length === 0 && <p className="text-gray-500">No escalations recorded.</p>}
      </ul>
    </div>
  );
}
