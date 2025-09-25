import React from "react";
import { Image } from "react-native";
import { Appbar } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function CustomHeader({ navigation, route, options }) {
  const title = options.title !== undefined ? options.title : route.name;

  return (
    <Appbar.Header style={{
      backgroundColor: "black",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom:10
    }} >
      {/* Menu button */}
      <Appbar.Action
        icon={() => <Icon name="menu" size={28} color="white" />}
        onPress={() => navigation.openDrawer()}
      />
      {/* Title */}
      <Appbar.Content
        title={title}
        titleStyle={{ color: "white",  }}
      />
      <Image
        source={require("../assets/logo_dark.png")}
        style={{ width: 100, height: 50,padding:10 }}
      />

    </Appbar.Header>
  );
}
