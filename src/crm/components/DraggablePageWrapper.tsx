import React from 'react';
import UniversalDashboardLayout from './UniversalDashboardLayout';

interface DraggablePageWrapperProps {
  children: React.ReactNode;
  pageName: string;
  enableDraggable?: boolean;
  defaultLayouts?: Record<string, any>;
}

/**
 * Easy wrapper to make any CRM page have draggable widgets
 * 
 * Usage:
 * 1. Wrap your page content with <DraggablePageWrapper pageName="properties">
 * 2. Add data-widget-id and data-widget-title props to elements you want draggable
 * 3. Optionally set enableDraggable={false} to disable for specific pages
 */
const DraggablePageWrapper: React.FC<DraggablePageWrapperProps> = ({
  children,
  pageName,
  enableDraggable = true,
  defaultLayouts = {}
}) => {
  if (!enableDraggable) {
    return <>{children}</>;
  }

  return (
    <UniversalDashboardLayout 
      storageKey={`crm-${pageName}-layout`}
      defaultLayouts={defaultLayouts}
    >
      {children}
    </UniversalDashboardLayout>
  );
};

export default DraggablePageWrapper;

/**
 * Higher-order component to automatically wrap pages
 */
export const withDraggableLayout = (
  Component: React.ComponentType<any>,
  pageName: string,
  defaultLayouts?: Record<string, any>
) => {
  return (props: any) => (
    <DraggablePageWrapper 
      pageName={pageName} 
      defaultLayouts={defaultLayouts}
    >
      <Component {...props} />
    </DraggablePageWrapper>
  );
};

/**
 * Hook to easily make elements draggable
 */
export const useDraggableWidget = (id: string, title: string, defaultLayout?: any) => {
  return {
    'data-widget-id': id,
    'data-widget-title': title,
    'data-default-layout': defaultLayout
  };
};
