import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || "http://localhost:3000/api/v1",
});

// Function to initialize headers
const setAuthToken = (token) => {
  if (token) {
    // Apply for every request
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    // Delete auth header
    delete API.defaults.headers.common["Authorization"];
  }
};

// Initialize with token if already logged in
const token = localStorage.getItem("token");
setAuthToken(token);

export default API;
