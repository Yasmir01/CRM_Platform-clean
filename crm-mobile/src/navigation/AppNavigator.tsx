import React, { forwardRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native";
import TenantLeaseDocs from "../screens/TenantLeaseDocs";
import TenantAutopay from "../screens/TenantAutopay";
import WorkOrderChat from "../screens/WorkOrderChat";
import VendorTaskBoard from "../screens/VendorTaskBoard";

const Tab = createBottomTabNavigator();

type Props = { role: "tenant" | "vendor" };

const AppNavigator = forwardRef<NavigationContainerRef<any>, Props>(function AppNavigator(
  { role }: Props,
  ref
) {
  return (
    <NavigationContainer ref={ref}>
      <Tab.Navigator screenOptions={{ headerShown: true }}>
        {role === "tenant" ? (
          <>
            <Tab.Screen name="Documents" component={TenantLeaseDocs} />
            <Tab.Screen name="Autopay" component={TenantAutopay} />
            <Tab.Screen name="Maintenance" component={WorkOrderChat} />
          </>
        ) : (
          <>
            <Tab.Screen name="Tasks" component={VendorTaskBoard} />
            <Tab.Screen name="Messages" component={WorkOrderChat} />
          </>
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
});

export default AppNavigator;
