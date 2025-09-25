import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { unzip, zip } from "react-native-zip-archive";
import * as Sharing from "expo-sharing";
import * as TaskManager from "expo-task-manager";
import * as BackgroundTask from 'expo-background-task';
import * as Notifications from "expo-notifications"





// Define public media folder
const MEDIA_FOLDER = FileSystem.documentDirectory + "SQLite/";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,   
    shouldShowList: true,    
    shouldPlaySound: true,
    shouldSetBadge: false,        
  }),
});




export default function Test() {
  const [db, setDb] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [image, setImage] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null); // 👈 store chosen customer

  const [searchQuery, setSearchQuery] = useState(""); // 🔍 search state

  const BACKUP_TASK = "weekly-backup-task";

  const filteredCustomers = customers.filter((c) =>
  c.name?.toLowerCase().includes(searchQuery.toLowerCase())
);

async function scheduleWeeklyReminder() {
  const existing = await Notifications.getAllScheduledNotificationsAsync();

  if (existing.length === 0) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Weekly Backup Reminder",
        body: "Tap to upload your customer DB backup now.",
      },
      trigger: { seconds: 10, repeats: false },

    });
    console.log("✅ Weekly notification scheduled");
  } else {
    console.log("⏩ Notification already scheduled, skipping");
  }
}

  useEffect(() => {
    (async () => {
      await Notifications.requestPermissionsAsync();
      await scheduleWeeklyReminder();
    })();
  }, []);

  // Init DB + folder on mount
  useEffect(() => {
    (async () => {
      // open or create DB
      const database = await SQLite.openDatabaseAsync("customers.db");
      setDb(database);

      // create table if not exists
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          phone TEXT,
          age INTEGER,
          imagePath TEXT
          
        );
      `);

      await initMediaFolder();
      await loadCustomers(database);
    })();
  }, []);

  // Ensure Media folder exists
  const initMediaFolder = async () => {
    const info = await FileSystem.getInfoAsync(MEDIA_FOLDER);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(MEDIA_FOLDER, {
        intermediates: true,
      });
    }
  };



  const deleteDatabase = async () => {
    try {
      const dbFile = FileSystem.documentDirectory + "SQLite/customers.db";

      const info = await FileSystem.getInfoAsync(dbFile);
      if (info.exists) {
        await FileSystem.deleteAsync(dbFile, { idempotent: true });
        setCustomers([]); // clear UI
        Alert.alert("Success", "Database deleted successfully!");

        // Recreate empty DB so app is usable immediately
        const database = await SQLite.openDatabaseAsync("customers.db");
        setDb(database);
        await database.execAsync(`CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          phone TEXT,
          age INTEGER,
          imagePath TEXT
        );`);
      } else {
        Alert.alert("Info", "Database file does not exist.");
      }
    } catch (err) {
      console.log("Error deleting DB:", err);
      Alert.alert("Error", "Could not delete database.");
    }
  };

  // Pick image from camera
  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  

// Export backup (DB + media folder)
const exportBackup = async () => {
  try {
    const dbPath = FileSystem.documentDirectory + "SQLite/customers.db";
    const backupFolder = FileSystem.cacheDirectory + "backup/";
    const zipPath = FileSystem.cacheDirectory + "customers-backup.zip";

    // Clear old backup folder
    const info = await FileSystem.getInfoAsync(backupFolder);
    if (info.exists) {
      await FileSystem.deleteAsync(backupFolder, { idempotent: true });
    }
    await FileSystem.makeDirectoryAsync(backupFolder, { intermediates: true });

    // Copy DB
    await FileSystem.copyAsync({
      from: dbPath,
      to: backupFolder + "customers.db",
    });

    // Copy Media
    const mediaFiles = await FileSystem.readDirectoryAsync(MEDIA_FOLDER);
    for (const file of mediaFiles) {
      await FileSystem.copyAsync({
        from: MEDIA_FOLDER + file,
        to: backupFolder + file,
      });
    }

    // Zip the folder
    await zip(backupFolder, zipPath);

    // Share the zip
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(zipPath);
    } else {
      Alert.alert("Backup saved at:", zipPath);
    }
  } catch (err) {
    console.log("Export error:", err);
    Alert.alert("Error", "Could not export backup.");
  }
};




// send backup to email
// const uploadBackup = async (zipPath) => {

//   console.log(zipPath)
//   try {
//     const uriParts = zipPath.split("/");
//     const fileName = uriParts[uriParts.length - 1];

//     const formData = new FormData();
//     formData.append("file", {
//       uri: zipPath,
//       type: "application/zip",
//       name: fileName,
//     });
//     console.log(formData)

//     await fetch("http://10.0.2.2:3000/upload-backup", {
//       method: "POST",
//       body: formData,
//       headers: { "Content-Type": "multipart/form-data" },
//     });

//     console.log("Backup uploaded successfully!");
//   } catch (err) {
//     console.log("Upload failed:", err);
//   }
// };




  const importBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/zip",
        copyToCacheDirectory: true,
      });
  
      if (result.canceled) return;
  
      const pickedZip = result.assets[0].uri;
      const destFolder = FileSystem.documentDirectory+"SQLite/";
  
      // Unzip backup into app's document directory
      await unzip(pickedZip, destFolder);
  
      Alert.alert("Success", "Backup restored!");
      await loadCustomers(); // reload UI
    } catch (err) {
      console.log("Import error:", err);
      Alert.alert("Error", "Could not restore backup.");
    }
  };


  // Save customer
  const saveCustomer = async () => {
    if (!name || !phone) {
      Alert.alert("Error", "Name & Phone are required");
      return;
    }
    if (!db) return;

    let savedImagePath = null;
    if (image) {
      const imgName = Date.now() + ".jpg";
      savedImagePath = MEDIA_FOLDER + imgName;
      await FileSystem.copyAsync({ from: image, to: savedImagePath });
    }

    await db.runAsync(
      "INSERT INTO customers (name, phone, age, imagePath) VALUES (?, ?, ?, ?)",
      [name, phone, age, savedImagePath]
    );

    await loadCustomers(db);

    setName("");
    setPhone("");
    setAge("");
    setImage(null);
    Alert.alert("Success", "Customer saved!");
  };

  // Load all customers
  const loadCustomers = async (database = db) => {
    if (!database) return;
    const rows = await database.getAllAsync("SELECT * FROM customers");
    setCustomers(rows);
  };

  // Delete customer
  const deleteCustomer = async (id, imagePath) => {
    if (!db) return;

    await db.runAsync("DELETE FROM customers WHERE id = ?", [id]);
    if (imagePath) {
      await FileSystem.deleteAsync(imagePath, { idempotent: true });
    }
    await loadCustomers(db);
  };


//

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Add Customer</Text>

      {/* Inputs */}
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 8, marginVertical: 5 }}
      />
      <TextInput
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={{ borderWidth: 1, padding: 8, marginVertical: 5 }}
      />
      <TextInput
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 8, marginVertical: 5 }}
      />

      <Button title="Capture Image" onPress={pickImage} />
      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: 100, height: 100, margin: 10 }}
        />
      )}

      <Button title="Save Customer" onPress={saveCustomer} />
      <Button title="Export DB" onPress={exportBackup} />
      <Button title="Import from SD Card" onPress={importBackup} />
      <Button
        title="Delete Entire Database"
        color="red"
        onPress={deleteDatabase}
      />

      {/* 🔍 Search bar */}
      <TextInput
        placeholder="Search by name..."
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          setSelectedCustomer(null); // reset when typing new search
        }}
        style={{
          borderWidth: 1,
          padding: 8,
          marginVertical: 10,
          borderColor: "gray",
        }}
      />

      {/* Matching names list */}
      {searchQuery.length > 0 && !selectedCustomer && (
        <View style={{ marginVertical: 10 }}>
          {filteredCustomers.map((c) => (
            <Text
              key={c.id}
              onPress={() => setSelectedCustomer(c)} // 👈 select on tap
              style={{
                padding: 8,
                borderBottomWidth: 1,
                borderColor: "#ddd",
                fontSize: 16,
              }}
            >
              {c.name}
            </Text>
          ))}
          {filteredCustomers.length === 0 && (
            <Text style={{ color: "gray", marginTop: 5 }}>No matches found</Text>
          )}
        </View>
      )}

      {/* Show details after selecting */}
      {selectedCustomer && (
        <View
          style={{
            marginTop: 20,
            padding: 10,
            borderWidth: 1,
            borderColor: "black",
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>Customer Details</Text>
          <Text>Name: {selectedCustomer.name}</Text>
          <Text>Phone: {selectedCustomer.phone}</Text>
          <Text>Age: {selectedCustomer.age}</Text>
          {selectedCustomer.imagePath && (
            <Image
              source={{ uri: selectedCustomer.imagePath }}
              style={{ width: 100, height: 100, marginTop: 10 }}
            />
          )}
          <Button
            title="Delete"
            onPress={() => deleteCustomer(selectedCustomer.id, selectedCustomer.imagePath)}
          />
        </View>
      )}
    </ScrollView>
  );
}
