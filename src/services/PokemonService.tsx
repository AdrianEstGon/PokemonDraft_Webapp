import axios from "axios";
import { API_BASE_URL } from "../utils/config";

const API_URL = `${API_BASE_URL}/pokemons`;

export const getPokemons = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getPokemonById = async (id: any) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createPokemon = async (pokemon: any) => {
  const response = await axios.post(API_URL, pokemon);
  return response.data;
};

export const updatePokemon = async (id: any, pokemon: any) => {
  const response = await axios.put(`${API_URL}/${id}`, pokemon);
  return response.data;
};

export const deletePokemon = async (id: any) => {
  await axios.delete(`${API_URL}/${id}`);
};
