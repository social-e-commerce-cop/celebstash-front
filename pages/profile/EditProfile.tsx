import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  StatusBar,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";

import { getSessionUser } from "@/lib/session";
import { profileService } from "@/lib/profileService";

const { width, height } = Dimensions.get("window");
const PURPLE = "#7126D0";
const LIGHT_BG = "#F5F8FA";

const EditProfile = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const sessionUser = getSessionUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Profile fields
  const [fullName, setFullName] = useState(sessionUser.fullName || "");
  const [username, setUsername] = useState(sessionUser.username || "");
  const [email, setEmail] = useState(sessionUser.email || "");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
      if (type === "success") {
        navigation.goBack();
      }
    }, 2000);
  };

  // Load real profile from backend on mount
  useEffect(() => {
    profileService
      .getMyProfile()
      .then((profile) => {
        if (profile) {
          setFullName(profile.fullName || "");
          setUsername(profile.username || "");
          if (profile.email) setEmail(profile.email);
          setBio(profile.bio || "");
          if (profile.profilePicture) {
            setAvatar(profile.profilePicture);
          }
        }
      })
      .catch(() => {
        // Session data is already pre-filled as fallback
      })
      .finally(() => setLoading(false));
  }, []);

  // Pick avatar and stage it locally (don't upload yet, upload on save)
  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showToast("We need photo permissions to edit your avatar.", "error");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions?.Images || 'images' as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Stage the local URI for preview; actual upload happens on save
      setPendingAvatarUri(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      showToast("Full name is required.", "error");
      return;
    }

    setSaving(true);
    try {
      let profilePictureUrl = avatar;

      // If user picked a new avatar, upload it first
      if (pendingAvatarUri) {
        setUploadingAvatar(true);
        try {
          profilePictureUrl = await profileService.uploadProfilePicture(pendingAvatarUri);
          setAvatar(profilePictureUrl);
          setPendingAvatarUri(null);
        } catch {
          showToast("Avatar upload failed. Please try again.", "error");
          setSaving(false);
          setUploadingAvatar(false);
          return;
        }
        setUploadingAvatar(false);
      }

      // Save profile data to backend
      await profileService.updateMyProfile({
        fullName: fullName.trim(),
        username: username.trim() || undefined,
        bio: bio.trim() || undefined,
        profilePicture: profilePictureUrl || undefined,
      });

      showToast("Profile updated successfully!", "success");
    } catch (err: any) {
      showToast(err?.message || "Could not save profile. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  const displayedAvatar = pendingAvatarUri || avatar;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Custom Toast Banner */}
      {toast && (
        <View style={[styles.toast, toast.type === "success" ? styles.toastSuccess : styles.toastError]}>
          <Ionicons
            name={toast.type === "success" ? "checkmark-circle" : "alert-circle"}
            size={22}
            color={toast.type === "success" ? "#16A34A" : "#E63636"}
          />
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSaveProfile} style={styles.doneBtn} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={PURPLE} />
          ) : (
            <Text style={styles.doneBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar Picker */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            {displayedAvatar ? (
              <Image source={{ uri: displayedAvatar }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarImage, { backgroundColor: "#E5E7EB", justifyContent: "center", alignItems: "center" }]}>
                <Ionicons name="person" size={40} color="#9CA3AF" />
              </View>
            )}
            <TouchableOpacity style={styles.avatarEditBtn} onPress={pickAvatar} disabled={uploadingAvatar}>
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="camera" size={16} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarTip}>Tap camera to change profile photo</Text>
        </View>

        {/* Input Fields Card */}
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.textInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter full name"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>Username *</Text>
            <TextInput
              style={styles.textInput}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: "#F3F4F6", color: "#6B7280" }]}
              value={email}
              editable={false}
              placeholder="Email address"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.textInput, { height: 80, textAlignVertical: "top", paddingTop: 10 }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell the world about yourself..."
              multiline
              maxLength={300}
            />
            <Text style={{ fontSize: 11, color: "#9CA3AF", textAlign: "right", marginTop: 2 }}>
              {bio.length}/300
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.05,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
    paddingTop: height * 0.04,
    paddingBottom: height * 0.015,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    color: "#000",
    fontFamily: "Poppins-Bold",
    fontSize: 18,
  },
  doneBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 50,
    alignItems: "center",
  },
  doneBtnText: {
    color: PURPLE,
    fontFamily: "Poppins-Bold",
    fontSize: 16,
  },
  scrollContent: {
    paddingVertical: height * 0.03,
    paddingHorizontal: width * 0.05,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarWrapper: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: PURPLE,
    padding: 2,
    backgroundColor: "#FFF",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  avatarEditBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: PURPLE,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  avatarTip: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#8A8A8A",
    marginTop: 8,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 20,
  },
  fieldGroup: { marginBottom: 20 },
  inputLabel: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 15,
    color: "#1F2937",
    fontFamily: "Poppins-Regular",
    backgroundColor: "#F9FAFB",
  },
  saveBtn: {
    backgroundColor: PURPLE,
    borderRadius: 10,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 40,
  },
  saveBtnText: {
    color: "#FFF",
    fontFamily: "Poppins-Bold",
    fontSize: 16,
  },
  toast: {
    position: "absolute",
    top: height * 0.05,
    left: width * 0.05,
    right: width * 0.05,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 999,
    borderLeftWidth: 4,
  },
  toastSuccess: { borderLeftColor: "#16A34A" },
  toastError: { borderLeftColor: "#E63636" },
  toastText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#1F2937",
    flex: 1,
  },
});

export default EditProfile;
