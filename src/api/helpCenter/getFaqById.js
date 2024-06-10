import axiosInstance from "../../utils/axiosConfig";

const getFaqById = async (id) => {
  try {
    // Retrieve token from local storage
    const token = localStorage.getItem('token');

    // Check if token exists
    if (!token) {
      throw new Error('No token found in local storage');
    }

    // Send GET request with token in headers
    const response = await axiosInstance.get(`/faqs/${id}`, {
      headers: {
        Authorization: `Bearer ${token}` // Include the token in the Authorization header
      }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to retrieve FAQ:', error.response?.data?.error || error.message);
    throw error.response?.data?.error || error.message;
  }
};

export default getFaqById;
