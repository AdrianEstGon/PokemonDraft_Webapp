import { api } from "./Api";

const API_URL = "/users";

// 🔹 Obtener todos los usuarios
export const getUsers = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

// 🔹 Obtener usuario por ID
export const getUserById = async (id: number) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

// 🔹 Crear usuario (opcional, si tu backend tiene endpoint de creación)
export const createUser = async (user: { username: string; password: string; role: string }) => {
  const response = await api.post(API_URL, user);
  return response.data;
};

// 🔹 Actualizar usuario
export const updateUser = async (id: number, user: { username?: string; role?: string }) => {
  const response = await api.put(`${API_URL}/${id}`, user);
  return response.data;
};

// 🔹 Eliminar usuario
export const deleteUser = async (id: number) => {
  await api.delete(`${API_URL}/${id}`);
};
