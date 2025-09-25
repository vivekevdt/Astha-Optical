import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { exportBackup, importBackup } from "../utils/backup";
import { useCustomers } from "../database/useCustomers";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import * as ImagePicker from "expo-image-picker";




export default function Settings({navigation}) {
    const { customers, deleteCustomer, reload } = useCustomers();

  const handleExport = async () => {
    try {
      let response= await exportBackup();
      Toast.show({ type: "success", text1: "Backup exported" });
      navigation.navigate("Customers")
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to export backup" });
    }
  };

  const handleImport = async () => {
    try {
      await importBackup(reload);
      Toast.show({ type: "success", text1: "Backup imported" });
      navigation.navigate("Customers")

    } catch (err) {
      console.log(err)

      Toast.show({ type: "error", text1: "Failed to import backup" });
    }
  };
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [])
  );

 
  

  return (
    <SafeAreaView className="flex-1 bg-neutral-900 p-6">
      {/* Header */}
      <Text className="text-white text-2xl font-bold mb-6">Settings</Text>

      {/* Export Backup */}
      <TouchableOpacity
        className="flex-row gap-2 items-center bg-neutral-800 rounded-2xl p-4 mb-4"
        onPress={handleExport}
      >
        <Ionicons name="cloud-upload-outline" size={24} color="#0891B2" />
        <Text className="text-white text-base font-semibold ml-3">
          Export Backup
        </Text>
      </TouchableOpacity>

      {/* Restore Backup */}
      <TouchableOpacity
        className="flex-row gap-2 items-center bg-neutral-800 rounded-2xl p-4"
        onPress={handleImport}
      >
        <Ionicons name="cloud-download-outline" size={24} color="#0891B2" />
        <Text className="text-white text-base font-semibold ml-3">
          Restore Backup
        </Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}
