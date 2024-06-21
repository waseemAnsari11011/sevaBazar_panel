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

    productData.images.forEach((image, index) => {
        formData.append(`productImage_${index}`, image);
    });
    const variations = productData.variations;
    const newVariations = [];

    variations.forEach((variation, index) => {
        // Extract the image file from the variation object
        const imageFile = variation.image;

        // Remove the image file from the variation object
        const { image, ...variationWithoutImage } = variation;

        // Create a new variation object without the image
        const newVariation = {
            ...variationWithoutImage,
            image: null  // Or you can omit the image field altogether
        };

        // Add the new variation to the newVariations array
        newVariations.push(newVariation);

        // Append the image file separately to FormData with a unique key
        formData.append(`variationImage_${index}`, imageFile);
    });

    // Append the JSON string of the new variations array to FormData
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
