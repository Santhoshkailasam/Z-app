// services/authService.ts
import axios from "axios";
import { BASE_URL } from "@/constants/constants";

export const login = async (phone_number: string, password: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login/`, {
      phone_number,
      password,
    });

    return response.data; // { access, refresh }
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
