import Box from '@mui/material/Box';
import SUPaymentPoliciesNav from '../../components/superadmin/SUPaymentPoliciesNav';
import PaymentPolicyManager from '../../components/admin/PaymentPolicyManager';

export default function SUPaymentPoliciesProperty() {
  return (
    <Box sx={{ p: 2 }}>
      <SUPaymentPoliciesNav />
      <PaymentPolicyManager />
    </Box>
  );
}
