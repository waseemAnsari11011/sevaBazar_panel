// axiosConfig.js

import axios from 'axios';

const baseURL = 'http://server.sevabazar.com';

const axiosInstance = axios.create({
  baseURL: baseURL, // Base URL of your API
});

export default axiosInstance;
export { baseURL };
