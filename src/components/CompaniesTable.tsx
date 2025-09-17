// src/components/CompaniesTable.tsx
import React, { useEffect, useState } from "react";
import { fetchCompanies, updateCompany, deleteCompany } from "../services/companies";
import "./companies.css";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props: any, ref: any) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

type Company = {
  id: string;
  name: string;
  industry?: string | null;
  createdAt?: string;
  updatedAt?: string;
  organization?: { id: string; name: string } | null;
  contacts?: { id: string; name?: string; email?: string }[];
};

export default function CompaniesTable() {
  const [data, setData] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("createdAt:desc");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<{ name?: string; industry?: string }>({});

  const [snack, setSnack] = useState<{ open: boolean; message: string; severity?: 'success' | 'error' | 'info' }>(
    { open: false, message: '', severity: 'info' }
  );

  const showSnack = (message: string, severity: 'success' | 'error' | 'info' = 'info') => setSnack({ open: true, message, severity });
  const closeSnack = () => setSnack({ open: false, message: '', severity: 'info' });

  async function load() {
    try {
      setLoading(true);
      const result = await fetchCompanies({ page, pageSize, sort, search });
      const items = result.items ?? result.data ?? result;
      setData(items);
      setTotal(result.total ?? result.total ?? 0);
    } catch (err) {
      console.error(err);
      showSnack("Failed to load companies", 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, sort]);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const startEdit = (c: Company) => {
    setEditingId(c.id);
    setEditingValues({ name: c.name, industry: c.industry ?? "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValues({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await updateCompany(editingId, editingValues);
      await load();
      cancelEdit();
      showSnack("Company updated", 'success');
    } catch (err) {
      console.error(err);
      showSnack("Failed to update company", 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company?")) return;
    // Optimistic remove
    const prev = data;
    setData((d) => d.filter((c) => c.id !== id));
    try {
      await deleteCompany(id);
      showSnack("Company deleted", 'success');
      // If last item on page deleted, move page back if needed
      const remaining = prev.length - 1;
      if (remaining === 0 && page > 1) setPage((p) => p - 1);
      else await load();
    } catch (err) {
      console.error(err);
      setData(prev); // revert
      showSnack("Failed to delete company", 'error');
    }
  };

  return (
    <div className="companies-container">
      <h2 className="companies-title">Companies</h2>

      <div className="companies-toolbar">
        <input
          className="companies-search"
          placeholder="Search company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); load(); } }}
        />
        <button className="companies-btn" onClick={() => { setPage(1); load(); }}>Search</button>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <label className="companies-page-size">
            Page size:
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>
      </div>

      <table className="companies-table">
        <thead>
          <tr>
            <th className="companies-th">
              <button className="companies-link" onClick={() => setSort(sort === "name:asc" ? "name:desc" : "name:asc")}>Name</button>
            </th>
            <th className="companies-th">
              <button className="companies-link" onClick={() => setSort(sort === "industry:asc" ? "industry:desc" : "industry:asc")}>Industry</button>
            </th>
            <th className="companies-th">Organization</th>
            <th className="companies-th">Contacts</th>
            <th className="companies-th">Created</th>
            <th className="companies-th">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6}>Loading...</td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={6}>No companies</td></tr>
          ) : data.map((c) => (
            <tr key={c.id} className={editingId === c.id ? "row-editing" : ""}>
              <td className="companies-td">
                {editingId === c.id ? (
                  <input value={editingValues.name ?? ""} onChange={(e) => setEditingValues((v) => ({ ...v, name: e.target.value }))} />
                ) : (
                  c.name
                )}
              </td>
              <td className="companies-td">
                {editingId === c.id ? (
                  <input value={editingValues.industry ?? ""} onChange={(e) => setEditingValues((v) => ({ ...v, industry: e.target.value }))} />
                ) : (
                  c.industry ?? "-"
                )}
              </td>
              <td className="companies-td">{c.organization?.name ?? "-"}</td>
              <td className="companies-td">{(c.contacts || []).map((t) => t.name ?? t.email ?? "—").join(", ")}</td>
              <td className="companies-td">{c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}</td>
              <td className="companies-td">
                {editingId === c.id ? (
                  <>
                    <button className="action-btn save" onClick={saveEdit}>Save</button>
                    <button className="action-btn cancel" onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="action-btn edit" onClick={() => startEdit(c)}>Edit</button>
                    <button className="action-btn delete" onClick={() => handleDelete(c.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="companies-pagination">
        <button className="companies-btn" onClick={() => setPage(1)} disabled={page === 1}>First</button>
        <button className="companies-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
        <span>Page {page} / {pageCount || 1}</span>
        <button className="companies-btn" onClick={() => setPage((p) => Math.min(pageCount || 1, p + 1))} disabled={page >= pageCount}>Next</button>
        <button className="companies-btn" onClick={() => setPage(pageCount || 1)} disabled={page >= pageCount}>Last</button>

        <div style={{ marginLeft: "auto" }}>
          <small>{total} companies</small>
        </div>
      </div>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={closeSnack}>
        <Alert onClose={closeSnack} severity={snack.severity || 'info'} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
