import React from "react";
import { Text } from "react-native";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#176B8C",

        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 7,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E0EBEF",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Plan",

          tabBarIcon: () => (
            <Text style={{ fontSize: 21 }}>✈️</Text>
          ),
        }}
      />
    </Tabs>
  );
}