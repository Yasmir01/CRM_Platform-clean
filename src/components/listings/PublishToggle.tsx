import React from 'react';

export default function PublishToggle({ unitId, isActive }: { unitId: string; isActive: boolean }) {
  async function toggle() {
    await fetch('/api/listings/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ unitId, isActive: !isActive }),
    });
    window.location.reload();
  }

  return (
    <button onClick={toggle} className={`px-3 py-1 rounded ${isActive ? 'bg-green-600 text-white':'bg-gray-300'}`}>
      {isActive ? 'Published' : 'Unpublished'}
    </button>
  );
}
