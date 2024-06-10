import axiosInstance from "../../utils/axiosConfig";

const deleteFAQ = async (id) => {
  try {
    // Retrieve token from local storage
    const token = localStorage.getItem('token');

    // Check if token exists
    if (!token) {
      throw new Error('No token found in local storage');
    }

    // Send DELETE request with token in headers
    await axiosInstance.delete(`/faqs/${id}`, {
      headers: {
        Authorization: `Bearer ${token}` // Include the token in the Authorization header
      }
    });
  } catch (error) {
    console.error('Failed to delete FAQ:', error.response?.data?.error || error.message);
    throw error.response?.data?.error || error.message;
  }
};

export default deleteFAQ;
