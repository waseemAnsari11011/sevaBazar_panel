import axiosInstance from "../../utils/axiosConfig";

// Create a new product
const createProduct = async (productData) => {
    const formData = new FormData();
    console.log("productData-->>", productData)
    formData.append('name', productData.name);
    formData.append('quantity', productData.quantity);
    formData.append('price', productData.price);
    formData.append('discount', productData.discount);
    formData.append('description', productData.description);
    formData.append('category', productData.category);
    formData.append('vendor', productData.vendor);
    formData.append('isReturnAllowed', productData.isReturnAllowed);

    productData.availableLocalities?.forEach(location => {
        formData.append('availableLocalities', location);
    });

    productData.tags?.forEach(tag => {
        formData.append('tags', tag);
    });

    productData.images?.forEach((image, index) => {
        formData.append(`productImage_${index}`, image);
    });

    const variations = productData.variations;
    const newVariations = [];

    variations?.forEach((variation, variationIndex) => {
        const { images, ...variationWithoutImages } = variation;
        newVariations.push(variationWithoutImages);

        images?.forEach((image, imageIndex) => {
            formData.append(`variationImage_${variationIndex}_${imageIndex}`, image);
        });
    });

    formData.append('variations', JSON.stringify(newVariations));

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

export default createProduct;

