import axios from "axios";

import { API_BASE_URL } from "../utils/config";

const API_URL = `${API_BASE_URL}/counters`;

export const getCounters = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getCounterById = async (id: any) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createCounter = async (counter: any) => {
  const response = await axios.post(API_URL, counter);
  return response.data;
};

export const updateCounter = async (id: any, counter: any) => {
  const response = await axios.put(`${API_URL}/${id}`, counter);
  return response.data;
};

export const deleteCounter = async (id: any) => {
  await axios.delete(`${API_URL}/${id}`);
};
