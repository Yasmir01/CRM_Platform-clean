import React from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import DocumentUpload from '../../components/documents/DocumentUpload';
import DocumentList from '../../components/documents/DocumentList';

export default function Documents() {
  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h5">Document Management</Typography>
        <DocumentUpload />
        <Divider />
        <DocumentList />
      </Stack>
    </Box>
  );
}
