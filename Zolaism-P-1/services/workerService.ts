import axiosClient from "../api/axiosClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Fetch Worker Profile
 */
export const getWorkerProfile = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("No token found. Please login again.");

    const response = await axiosClient.get("/worker/profile/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching worker profile:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.detail || "Failed to load profile.");
  }
};

/**
 * Update Worker Profile (optional for later)
 */
export const updateWorkerProfile = async (data: any) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("No token found. Please login again.");

    const response = await axiosClient.put("/worker/profile/", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating worker profile:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.detail || "Failed to update profile.");
  }
};
