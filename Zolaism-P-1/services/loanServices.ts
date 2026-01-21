import axiosClient from "../api/axiosClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Define type explicitly
export const getFilteredLoans = async (searchQuery: string) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("No auth token found");

    const response = await axiosClient.get("/loan/loans/filter/", {
      params: { q: searchQuery },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Search failed:", error.response?.data || error.message);
    throw error;
  }
};


