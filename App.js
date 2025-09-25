import React, { useEffect, useState, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider as PaperProvider } from "react-native-paper";

import CustomersScreen from "./screens/CustomersScreen";
import AddCustomerScreen from "./screens/AddCustomer";
import { CustomersProvider } from "./context/CustomersContext";
import Toast from "react-native-toast-message";
import AnimatedSplash from "./components/AnimatedSplash";
import { createDrawerNavigator } from "@react-navigation/drawer";
import DashboardScreen from "./screens/Dashboard";
import CustomHeader from "./components/CustomHeader";
import { Ionicons } from "@expo/vector-icons";

import { ToastConfig } from "./utils/toastConfig";

import "./global.css";
import { CustomDrawerContent } from "./components/drawer/DrawerNavigator";
import Settings from "./screens/Settings";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current; // Splash opacity

  const handleFinishSplash = () => {
    // Fade out splash
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 600, // fade duration
      useNativeDriver: true,
    }).start(() => {
      setShowSplash(false); // Hide splash after animation
    });
  };

  return (
    <PaperProvider>
      <CustomersProvider>
        <View style={{ flex: 1 }}>
          {/* Splash Screen Layer */}
          {showSplash && (
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                { opacity: fadeAnim, zIndex: 10 },
              ]}
            >
              <AnimatedSplash onFinish={handleFinishSplash} />
            </Animated.View>
          )}

          {/* Main App */}
          <NavigationContainer>
            <Drawer.Navigator
              screenOptions={{
                header: (props) => <CustomHeader {...props} />,
                drawerStyle: {
                  backgroundColor: "#000", // dark background
                  width: 260,
                },
                drawerLabelStyle: {
                  color: "white",
                  fontSize: 16,
                  marginLeft: -10,
                },
                drawerActiveBackgroundColor: "#262626",
                drawerActiveTintColor: "#49B2B6",
                drawerInactiveTintColor: "#9ca3af",
                
              }}
              drawerContent={(props) => <CustomDrawerContent {...props} />}
            >
              <Drawer.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                  drawerIcon: ({ color }) => (
                    <Ionicons name="home" size={20} color={color} style={{marginRight:10}} />
                  ),
                }}
              />
              <Drawer.Screen
                name="Customers"
                component={CustomersScreen}
                options={{
                  drawerIcon: ({ color }) => (
                    <Ionicons name="people" size={20} color={color} style={{marginRight:10}}  />
                  ),
                }}
              />
              <Drawer.Screen
                name="AddCustomer"
                component={AddCustomerScreen}
                options={{
                  drawerIcon: ({ color }) => (
                    <Ionicons
                      name="person-add"
                      size={20}
                      color={color}
                      style={{marginRight:10}}
                    />
                  ),
                }}
              />
              <Drawer.Screen
                name="Settings"
                component={Settings}
                options={{
                  drawerIcon: ({ color }) => (
                    <Ionicons
                      name="settings"
                      size={20}
                      color={color}
                      style={{marginRight:10}}
                    />
                  ),
                }}
              />
            </Drawer.Navigator>

            <Toast config={ToastConfig} />
          </NavigationContainer>
        </View>
      </CustomersProvider>
    </PaperProvider>
  );
}
