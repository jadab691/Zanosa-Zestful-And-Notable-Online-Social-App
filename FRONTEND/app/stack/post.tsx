import { View, Text, TextInput, Button, Image, Alert, Platform } from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import API from "../../config/api";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Post() {
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const router = useRouter();

  // 📸 Pick Image
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 🚀 Upload Post
  const handlePost = async () => {
    try {
      if (!image) {
        Alert.alert("Please select an image");
        return;
      }

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Please login again");
        return;
      }

      const formData = new FormData();

      let filename = image.split("/").pop() || "photo.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";
      
      // Ensure filename has extension for backend/cloudinary
      if (!match) {
        filename = `${filename}.jpg`;
      }

      // ⚠️ IMPORTANT: handle Mobile vs Web
      if (Platform.OS === "web") {
        const res = await fetch(image);
        const blob = await res.blob();
        formData.append("image", blob, filename);
      } else {
        formData.append("image", {
          uri: image,
          name: filename,
          type,
        } as any);
      }

      formData.append("caption", caption);

      const response = await fetch(`${API.defaults.baseURL}/api/posts`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept": "application/json",
          // Note: DO NOT set Content-Type header with fetch and FormData
        },
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Upload failed");
      }

      console.log("POST SUCCESS:", resData);
      Alert.alert("Post uploaded!");

      router.replace("/stack/profile");
    } catch (err: any) {
      console.log("ERROR:", err.response?.data || err.message);
      Alert.alert("Upload failed");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Create Post</Text>

      <Button title="Pick Image" onPress={pickImage} />

      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: 200, height: 200, marginTop: 10 }}
        />
      )}

      <TextInput
        placeholder="Write a caption..."
        value={caption}
        onChangeText={setCaption}
        style={{
          borderWidth: 1,
          marginTop: 10,
          padding: 10,
        }}
      />

      <Button title="Post" onPress={handlePost} />
    </View>
  );
}