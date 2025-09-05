import Box from '@mui/material/Box';
import SUPaymentPoliciesNav from '../../components/superadmin/SUPaymentPoliciesNav';
import PolicyMatrix from '../../components/admin/PolicyMatrix';

export default function SUPaymentPoliciesMatrix() {
  return (
    <Box sx={{ p: 2 }}>
      <SUPaymentPoliciesNav />
      <PolicyMatrix />
    </Box>
  );
}
