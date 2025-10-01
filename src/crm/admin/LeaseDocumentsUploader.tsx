import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Button, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

export default function LeaseDocumentsUploader() {
  const [docs, setDocs] = useState<any[]>([]);
  const leaseId = "lease1";

  const load = async () => {
    const res = await fetch(`/api/leases/${leaseId}/documents`);
    setDocs(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    await fetch(`/api/leases/${leaseId}/documents`, { method: "POST", body: fd });
    await load();
  };

  return (
    <Box p={3}>
      <Typography variant="h6">Lease Documents</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Button component="label" variant="outlined">
          Upload PDF
          <input type="file" hidden accept="application/pdf,image/*" onChange={(e) => e.target.files && upload(e.target.files[0])} />
        </Button>
      </Paper>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Filename</TableCell>
              <TableCell>Uploaded</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {docs.map((d) => (
              <TableRow key={d.id}>
                <TableCell>{d.filename}</TableCell>
                <TableCell>{new Date(d.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
