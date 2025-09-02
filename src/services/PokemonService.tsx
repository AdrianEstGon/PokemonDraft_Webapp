import { api } from "./Api";

const API_URL = `/pokemons`;

export const getPokemons = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

export const getPokemonById = async (id: any) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

export const createPokemon = async (pokemon: any) => {
  const response = await api.post(API_URL, pokemon);
  return response.data;
};

export const updatePokemon = async (id: any, pokemon: any) => {
  const response = await api.put(`${API_URL}/${id}`, pokemon);
  return response.data;
};

export const deletePokemon = async (id: any) => {
  await api.delete(`${API_URL}/${id}`);
};
