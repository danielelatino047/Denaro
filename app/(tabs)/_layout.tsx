import { Tabs } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#00D4AA",
        tabBarInactiveTintColor: "#6B7280",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1F2937",
          borderTopColor: "#374151",
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="arbitrage"
        options={{
          title: "Arbitrage",
          tabBarIcon: ({ color }) => <MaterialIcons name="trending-up" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="ai-trading"
        options={{
          title: "AI Trading",
          tabBarIcon: ({ color }) => <MaterialIcons name="smart-toy" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: "Portfolio",
          tabBarIcon: ({ color }) => <Ionicons name="pie-chart" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color }) => <Ionicons name="wallet" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Ionicons name="settings" color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}