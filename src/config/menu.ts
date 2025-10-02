import type { ElementType } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupIcon from '@mui/icons-material/Group';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import ContactsIcon from '@mui/icons-material/Contacts';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import DescriptionIcon from '@mui/icons-material/Description';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BuildIcon from '@mui/icons-material/Build';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ChatIcon from '@mui/icons-material/Chat';
import CampaignIcon from '@mui/icons-material/Campaign';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import ArticleIcon from '@mui/icons-material/Article';
import ConstructionIcon from '@mui/icons-material/Construction';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';

export type AppRole = 'SUPER_ADMIN' | 'ADMIN' | 'OWNER' | 'VENDOR' | 'TENANT' | 'MANAGER';

export type MenuItem = {
  label: string;
  href: string;
  icon?: ElementType;
  roles?: AppRole[];
};

export const MENU: MenuItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
  { label: 'Calendar', href: '/calendar', icon: CalendarMonthIcon },
  { label: 'Contact Management', href: '/contacts', icon: ContactsIcon },
  { label: 'Sales Automation', href: '/sales', icon: LocalOfferIcon },
  { label: 'Marketing Automation', href: '/marketing', icon: AutorenewIcon },
  { label: 'Properties', href: '/properties', icon: HomeIcon },
  { label: 'Tenants', href: '/tenants', icon: PersonIcon },
  { label: 'Prospects', href: '/prospects', icon: GroupIcon },
  { label: 'Leasing Funnel', href: '/leasing', icon: ViewKanbanIcon },
  { label: 'Applications', href: '/applications', icon: DescriptionIcon },
  { label: 'Property Managers', href: '/managers', icon: VerifiedUserIcon },
  { label: 'Service Providers', href: '/vendors', icon: BuildIcon },
  { label: 'Rent Collection', href: '/rent', icon: CreditCardIcon },
  { label: 'Late Fees & Rules', href: '/late-fees', icon: AccountBalanceIcon },
  { label: 'Work Orders', href: '/work-orders', icon: AssignmentIcon },
  { label: 'Customer Service', href: '/support', icon: ChatIcon },
  { label: 'Communications', href: '/comms', icon: CampaignIcon },
  { label: 'Suggestions', href: '/suggestions', icon: TipsAndUpdatesIcon },
  { label: 'News Board', href: '/news', icon: ArticleIcon },
  { label: 'Power Tools', href: '/power-tools', icon: ConstructionIcon },
  { label: 'AI Tools', href: '/ai', icon: SmartToyIcon },
  { label: 'Tasks', href: '/tasks', icon: CheckBoxIcon },
  { label: 'Settings', href: '/settings', icon: SettingsIcon },
  { label: 'Help & Support', href: '/help', icon: HelpIcon },
];

export function normalizeToAppRole(input?: string): AppRole | undefined {
  const r = String(input || '').toLowerCase();
  if (r.includes('super')) return 'SUPER_ADMIN';
  if (r.includes('admin')) return 'ADMIN';
  if (r.includes('owner')) return 'OWNER';
  if (r.includes('tenant')) return 'TENANT';
  if (r.includes('service') || r.includes('vendor')) return 'VENDOR';
  if (r.includes('manager')) return 'MANAGER';
  return undefined;
}
