// services/authService.ts
import axiosClient from "../api/axiosClient";

export const login = async (phone_number: string, password: string) => {
  try {
    const response = await axiosClient.post("/auth/login/", {
      phone_number,
      password,
    });

    // ✅ If your backend uses JWT, return both tokens
    return response.data; // e.g. { access: "...", refresh: "...", user: {...} }
  } catch (error: any) {
    if (error.response) {
      const message =
        error.response.data.detail ||
        error.response.data.message ||
        "Invalid credentials";
      throw new Error(message);
    } else {
      throw new Error("Network error. Please check your connection.");
    }
  }
};
