import axiosInstance from "../../utils/axiosConfig";

// Function to update an existing product
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
  if (productData.availableLocalities) {
    productData.availableLocalities.forEach(location => {
      formData.append('availableLocalities', location);
    });
  }

  // Append product images
  if (productData.images) {
    productData.images.forEach((image, index) => {
      if (typeof image === 'string') {
        formData.append(`existingImages[${index}]`, image);
      } else {
        formData.append(`productImage_${index}`, image);
      }
    });
  }

  const variations = productData.variations;
  const newVariations = [];

  // Append variation data and images
  if (variations) {
    variations?.forEach((variation, variationIndex) => {
      const { images, ...variationWithoutImages } = variation;
      newVariations.push(variationWithoutImages);

      images?.forEach((image, imageIndex) => {
        if (typeof image === 'string') {
          formData.append(`existingVariationImages[${variationIndex}][${imageIndex}]`, image);
        } else {
          formData.append(`variationImage_${variationIndex}_${imageIndex}`, image);
        }
      });
    });
  }

  // Append the JSON string of the new variations array to FormData
  formData.append('variations', JSON.stringify(newVariations));

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
