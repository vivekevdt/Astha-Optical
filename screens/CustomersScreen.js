import React, { useState, useCallback, useRef, useMemo } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator 
} from "react-native";
import { useCustomers } from "../database/useCustomers";
import CustomerCard from "../components/CustomerCard";
import { exportBackup, importBackup } from "../utils/backup";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { Animated, Pressable } from "react-native";
import FloatingButton from "../components/FloatingButton";

export default function CustomersScreen({ navigation }) {
  const scale = useRef(new Animated.Value(1)).current;

  const { customers, deleteCustomer, reload,loading } = useCustomers();
  const [searchQuery, setSearchQuery] = useState("");

  const handleDelete = async (id, imagePaths = []) => {
    try {
      await deleteCustomer(id, imagePaths);
      Toast.show({ type: "success", text1: "Customer deleted" });
    } catch (err) {
      Toast.show({ type: "error", text1: "Error deleting customer" });
    }
  };

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return customers;
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().startsWith(query) ||
        c.phone?.toLowerCase().startsWith(query)
    );
  }, [customers, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      reload();
      setSearchQuery("");

    }, [reload])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity key={item.id} activeOpacity={0.8}>
      <CustomerCard
        customer={item}
        onDelete={handleDelete}
        navigation={navigation}
      />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-black px-5">
      {/* Search bar */}
      <View className="flex-row items-center bg-gray-800 rounded-xl px-3 py-2 my-3">
        <Ionicons name="search" size={20} color="#9ca3af" />
        <TextInput
          placeholder="Search by name or phone no"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 ml-2 text-base text-white"
          placeholderTextColor="#9ca3af"
        />
      </View>
      {/* Customers List */}
   {/* Loading Indicator */}
   {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#60a5fa" />
          <Text className="text-gray-400 mt-3">Loading customers...</Text>
        </View>
      ) : customers.length > 0 ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      ) : (
        <View className="flex-1 items-center justify-center py-10">
          <Text className="text-gray-400 text-base italic">
            No Data Available, Restore Backup or Add New Data
          </Text>
        </View>
      )}

      {/* Floating Add Customer Button */}
      {customers.length === 0 && (
        <FloatingButton onPress={() => navigation.navigate("AddCustomer")} />
      )}
    </View>
  );
}
