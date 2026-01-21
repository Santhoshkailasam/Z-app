import axiosClient from "../api/axiosClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getLoanSummary = async (loanNo: string) => {
  try {
    const token = await AsyncStorage.getItem("access");
    const response = await axiosClient.get(`/loan/loans${loanNo}/summary/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Loan summary fetch failed:", error.response?.data || error.message);
    throw error;
  }
};
