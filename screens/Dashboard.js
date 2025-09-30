import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import { FAB } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import LottieView from "lottie-react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCustomers } from "../database/useCustomers";
import { useFocusEffect } from "@react-navigation/native";

import FloatingButton from "../components/FloatingButton";

export default function DashboardScreen({ navigation }) {
  const animationRef = useRef(null);
  const {
    customers,
    deleteCustomer,
    reload,
    getTotalCustomers,
    getTotalImages,
  } = useCustomers();

  const [totalCustomer, setTotalCustomers] = useState(0);
  const [week, setWeek] = useState(0);
  const [month, setMonth] = useState(0);
  const [images, setImages] = useState(0);

  // 📅 Get start of week (Monday) and start of month
  function getStartOfWeek(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay(); // 0 (Sunday) to 6 (Saturday)
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    
    const startOfWeek = new Date(d.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0); // Reset time to start of day
    
    return startOfWeek;
  }
  
  function getStartOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  function getCustomersThisWeek(customers) {
    const startOfWeek = getStartOfWeek();
    return customers.filter((c) => new Date(c.created_at) >= startOfWeek)
      .length;
  }

  function getCustomersThisMonth(customers) {
    const startOfMonth = getStartOfMonth();
    return customers.filter((c) => new Date(c.created_at) >= startOfMonth)
      .length;
  }


  useFocusEffect(
    useCallback(() => {
      reload();
    }, [])
  );

  useEffect(() => {
    setTotalCustomers(customers.length);
    setWeek(getCustomersThisWeek(customers));
    setMonth(getCustomersThisMonth(customers));
    (async () => {
      const total = await getTotalImages();
      setImages(total);
    })();
  }, [customers]);


  const cardContent = [
    {
      title: "Total Customers",
      icon: "groups",
      count: totalCustomer,
    },
    {
      title: "Total Images",
      icon: "collections",
      count: images,
    },
    {
      title: "Customers This Month",
      icon: "calendar-today",
      count: month,
    },
    {
      title: "Customers This Weak",
      icon: "event",
      count: week,
    },
  ];

  return (
    <View className="flex-1 bg-black">
      {/* Header */}

      {/* Stats Grid */}
      <View className="flex-row flex-wrap justify-around mt-5">
        {cardContent.map((item, index) => (
          <View
            key={index}
            className="bg-neutral-800 w-[45%] h-32 rounded-xl p-2 mb-5 justify-center"
          >
            <View className="flex-row gap-2 justify-evenly items-center  ">
              <Icon name={item.icon} size={24} color="#00BCD4" />
              <Text
                className="text-gray-400 mt-1 text-md flex-shrink"
                numberOfLines={2} // prevent overflow
              >
                {item.title}
              </Text>
            </View>

            <Text className="text-white font-bold text-5xl mt-4 text-center">
              {item.count}
            </Text>
          </View>
        ))}
      </View>
      <View>
        <LottieView
          ref={animationRef}
          source={require("../assets/Dashboard.json")}
          autoPlay
          loop={true}
          style={{ width: 400, height: 400, backgroundColor: "black" }}
        />
      </View>
      <FloatingButton onPress={() => navigation.navigate("AddCustomer")} />
    </View>
  );
}
