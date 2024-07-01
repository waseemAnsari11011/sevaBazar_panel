import axiosInstance from "../../utils/axiosConfig";


const getCategoryById = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get(`/category/${id}`, {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      }
  });
    return response.data;
  } catch (error) {
    console.error('Failed to retrieve category:', error);
    throw error;
  }
};

export default getCategoryById;
