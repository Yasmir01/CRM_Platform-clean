import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCrmData } from '../contexts/CrmDataContext';
import { LocalStorageService } from '../services/LocalStorageService';

export interface ServiceProviderScope {
  isServiceProvider: boolean;
  providerName: string | null;
  providerEmail: string | null;
  providerCompany: string | null;
  providerAliases: string[]; // names to match against assignedTo/assignee fields
  filterWorkOrders: <T extends { assignedTo?: string; status?: string; propertyId?: string }>(workOrders: T[]) => T[];
  propertiesWithAssignments: Set<string>; // propertyIds that have assigned open/in-progress items
  filterEvents: <T extends { assignedTo?: string }>(events: T[]) => T[];
}

function normalize(str?: string | null) {
  return (str || '').trim().toLowerCase();
}

export function useServiceProviderScope(): ServiceProviderScope {
  const { user } = useAuth();
  const { state } = useCrmData();
  const isServiceProvider = user?.role === 'Service Provider';

  const providerName = useMemo(() => (user ? `${user.firstName} ${user.lastName}`.trim() : null), [user]);
  const providerEmail = user?.email ?? null;

  // Try to infer provider company from CRM contacts or saved mapping
  const providerCompany = useMemo(() => {
    if (!isServiceProvider) return null;

    // 1) Explicit saved mapping (user-selected) takes precedence
    const saved = LocalStorageService.getItem<string>('serviceProviderCompany', '');
    if (saved) return saved;

    const contacts = state.contacts || [];
    // 2) Find service provider contact by email
    const byEmail = contacts.find(
      (c: any) => c.type === 'ServiceProvider' && normalize(c.email) === normalize(providerEmail)
    );
    if (byEmail?.company) return byEmail.company;

    // 3) Find by contact person name
    const byName = contacts.find(
      (c: any) => c.type === 'ServiceProvider' && `${c.firstName} ${c.lastName}`.trim().toLowerCase() === (providerName || '').toLowerCase()
    );
    if (byName?.company) return byName.company;

    // 4) Try from Service Providers page data persisted in localStorage
    const providers = LocalStorageService.getServiceProviders();
    const providerFromList = providers.find((p: any) => {
      return (
        normalize(p.email) === normalize(providerEmail) ||
        normalize(p.contactPerson) === normalize(providerName)
      );
    });
    if (providerFromList?.companyName) return providerFromList.companyName;

    return null;
  }, [isServiceProvider, providerEmail, providerName, state.contacts]);

  const providerAliases = useMemo(() => {
    const aliases: string[] = [];
    if (providerName) aliases.push(providerName);
    if (providerCompany) aliases.push(providerCompany);

    // Also include common variations (company without suffixes)
    if (providerCompany) {
      const simplified = providerCompany.replace(/\b(inc|llc|co\.?|ltd)\b/gi, '').trim();
      if (simplified && simplified.toLowerCase() !== providerCompany.toLowerCase()) {
        aliases.push(simplified);
      }
    }
    return aliases.filter(Boolean);
  }, [providerName, providerCompany]);

  const matchesAlias = (value?: string) => {
    const v = normalize(value);
    if (!v) return false;
    return providerAliases.some(a => v.includes(normalize(a)));
  };

  const filterWorkOrders = <T extends { assignedTo?: string; status?: string; propertyId?: string }>(workOrders: T[]) => {
    if (!isServiceProvider) return workOrders;
    return (workOrders || []).filter(wo => matchesAlias(wo.assignedTo));
  };

  const scopedWorkOrders = useMemo(() => {
    // Pull from both sources to be resilient
    const stored = LocalStorageService.getWorkOrders();
    const stateWos = (state as any).workOrders || [];
    const combined = Array.isArray(stored) && stored.length > 0 ? stored : stateWos;
    return filterWorkOrders(combined);
  }, [state, isServiceProvider, providerAliases]);

  const propertiesWithAssignments = useMemo(() => {
    const set = new Set<string>();
    (scopedWorkOrders || [])
      .filter((wo: any) => ['Open', 'Assigned', 'In Progress'].includes(wo.status))
      .forEach((wo: any) => {
        if (wo.propertyId) set.add(wo.propertyId);
      });
    return set;
  }, [scopedWorkOrders]);

  const filterEvents = <T extends { assignedTo?: string }>(events: T[]) => {
    if (!isServiceProvider) return events;
    return (events || []).filter(ev => matchesAlias(ev.assignedTo));
  };

  return {
    isServiceProvider,
    providerName,
    providerEmail,
    providerCompany,
    providerAliases,
    filterWorkOrders,
    propertiesWithAssignments,
    filterEvents,
  };
}

export default useServiceProviderScope;
