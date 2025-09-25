import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CustomerCard({ customer, onDelete,navigation}) {
  const [showConfirm, setShowConfirm] = useState(false);
  

  const handleDelete = () => {
    setShowConfirm(false);
    onDelete(customer.id, customer.imagePaths);
  };

  const handleView = ()=>{
    navigation.navigate("AddCustomer", { customer, isView: true })
  }

  const handleEdit = ()=>{
    navigation.navigate("AddCustomer", { customer, isEdit: true })
  }

const latestImageDate = customer.images.reduce((latest, current) => {
  const currentDate = new Date(current.date);
  return currentDate > latest ? currentDate : latest;
}, new Date(0)); // Start from epoch time

console.log(latestImageDate);
  return (
    <View className="bg-neutral-800  rounded-2xl p-4 mb-4 relative">
      {/* Delete button (top-right) */}
      <TouchableOpacity
        onPress={() => setShowConfirm(true)}
        className="absolute top-3 right-3 z-10"
      >
        <Ionicons name="trash" size={22} color="red" />
      </TouchableOpacity>

      {/* Top Row: Avatar + Name */}
      <View className="flex-row items-center mb-3">
        {customer.avatar ? (
          <Image
            source={{ uri: customer.avatar }}
            className="w-12 h-12 rounded-full mr-3"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-cyan-600 mr-3 items-center justify-center">
            <Text className="text-white font-bold text-lg">
              {customer.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View className="flex-1">
          <Text className="text-white font-bold text-base">
            {customer.name}
          </Text>
        </View>
      </View>

      {/* Details Section */}
      <View className="mt-2 flex gap-2 ">
        {customer.email && (
          <View className="flex-row items-center">
            <Ionicons name="mail-outline" size={16} color="#0891B2" />
            <Text className="text-gray-400 text-sm ml-2">{customer.email}</Text>
          </View>
        )}
        {customer.phone && (
          <View className="flex-row items-center">
            <Ionicons name="call-outline" size={16} color="#0891B2" />
            <Text className="text-gray-400 text-sm ml-2">{customer.phone}</Text>
          </View>
        )}
        {customer.images && (
          <View className="flex-row items-center mb-1">
            <Ionicons name="images-outline" size={16} color="#0891B2" />
            <Text className="text-gray-400 text-sm ml-2">
              {customer.images.length > 0
                ? `${customer.images.length} image(s)`
                : "No uploads"}
            </Text>
          </View>
        )}
        {customer.images && (
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={16} color="#0891B2" />
            <Text className="text-gray-400 text-sm ml-2">
              Last visit:{" "}
              {customer.images?.length > 0
                ? latestImageDate.toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )
                : "No visits yet"}{" "}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-end mt-4">
        <TouchableOpacity
          className="border border-cyan-600 px-4 py-2 rounded-lg mr-2"
          onPress={handleView}
        >
          <Text className="text-cyan-600 font-semibold text-sm text-center">
            View Details
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-cyan-600 px-4 py-2 rounded-lg"
          onPress={handleEdit}
        >
          <Text className="text-white font-semibold text-sm text-center">
            Edit
          </Text>
        </TouchableOpacity>
      </View>

      {/* Confirm Delete Modal */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-neutral-900 rounded-2xl p-6 w-80">
            <Text className="text-white text-lg font-bold mb-3">
              Delete Customer
            </Text>
            <Text className="text-gray-400 mb-6">
              Are you sure you want to delete{" "}
              <Text className="text-white font-semibold">{customer.name}</Text>?
            </Text>

            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg mr-3 border border-gray-600"
              >
                <Text className="text-gray-300 font-medium">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDelete}
                className="bg-red-600 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-medium">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
