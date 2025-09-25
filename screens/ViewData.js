import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ScrollView,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function UserDetailsScreen({ route }) {
  const { customer } = route.params; // ✅ Comes with receipts + images
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <ScrollView style={styles.container}>
      {/* User Info Card */}
      <View style={styles.card}>
        <Text style={styles.name}>{customer.name}</Text>
        <Text style={styles.detail}>Age: {customer.age}</Text>
        <Text style={styles.detail}>📞 {customer.phone}</Text>
      </View>

      {/* Receipts */}
      <Text style={styles.sectionHeader}>Receipts</Text>
{customer.imagePaths && customer.imagePaths.length > 0 ? (
  <View style={styles.receiptCard}>
    <FlatList
      horizontal
      data={customer.imagePaths}   // 👈 directly use the array of URIs
      keyExtractor={(uri, idx) => uri + idx}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => setSelectedImage(item)}>
          <Image source={{ uri: item }} style={styles.image} />
        </TouchableOpacity>
      )}
      showsHorizontalScrollIndicator={false}
    />
  </View>
) : (
  <Text style={{ color: "#888", marginTop: 8 }}>
    No receipts available
  </Text>
)}

      {/* Full Image Modal */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalBackground}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullImage} />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  card: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  name: { fontSize: 22, fontWeight: "bold", marginBottom: 8, color: "#333" },
  detail: { fontSize: 15, color: "#555", marginBottom: 4 },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#222",
  },
  receiptCard: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  date: { fontSize: 14, fontWeight: "500", marginBottom: 8, color: "#444" },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: "70%",
    borderRadius: 12,
    resizeMode: "contain",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
});
