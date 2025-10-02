import * as React from 'react';
import SuperAdminLogin, { SuperAdminData } from './pages/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

export default function SuperAdminApp() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [adminData, setAdminData] = React.useState<SuperAdminData | null>(null);

  const handleLoginSuccess = (data: SuperAdminData) => {
    setAdminData(data);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setAdminData(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated || !adminData) {
    return <SuperAdminLogin onSuccess={handleLoginSuccess} />;
  }

  return (
    <SuperAdminDashboard 
      adminData={adminData} 
      onLogout={handleLogout} 
    />
  );
}
