import { api } from "./Api";

const API_URL = `/auth`;

export const login = async (username: string, password: string) => {
  const response = await api.post(`${API_URL}/login`, { username, password });
  return response.data;
};

export const register = async (username: string, password: string) => {
  const response = await api.post(`${API_URL}/register`, { username, password });
  return response.data;
};
