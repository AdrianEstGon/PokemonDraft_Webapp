import { api } from "./Api";

const API_URL = "/counters";

export const getCounters = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

export const getCounterById = async (id: any) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

export const createCounter = async (counter: any) => {
  const response = await api.post(API_URL, counter);
  return response.data;
};

export const updateCounter = async (id: any, counter: any) => {
  const response = await api.put(`${API_URL}/${id}`, counter);
  return response.data;
};

export const deleteCounter = async (id: any) => {
  await api.delete(`${API_URL}/${id}`);
};
