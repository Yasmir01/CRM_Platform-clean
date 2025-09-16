import React, { useState } from 'react'

export default function DealForm({ onCreated }: { onCreated?: () => void }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    stage: 'Lead',
    probability: '',
    status: 'open',
    companyId: '',
    contactId: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount: form.amount ? parseFloat(form.amount) : null,
          probability: form.probability ? parseInt(form.probability) : null
        })
      })
      setForm({
        title: '',
        description: '',
        amount: '',
        stage: 'Lead',
        probability: '',
        status: 'open',
        companyId: '',
        contactId: ''
      })
      if (onCreated) onCreated()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded">
      <h2 className="text-xl font-semibold">Create Deal</h2>

      <div>
        <label className="block text-sm font-medium">Title</label>
        <input name="title" value={form.title} onChange={handleChange} required className="w-full border px-2 py-1 rounded" />
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Amount ($)</label>
          <input type="number" name="amount" value={form.amount} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Probability (%)</label>
          <input type="number" name="probability" value={form.probability} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Stage</label>
          <select name="stage" value={form.stage} onChange={handleChange} className="w-full border px-2 py-1 rounded">
            <option>Lead</option>
            <option>Negotiation</option>
            <option>Closed Won</option>
            <option>Closed Lost</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full border px-2 py-1 rounded">
            <option value="open">Open</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Deal'}
      </button>
    </form>
  )
}
