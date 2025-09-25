import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useBackup } from "../hooks/useBackup";

import { useBackup } from "../utils/backup";

export default function BackupScreen() {
  const { exportBackup, cancelBackup, isBackingUp, progressMessage } = useBackup();

  return (
    <View className="flex-1 justify-center items-center bg-black p-5">
      <Text className="text-white text-lg mb-5">{progressMessage || "Ready to backup"}</Text>

      {isBackingUp ? (
        <>
          <ActivityIndicator size="large" color="#00BCD4" />
          <TouchableOpacity
            onPress={cancelBackup}
            className="bg-red-600 px-6 py-3 rounded mt-5"
          >
            <Text className="text-white font-semibold">Cancel Backup</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          onPress={exportBackup}
          className="bg-cyan-600 px-6 py-3 rounded"
        >
          <Text className="text-white font-semibold">Start Backup</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
