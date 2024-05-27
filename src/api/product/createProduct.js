import axiosInstance from "../../utils/axiosConfig";

// Create a new product
 const createProduct = async (productData) => {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('price', productData.price);
    formData.append('discount', productData.discount);
    formData.append('description', productData.description);
    formData.append('category', productData.category);

    productData.images.forEach(image => {
        formData.append('images', image);
    });

    try {
        const response = await axiosInstance.post('/products', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to create product:', error);
        throw error;
    }
};

export default createProduct
