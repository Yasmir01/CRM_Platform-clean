import React from 'react';
import ServiceProvidersPage from '@/app/service-providers/page';

export default function ServiceProvidersBuilder(props: any) {
  // Allow overriding role via props in builder if needed in future
  return <ServiceProvidersPage {...props} /> as any;
}
