// services/loanSummary.ts
import axiosClient from "../api/axiosClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getLoanSummary = async (loanNo: string) => {
  try {
    console.log("📥 Raw loanNo:", loanNo);

    if (!loanNo) {
      throw new Error("Loan number is required");
    }

    // 🔒 Trim spaces only (allow letters + numbers)
    const sanitizedLoanNo = loanNo.trim();
    console.log("✅ Sanitized loanNo:", sanitizedLoanNo);

    if (!sanitizedLoanNo) {
      throw new Error("Loan number is required");
    }

    // 🔐 Get token
    const token = await AsyncStorage.getItem("access");
    console.log("🔐 Token exists:", !!token);

    if (!token) {
      throw new Error("Authentication token missing");
    }

    // 🌐 Final URL (ENCODE IMPORTANT)
    const url = `/loan/loans/${encodeURIComponent(
      sanitizedLoanNo
    )}/summary/`;
    console.log("🌐 Request URL:", url);

    const response = await axiosClient.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("📦 Loan summary response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Loan summary fetch failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};
