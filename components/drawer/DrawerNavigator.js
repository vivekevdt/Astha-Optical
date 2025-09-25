import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, backgroundColor: "black" }}
    >
      {/* Header Section */}
      <View className="bg-gray relative items-center py-2 border-b mb-5 border-gray-700">
        {/* Close Button (Top Right) */}
        <TouchableOpacity
          onPress={() => props.navigation.closeDrawer()}
          style={{ position: "absolute", right: 0, top: 10 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>

        <Image
          source={require("../../assets/logo_dark.png")}
          style={{ width: 150, height: 75, marginBottom: 10 }}
        />

        <Text className="text-white flex-shrink text-md tracking-wider italic text-center px-4">
          <MaterialCommunityIcons
            name="format-quote-open"
            size={20}
            color="grey"
          />{" "}
          Care for Every Blink{" "}
          <MaterialCommunityIcons
            name="format-quote-close"
            size={20}
            color="grey"
          />
        </Text>
      </View>

      {/* Drawer Items */}
      <View className="flex-1 bg-black">
        <DrawerItemList {...props} />
      </View>
    </DrawerContentScrollView>
  );
}
