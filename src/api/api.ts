import axios from "axios";

const API_BASE_URL = "http://localhost:5001/";

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to get data from an endpoint
export const fetchData = async (endpoint: string) => {
  try {
    const response = await instance.get(endpoint);
    return response.data;
  } catch (error) {
    // Handle error
    console.error("There was an error!", error);
    throw error;
  }
};