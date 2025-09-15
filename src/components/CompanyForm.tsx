"use client";

import React, { useEffect, useState } from 'react';

type CompanyFormProps = {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; industry?: string; website?: string }) => void;
  initialData?: { name?: string; industry?: string; website?: string };
};

export default function CompanyForm({ open, onClose, onSave, initialData }: CompanyFormProps) {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setIndustry(initialData.industry || '');
      setWebsite(initialData.website || '');
    } else {
      setName('');
      setIndustry('');
      setWebsite('');
    }
  }, [initialData]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), industry: industry.trim() || undefined, website: website.trim() || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">{initialData ? 'Edit Company' : 'New Company'}</h2>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-2 py-1" required />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Industry</label>
          <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Website</label>
          <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
          <button onClick={handleSubmit} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">{initialData ? 'Update' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
}
