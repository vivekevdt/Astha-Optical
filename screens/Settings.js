import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { exportBackup, importBackup } from "../utils/backup";
import { useCustomers } from "../database/useCustomers";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import * as ImagePicker from "expo-image-picker";




export default function Settings({navigation}) {
    const { customers, deleteCustomer, reload } = useCustomers();
    const [exportProgress, setExportProgress] = useState(0);
    const [exportLoading, setExportLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);


  const handleExport = async () => {
    try {
      setExportLoading(true)
      setExportProgress(0)
      await exportBackup((percent) => {
        setExportProgress(percent);
      });
      Toast.show({ type: "success", text1: "Backup exported" });
      navigation.navigate("Customers")
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to export backup" });
    }
    finally {
      setExportLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      setImportLoading(true);

      await importBackup(reload);
      Toast.show({ type: "success", text1: "Backup imported" });
      navigation.navigate("Customers")

    } catch (err) {
      console.log(err)

      Toast.show({ type: "error", text1: "Failed to import backup" });
    }
    finally {
      setImportLoading(false);
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
      {exportLoading && (
        <View className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <ActivityIndicator size="large" color="#60a5fa" />
          <Text className="text-white mt-3 text-lg font-medium">
          Backup is being creating {exportProgress}% Please Wait....
          </Text>
        </View>
      )}
      {importLoading && (
        <View className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <ActivityIndicator size="large" color="#0891B2" />
          <Text className="text-white mt-4 text-base">
            Backup is being restoring Please Wait....
          </Text>
        </View>
      )}

    </SafeAreaView>
  );
}
