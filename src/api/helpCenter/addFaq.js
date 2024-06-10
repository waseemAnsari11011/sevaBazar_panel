import axiosInstance from "../../utils/axiosConfig";

const addFaq = async (question, answer) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/faqs', { question, answer }, {
      headers: {
        Authorization: `Bearer ${token}` // Include the token in the Authorization header
      }
    });
    return response.data; // Return the added FAQ data
  } catch (error) {
    console.error('Error adding FAQ:', error);
    throw error; // Throw the error to be handled by the caller
  }
};

export default addFaq;
