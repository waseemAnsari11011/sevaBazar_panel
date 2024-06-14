import axiosInstance from "../../utils/axiosConfig";

const updateProduct = async (id, productData) => {
  const formData = new FormData();

  // Append basic product details
  formData.append('name', productData.name || '');
  formData.append('price', (productData.price !== undefined ? productData.price.toString() : ''));
  formData.append('discount', (productData.discount !== undefined ? productData.discount.toString() : ''));
  formData.append('description', productData.description || '');
  formData.append('category', productData.category || '');
  formData.append('vendor', productData.vendor || '');

  // Append available localities
  productData.availableLocalities.forEach(location => {
    formData.append('availableLocalities', location);
  });

  // Serialize variations array to JSON and append as a single field
  formData.append('variations', JSON.stringify(productData.variations));

  // Append existing images
  if (productData.images && productData.images.length > 0) {
    productData.images.forEach((image, index) => {
      if (typeof image === 'string') {
        formData.append(`existingImages[${index}]`, image);
      } else {
        formData.append('images', image);
      }
    });
  }

  try {
    const response = await axiosInstance.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update product:', error);
    throw error;
  }
};

export default updateProduct;
