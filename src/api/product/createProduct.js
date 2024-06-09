import axiosInstance from "../../utils/axiosConfig";

// Create a new product
 const createProduct = async (productData) => {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('quantity', productData.quantity);
    formData.append('price', productData.price);
    formData.append('discount', productData.discount);
    formData.append('description', productData.description);
    formData.append('category', productData.category);
    formData.append('vendor', productData.vendor);
    

    productData.availableLocalities.forEach(location => {
        formData.append('availableLocalities', location);
    });

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
