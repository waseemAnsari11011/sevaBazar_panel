// axiosConfig.js

import axios from 'axios';

const baseURL = 'http://localhost:8000';

const axiosInstance = axios.create({
  baseURL: baseURL, // Base URL of your API
});

export default axiosInstance;
export { baseURL };
