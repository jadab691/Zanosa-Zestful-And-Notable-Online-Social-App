import { View, Text, ScrollView, TextInput, StyleSheet } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const Search = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Search</Text>
      </View>

      {/* Search Box */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="gray" />
        <TextInput
          placeholder="Search Your Friend..."
          placeholderTextColor="#999"
          style={styles.searchInput}
        />
      </View>

      {/* Results */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.results}>
        {/* search results here */}
      </ScrollView>
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 10,
    backgroundColor: "#f0f0f0",
  },

  header: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    height: 45,
    marginBottom: 15,
  },

  searchInput: {
    marginLeft: 8,
    fontSize: 16,
    flex: 1,
  },

  results: {
    flex: 1,
  },
});
