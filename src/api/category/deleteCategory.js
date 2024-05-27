// deleteCategory.js
import axiosInstance from "../../utils/axiosConfig";

const deleteCategory = async (id) => {
  try {
    const response = await axiosInstance.delete(`/category/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete category:', error);
    throw error;
  }
};

export default deleteCategory;
