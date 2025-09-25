import { BaseToast, ErrorToast } from "react-native-toast-message";

export const  ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "green", backgroundColor: "#1e293b" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 18,
        fontWeight: "bold",
        color: "#22c55e",
      }}
      text2Style={{
        fontSize: 14,
        color: "#cbd5e1",
      }}
    />
  ),

  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: "red", backgroundColor: "#1e293b" }}
      text1Style={{
        fontSize: 18,
        fontWeight: "bold",
        color: "#ef4444",
      }}
      text2Style={{
        fontSize: 14,
        color: "#fca5a5",
      }}
    />
  ),
};
