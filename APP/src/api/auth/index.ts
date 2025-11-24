import { api } from "../tools";
import { LoginUserRequest } from "../../assets/ts/interfaces";
import { AxiosError } from "axios";

export const login = async (user: LoginUserRequest) => {
  try {
    const response = await api.post("auth/signin", {
      email: user.email,
      password: user.password,
    });
    return response.data;
  } catch (error: unknown) {
    const err = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      status: err.response?.status,
      message: err.response?.data?.message || "Erreur de connexion.",
    };
  }
}

export const logout = async () => {
  try {
    const response = await api.get("auth/logout");
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Logout failed: ${error.message}`);
    } else {
      throw new Error("Logout failed: Unknown error");
    }
  }
}