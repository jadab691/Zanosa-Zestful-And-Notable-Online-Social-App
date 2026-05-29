import {
  View,
  Text,
  TextInput,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useState, useRef } from "react";
import * as ImagePicker from "expo-image-picker";
import API from "../../config/api";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../context/ThemeContext";

export default function Post() {
  const { colors } = useTheme();
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

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

  const handlePost = async () => {
    try {
      if (!image) return Alert.alert("Please select an image");

      const token = await AsyncStorage.getItem("token");
      if (!token) return Alert.alert("Please login again");

      setLoading(true);

      const formData = new FormData();

      let filename = image.split("/").pop() || "photo.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      if (!match) filename = `${filename}.jpg`;

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
          Accept: "application/json",
        },
      });

      const resData = await response.json();

      if (!response.ok) throw new Error(resData.message);

      Alert.alert("Post uploaded!");
      router.replace("/stack/profile");
    } catch (err) {
      Alert.alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 30}
    >
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER CARD */}
        <View
          style={{
            backgroundColor: colors.card,
            padding: 100,
            borderRadius: 100,
            marginBottom: 20,
            shadowColor: "#f30303ff",
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 100,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "900",
              color: colors.text,
              letterSpacing: 1,

            }}
          >
            Create Post
          </Text>
          <Text style={{ color: colors.text, opacity: 0.6, marginTop: 4 }}>
            Share Your News With Zanosa Community Now ...
          </Text>
        </View>

        {/* PICK IMAGE BUTTON */}
        <TouchableOpacity
          onPress={pickImage}
          style={{
            backgroundColor: colors.primary,
            padding: 14,
            borderRadius: 14,
            alignItems: "center",
            marginBottom: 15,
            shadowColor: colors.primary,
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          <Text style={{ color: "#aaff00ff", fontWeight: "700", fontSize: 15 }}>
            Pick the Image
          </Text>
        </TouchableOpacity>

        {/* IMAGE PREVIEW */}
        {image && (
          <View
            style={{
              backgroundColor: colors.card,
              padding: 10,
              borderRadius: 18,
              marginBottom: 15,
            }}
          >
            <Image
              source={{ uri: image }}
              style={{
                width: "100%",
                height: 250,
                borderRadius: 15,
              }}
              resizeMode="cover"
            />
          </View>
        )}

        {/* CAPTION INPUT */}
        <TextInput
          placeholder="Write a caption..."
          placeholderTextColor={colors.text}
          value={caption}
          onChangeText={setCaption}
          multiline
          onFocus={() => {
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 300);
          }}
          style={{
            backgroundColor: colors.card,
            color: colors.text,
            padding: 14,
            borderRadius: 14,
            minHeight: 90,
            textAlignVertical: "top",
            marginBottom: 20,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        />

        {/* POST BUTTON WITH LOADING */}
        <TouchableOpacity
          onPress={handlePost}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#64748B" : colors.primary,
            padding: 14,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            shadowColor: colors.primary,
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          {loading ? (
            <>
              <ActivityIndicator color="#fff" />
              <Text style={{ color: "#fff", marginLeft: 10, fontWeight: "700" }}>
                Posting...
              </Text>
            </>
          ) : (
            <Text style={{ color: "#fbff00ff", fontSize: 20, fontWeight: "800" }}>
              Publish
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}