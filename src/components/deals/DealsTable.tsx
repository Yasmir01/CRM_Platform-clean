import React, { useEffect, useState } from 'react'
import DealForm from './DealForm'

export default function DealsTable() {
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDeals = () => {
    setLoading(true)
    fetch('/api/deals')
      .then(res => res.json())
      .then(data => { setDeals(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchDeals() }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div className="p-6 space-y-6">
      <DealForm onCreated={fetchDeals} />

      <h1 className="text-2xl font-bold">Deals</h1>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2">Title</th>
            <th className="border px-3 py-2">Amount</th>
            <th className="border px-3 py-2">Stage</th>
            <th className="border px-3 py-2">Status</th>
            <th className="border px-3 py-2">Company</th>
            <th className="border px-3 py-2">Contact</th>
          </tr>
        </thead>
        <tbody>
          {deals.map(deal => (
            <tr key={deal.id}>
              <td className="border px-3 py-2">{deal.title}</td>
              <td className="border px-3 py-2">{deal.amount != null ? `$${deal.amount}` : '-'}</td>
              <td className="border px-3 py-2">{deal.stage}</td>
              <td className="border px-3 py-2">{deal.status}</td>
              <td className="border px-3 py-2">{deal.company?.name ?? '-'}</td>
              <td className="border px-3 py-2">{deal.contact ? `${deal.contact.firstName || ''} ${deal.contact.lastName || ''}`.trim() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
