import { useState } from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Home, Receipt, Build } from '@mui/icons-material';

export default function MobileNav() {
  const [value, setValue] = useState(0);
  return (
    <BottomNavigation value={value} onChange={(_, v) => setValue(v)}>
      <BottomNavigationAction label="Home" icon={<Home />} />
      <BottomNavigationAction label="Payments" icon={<Receipt />} />
      <BottomNavigationAction label="Maintenance" icon={<Build />} />
    </BottomNavigation>
  );
}
