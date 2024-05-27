import axiosInstance from "../../utils/axiosConfig";


const getCategoryById = async (id) => {
  try {
    const response = await axiosInstance.get(`/category/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to retrieve category:', error);
    throw error;
  }
};

export default getCategoryById;
