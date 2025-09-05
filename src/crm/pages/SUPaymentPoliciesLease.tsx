import Box from '@mui/material/Box';
import SUPaymentPoliciesNav from '../../components/superadmin/SUPaymentPoliciesNav';
import LeasePolicyManager from '../../components/admin/LeasePolicyManager';

export default function SUPaymentPoliciesLease() {
  return (
    <Box sx={{ p: 2 }}>
      <SUPaymentPoliciesNav />
      <LeasePolicyManager />
    </Box>
  );
}
