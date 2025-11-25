import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tripsAPI = {
  getAll: () => apiClient.get('/trips'),
  getById: (id) => apiClient.get(`/trips/${id}`),
  create: (tripData) => apiClient.post('/trips', tripData),
  delete: (id) => apiClient.delete(`/trips/${id}`),
};

export const weatherAPI = {
  getByCity: (city) => apiClient.get(`/weather/${city}`),
};

export const placesAPI = {
  getByCity: (city) => apiClient.get(`/places/${city}`),
};

export const currencyAPI = {
  getRate: (from, to) => apiClient.get(`/currency/${from}/${to}`),
  convert: (amount, from, to) =>
    apiClient.get(`/currency/convert?amount=${amount}&from=${from}&to=${to}`),
};

export const itineraryAPI = {
  addDay: (dayData) => apiClient.post('/itinerary', dayData),
  updateDay: (id, dayData) => apiClient.put(`/itinerary/${id}`, dayData),
  deleteDay: (id) => apiClient.delete(`/itinerary/${id}`),
};

export const attractionsAPI = {
  add: (attractionData) => apiClient.post('/attractions', attractionData),
  toggleVisited: (id, visited) =>
    apiClient.patch(`/attractions/${id}/visited`, { visited }),
};

export const expensesAPI = {
  create: (expenseData) => apiClient.post('/expenses', expenseData),
  getByTrip: (tripId) => apiClient.get(`/expenses/${tripId}`),
  getByDay: (tripId, dayNumber) => apiClient.get(`/expenses/${tripId}/day/${dayNumber}`),
  getTotal: (tripId) => apiClient.get(`/expenses/${tripId}/total`),
  delete: (id) => apiClient.delete(`/expenses/${id}`),
};

export default apiClient;
