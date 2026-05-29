import { StyleSheet, Text, View } from "react-native";

export default function Report() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report a Problem</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
});