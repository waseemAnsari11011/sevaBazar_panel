import axiosInstance from "../../utils/axiosConfig";


const deleteProduct = async (id) => {
  try {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete product:', error);
    throw error;
  }
};

export default deleteProduct;
