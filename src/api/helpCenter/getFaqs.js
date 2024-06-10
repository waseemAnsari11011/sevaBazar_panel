import axiosInstance from "../../utils/axiosConfig";

const getFAQs = async () => {
  try {
    // Retrieve token from local storage
    const token = localStorage.getItem('token');

    // Check if token exists
    if (!token) {
      throw new Error('No token found in local storage');
    }

    // Send GET request with token in headers
    const response = await axiosInstance.get('/faqs', {
      headers: {
        Authorization: `Bearer ${token}` // Include the token in the Authorization header
      }
    });

    return response.data; // Return the fetched FAQs data
  } catch (error) {
    console.error('Error fetching FAQs:', error.response?.data?.error || error.message);
    throw error.response?.data?.error || error.message; // Throw the error to be handled by the caller
  }
};

export default getFAQs;
