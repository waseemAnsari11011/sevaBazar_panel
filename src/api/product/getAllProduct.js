import axiosInstance from "../../utils/axiosConfig";

// Fetch all products
const getAllProducts = async () => {
    try {
        const response = await axiosInstance.get('/products');
        return response.data.products;
    } catch (error) {
        console.error('Failed to fetch products:', error);
        throw error;
    }
};

export default getAllProducts
