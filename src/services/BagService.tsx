import { api } from "./Api";

const API_URL = `/UserPokemons`;

// 🔹 Obtener la mochila de un usuario
export const getUserPokemons = async (userId: number) => {
  const response = await api.get(`${API_URL}/${userId}`);
  return response.data;
};

// 🔹 Agregar un pokemon a la mochila
export const addPokemonToUser = async (
  userId: number,
  pokemonId: number,
) => {
  const response = await api.post(`${API_URL}/${userId}/add`, {
    pokemonId,
  });
  return response.data;
};

// 🔹 Eliminar un pokemon de la mochila
export const removePokemonFromUser = async (
  userId: number,
  pokemonId: number
) => {
  const response = await api.delete(`${API_URL}/${userId}/remove/${pokemonId}`);
  return response.data;
};
