import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from "react-native";

import debounce from "lodash/debounce";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useForm, Controller } from "react-hook-form";
import ImageViewer from "react-native-image-zoom-viewer";
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useCustomers } from "../database/useCustomers";
import { useFocusEffect } from "@react-navigation/native";


export default function CustomerForm({
  onSave,
  navigation,
  isView = false,
  isEdit = false,
  currentCustomer,
}) {
  const [pendingImage, setPendingImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [edit, setEdit] = useState(isEdit);

  const [showConfirm, setShowConfirm] = useState(false);
  const [phoneSuggestions, setPhoneSuggestions] = useState([]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }, // 👈 grab errors
  } = useForm({
    defaultValues: {
      name: currentCustomer?.name || "",
      phone: currentCustomer?.phone || "",
    },
  });

  const { customers, reload } = useCustomers();

  const [selectedCustomer, setSelectedCustomer] = useState(
    currentCustomer || null
  );
  const [images, setImages] = useState(
    currentCustomer?.images?.length
      ? currentCustomer.images.map((img) => ({
          uri: img.path,
          date: img.date ? new Date(img.date) : new Date(),
        }))
      : []
  );
  useEffect(() => {
    reset({
      name: currentCustomer?.name || "",
      phone: currentCustomer?.phone || "",
    });

    if (currentCustomer?.images?.length) {
      setImages(
        currentCustomer.images.map((img) => ({
          uri: img.uri || img.path,
          date: img.date ? new Date(img.date) : new Date(),
        }))
      );
    } else {
      setImages([]);
    }

    setSelectedCustomer(currentCustomer || null);
  }, [currentCustomer, reset]);

  const [activeDateIndex, setActiveDateIndex] = useState(null);

  // Modal for image preview
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(true);
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(true);

  const nameValue = watch("name");
  const phoneValue = watch("phone");
  console.log("render")
  useEffect(() => {
    if (!nameValue) {
      setSuggestions([]);
      return;
    }
    const lower = nameValue.toLowerCase();
    const matches = customers.filter(
      (c) => c.name && c.name.toLowerCase().startsWith(lower)
    );
    setSuggestions(matches.slice(0, 5));
  }, [nameValue, customers]);

  useEffect(() => {
    if (!phoneValue) {
      setPhoneSuggestions([]);
      return;
    }

    const lower = phoneValue.toLowerCase();
    const matches = customers.filter(
      (c) =>
        (c.phone && c.phone.startsWith(lower)) ||
        (c.name && c.name.toLowerCase().startsWith(lower))
    );

    setPhoneSuggestions(matches.slice(0, 5));
  }, [phoneValue, customers]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleImage = async (fromCamera = false) => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.2,
    });

    if (!result.canceled) {
      setPendingImage(result.assets[0].uri); // save image temporarily
      setShowDatePicker(true); // open date picker right after selecting image
    }
  };

  const onDatePicked = (event, selectedDate) => {
    setShowDatePicker(false);

    if (event.type === "dismissed") {
      setPendingImage(null); // user canceled
      return;
    }

    if (pendingImage && selectedDate) {
      setImages((prev) => [...prev, { uri: pendingImage, date: selectedDate }]);
      setPendingImage(null);
    }
  };

  const removeImage = (uri) =>
    setImages((prev) => prev.filter((img) => img.uri !== uri));

  const updateImageDate = (index, newDate) =>
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, date: newDate } : img))
    );

  const onSubmit = (data) => {
    onSave({
      id: selectedCustomer?.id || null, // ✅ send ID if editing existing
      ...data,
      images: images.map((img) => ({
        uri: img.uri,
        date: img.date?.toISOString(),
      })),
    });
    setShowConfirm(false); // ✅ close modal after save
    setImages([]);

    reset();
  };

  useFocusEffect(
    useCallback(() => {
      reload();
      setShowNameSuggestions(true);
      setShowPhoneSuggestions(true);
    }, [])
  );

  useEffect(() => {
    if (currentCustomer) {
      reset(currentCustomer);
    }
  }, [currentCustomer, reset]);

  useEffect(() => {
    return () => reset(); // reset when leaving screen
  }, [reset]);

  const suggestionsHandler = (s) => {
    setSelectedCustomer(s); // store customer first
    setSuggestions([]);

    setValue("name", s.name);
    setValue("phone", s.phone || "");

    if (s.images?.length) {
      setImages(
        s.images.map((img) => ({
          uri: img.path,
          date: img.date ? new Date(img.date) : new Date(),
        }))
      );
    }
    setEdit(true);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-black p-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 bg-black p-3">
        {/* Image Modal */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <ImageViewer
            imageUrls={images.map((img) => ({ url: img.uri }))}
            index={images.findIndex((img) => img.uri === selectedImage)}
            enableSwipeDown
            onSwipeDown={() => setModalVisible(false)}
            saveToLocalByLongPress={false}
            backgroundColor="#000"
            renderIndicator={() => null}
            renderHeader={(currentIndex) => (
              <>
                <View className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full">
                  <Text className="text-white font-medium">
                    {currentIndex + 1} / {images.length}
                  </Text>
                </View>
                <View className="absolute top-4 right-1/3 bg-black/50 px-3 py-1 rounded-full">
                  <Text className="text-white font-medium">
                    {images[currentIndex]?.date
                      ? new Date(images[currentIndex].date).toDateString()
                      : ""}
                  </Text>
                </View>
              </>
            )}
          />
          <TouchableOpacity
            className="absolute top-4 right-4 bg-black/50 rounded-full p-2"
            onPress={() => setModalVisible(false)}
          >
            <Text className="text-white text-lg">✕</Text>
          </TouchableOpacity>
        </Modal>

        {/* ===== Fixed Top Section (Inputs) ===== */}
        {/* Name Input */}
        <View className="flex-row items-center justify-start relative">
          <Entypo name="user" size={24} color="white" className="mr-4" />
          <View className="flex-1">
            <Controller
              control={control}
              name="name"
              rules={{
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  testID="input-name" // ✅ Add testID
                  placeholder="Full Name"
                  value={value}
                  onChangeText={onChange}
                  editable={isEdit || (!isEdit && !isView)}
                  placeholderTextColor="#9CA3AF"
                  className={`border border-gray-300 w-full bg-gray-100 rounded-lg p-3 text-base ${
                    isView ? "text-gray-400" : "text-black"
                  }`}
                />
              )}
            />
            {errors.name && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.name.message}
              </Text>
            )}
            {suggestions?.length > 0 &&
              showNameSuggestions &&
              !isView &&
              !isEdit && (
                <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 z-10 shadow-lg">
                  {suggestions.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => {
                        suggestionsHandler(s);
                        setShowNameSuggestions(false); // Hide suggestions after selection
                      }}
                      className="flex-row items-center p-3 border-b border-gray-100"
                      activeOpacity={0.7}
                    >
                      <View className="bg-blue-100 p-2 rounded-full mr-3">
                        <FontAwesome5 name="phone" size={16} color="#1D4ED8" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 font-semibold">
                          {s.name}
                        </Text>
                        <Text className="text-gray-500 text-sm">{s.phone}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}

                  {/* Single Cancel Button below the suggestions */}
                  <TouchableOpacity
                    onPress={() => setShowNameSuggestions(false)}
                    className="p-3 items-center"
                  >
                    <Text className="text-red-500 font-semibold">Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
          </View>
        </View>

        {/* Phone Input */}
        <View className="relative mt-3">
          {/* Phone Input Row */}
          <View className="flex-row items-center gap-2">
            <FontAwesome5
              name="phone"
              size={24}
              color="white"
              className="mr-2"
            />
            <Controller
              control={control}
              name="phone"
              rules={{
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Enter a valid 10-digit phone number",
                },
                maxLength: {
                  value: 10,
                  message: "Phone number cannot exceed 10 digits",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                testID="input-phone"   // ✅ Add testID

                  placeholder="Mobile Number"
                  value={value}
                  onChangeText={(text) => {
                    if (text.length <= 10) onChange(text);
                  }}
                  keyboardType="phone-pad"
                  editable={isEdit || (!isEdit && !isView)}
                  placeholderTextColor="#9CA3AF"
                  className={`border border-gray-300 flex-1 bg-gray-100 rounded-lg p-3 text-base ${
                    isView ? "text-gray-400" : "text-black"
                  }`}
                />
              )}
            />
          </View>

          {/* Validation Error */}
          {errors.phone && (
            <Text className="text-red-500 text-sm mt-1 ml-10">
              {errors.phone.message}
            </Text>
          )}

          {/* Phone Suggestions */}
          {phoneSuggestions?.length > 0 &&
            showPhoneSuggestions &&
            !isView &&
            !isEdit && (
              <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 z-10 shadow-lg">
                {phoneSuggestions.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => {
                      suggestionsHandler(s);
                      setShowPhoneSuggestions(false); // ✅ correct toggle
                    }}
                    className="flex-row items-center p-3 border-b border-gray-100"
                    activeOpacity={0.7}
                  >
                    <View className="bg-blue-100 p-2 rounded-full mr-3">
                      <FontAwesome5 name="phone" size={16} color="#1D4ED8" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-semibold">
                        {s.name}
                      </Text>
                      <Text className="text-gray-500 text-sm">{s.phone}</Text>
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Cancel Button */}
                <TouchableOpacity
                  onPress={() => setShowPhoneSuggestions(false)} // ✅ fixed
                  className="p-3 items-center"
                >
                  <Text className="text-red-500 font-semibold">Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
        </View>

        {/* ===== Scrollable Middle Section (Receipts) ===== */}
        <Text className="text-lg font-semibold text-white mb-2">Receipts</Text>
        <ScrollView className="flex-1 mb-4">
          {(isEdit || (!isEdit && !isView)) && (
            <TouchableOpacity
            testID="btn-add-image"   // ✅ For adding image

              onPress={() => handleImage(true)}
              className="bg-gray-100 border-2 border-dashed border-gray-400 h-40 rounded-xl flex items-center justify-center mb-4"
            >
              <Text className="text-4xl text-gray-500">＋</Text>
              <Text className="text-gray-500">Add Image</Text>
            </TouchableOpacity>
          )}

          {images.map((img, index) => (
            <View
              key={img.uri}
              className="bg-white rounded-xl shadow-md mb-4 overflow-hidden"
            >
              <TouchableOpacity
                onPress={() => {
                  setSelectedImage(img.uri);
                  setModalVisible(true);
                }}
              >
                <Image
                  source={{ uri: img.uri }}
                  className="w-full h-40"
                  resizeMode="cover"
                />
              </TouchableOpacity>
              {(isEdit || (!isEdit && !isView)) && (
                <TouchableOpacity
                  onPress={() => removeImage(img.uri)}
                  className="absolute top-2 right-2 bg-red-500 rounded-full p-1"
                >
                  <Text className="text-white text-xs font-bold">✕</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                className="p-3 border-t border-gray-200"
                onPress={() => setActiveDateIndex(index)}
                disabled={!isEdit}
              >
                <Text
                  className={`text-base ${
                    !isEdit ? "text-gray-400" : "text-gray-700"
                  }`}
                >
                  {img.date ? img.date.toDateString() : "Select Date"}
                </Text>
              </TouchableOpacity>

              {activeDateIndex === index && (
                <DateTimePicker
                  value={img.date || new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={(event, selectedDate) => {
                    setActiveDateIndex(null);
                    if (selectedDate) updateImageDate(index, selectedDate);
                  }}
                />
              )}
            </View>
          ))}
          {showDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={onDatePicked}
            />
          )}
        </ScrollView>

        {/* ===== Fixed Bottom Section (Actions) ===== */}
        <View className="flex-row justify-between gap-3 mt-2 mb-5">
          <TouchableOpacity
            className="flex-1 border border-gray-400 py-3 rounded-lg"
            onPress={() => navigation.navigate("Customers")}
          >
            <Text className="text-center text-cyan-600 font-semibold">
              Back
            </Text>
          </TouchableOpacity>
          {!isView && (
            <TouchableOpacity
            testID="btn-done"   // ✅ Final Done button

              className="flex-1 bg-cyan-600 py-3 rounded-lg"
              onPress={() => setShowConfirm(true)} // open modal first
            >
              <Text className="text-center text-white font-semibold">Done</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Confirm Save Modal */}
        <Modal
          visible={showConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowConfirm(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center">
            <View className="bg-neutral-900 rounded-2xl p-6 w-80">
              {selectedCustomer?.id ? (
                <>
                  <Text className="text-white text-lg font-bold mb-3">
                    Update Customer
                  </Text>
                  <Text className="text-gray-400 mb-6">
                    Are you sure you want to save changes for{" "}
                    <Text className="text-white font-semibold">
                      {watch("name") || "this customer"}
                    </Text>
                    ?
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-white text-lg font-bold mb-3">
                    Save Customer
                  </Text>
                  <Text className="text-gray-400 mb-6">
                    Are you sure you want to create a customer with name{" "}
                    <Text className="text-white font-semibold">
                      {watch("name") || "this customer"}
                    </Text>
                    ?
                  </Text>
                </>
              )}

              <View className="flex-row justify-end">
                <TouchableOpacity
                  onPress={() => setShowConfirm(false)}
                  className="px-4 py-2 rounded-lg mr-3 border border-gray-600"
                >
                  <Text className="text-gray-300 font-medium">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit(onSubmit)}
                  className="bg-cyan-600 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium">Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}
