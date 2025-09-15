import React, { useEffect, useState } from 'react'

export default function DealsTable() {
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetch('/api/deals')
      .then(res => res.json())
      .then(data => {
        if (!mounted) return
        setDeals(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    return () => { mounted = false }
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Deals</h1>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2 text-left">Title</th>
            <th className="border px-3 py-2 text-left">Amount</th>
            <th className="border px-3 py-2 text-left">Stage</th>
            <th className="border px-3 py-2 text-left">Status</th>
            <th className="border px-3 py-2 text-left">Company</th>
            <th className="border px-3 py-2 text-left">Contact</th>
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
