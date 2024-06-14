import axiosInstance from "../../utils/axiosConfig";

// Fetch all products
const getAllProducts = async (vendorId) => {
    console.log("getAllProducts vendorId-->>", vendorId)
    try {
        const response = await axiosInstance.get(`/products/${vendorId}`);
        return response.data.products;
    } catch (error) {
        console.error('Failed to fetch products:', error);
        throw error;
    }
};

export default getAllProducts
