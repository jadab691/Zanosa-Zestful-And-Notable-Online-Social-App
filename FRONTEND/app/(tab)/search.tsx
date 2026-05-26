import { View, Text, ScrollView, TextInput, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!query) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/api/auth/users?search=${encodeURIComponent(query)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        } else {
          console.log("Search error", await res.text());
        }
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
    };
    const timeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const goToProfile = (user) => {
    router.push({
      pathname: "/stack/userprofile",
      params: { id: user._id, name: user.name, email: user.email, profilePic: user.profilePic },
    });
  };

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
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* Results */}
      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.results}>
        {results.map((user) => (
          <TouchableOpacity key={user._id} style={styles.resultItem} onPress={() => goToProfile(user)}>
            <Image source={{ uri: user.profilePic || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg" }} style={styles.avatar} />
            <Text style={styles.resultName}>{user.name}</Text>
          </TouchableOpacity>
        ))}
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
  results: { flex: 1 },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  resultName: { fontSize: 16 },
});
