import React, { useCallback ,useEffect} from "react";
import { View, TouchableOpacity, Text } from "react-native";
import CustomerForm from "../components/CustomerForm";
import { useCustomers } from "../database/useCustomers";
import Toast from "react-native-toast-message";
import { useFocusEffect } from "@react-navigation/native";


export default function AddCustomerScreen({ navigation, route }) {
  const { addCustomer, updateCustomer, reload } = useCustomers();
  const { customer, isView = false, isEdit = false } = route.params || {};
  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = async (data) => {
    try {
      if (!data.id) {
        await addCustomer(data);
      } else {
        await updateCustomer(data);
      }
      // if (onSave) onSave();
      Toast.show({
        type: "success", // success | error | info
        text1: "Successfull",
        text2: data.id ? "Customer Updated" : "New Customer Added",
      });

      navigation.navigate("Dashboard");
    } catch (error) {
      Toast.show({
        type: "error", // success | error | info
        text1: "Failed",
        text2: "Failed to save customer",
      });
      console.error("Failed to save customer:", error);

      // Example: show an alert
      Alert.alert(
        "Error",
        "Something went wrong while saving the customer. Please try again."
      );

      // Or handle specific errors:
      // if (error.response?.status === 400) { ... }
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateCustomer(data);
      // navigation.goBack();
    } catch (error) {
      console.error("Failed to update customer:", error);

      // Example: show an alert
      Alert.alert(
        "Error",
        "Something went wrong while saving the customer. Please try again."
      );

      // Or handle specific errors:
      // if (error.response?.status === 400) { ... }
    }
  };

  // used to reset values
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        navigation.setParams({ customer: null, isView: false, isEdit: false });
      };
    }, [navigation])
  );

  return (
    <View style={{ flex: 1, marginBottom: 15, backgroundColor: "black" }}>
      <CustomerForm
        onSave={handleSave}
        onUpdate={handleUpdate}
        currentCustomer={customer}
        isView={isView}
        isEdit={isEdit}
        navigation={navigation}
      />
    </View>
  );
}
