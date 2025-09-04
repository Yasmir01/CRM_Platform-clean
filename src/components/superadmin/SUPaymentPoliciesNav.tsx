import { Box, Button } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Global Policies', to: '/crm/super-admin/payment-policies/global' },
  { label: 'Property Policies', to: '/crm/super-admin/payment-policies/property' },
  { label: 'Lease Policies', to: '/crm/super-admin/payment-policies/lease' },
  { label: 'Matrix', to: '/crm/super-admin/payment-policies/matrix' },
];

export default function SUPaymentPoliciesNav() {
  const { pathname } = useLocation();
  return (
    <Box sx={{ display: 'flex', gap: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 1, mb: 2 }}>
      {navItems.map((item) => {
        const active = pathname.startsWith(item.to);
        return (
          <Button
            key={item.to}
            component={Link}
            to={item.to}
            color={active ? 'primary' : 'inherit'}
            sx={{
              fontWeight: 600,
              borderBottom: active ? '2px solid' : '2px solid transparent',
              borderColor: active ? 'primary.main' : 'transparent',
              borderRadius: 0,
              textTransform: 'none'
            }}
          >
            {item.label}
          </Button>
        );
      })}
    </Box>
  );
}
