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
    variations.forEach((variation, index) => {
      // Extract the image file from the variation object
      const imageFile = variation.image;

      // Remove the image file from the variation object
      const { image, ...variationWithoutImage } = variation;

      // Create a new variation object without the image
      const newVariation = {
        ...variationWithoutImage,
        image: null // Or you can omit the image field altogether
      };

      // Add the new variation to the newVariations array
      newVariations.push(newVariation);

      if (imageFile) {
        if (typeof imageFile === 'string') {
          formData.append(`existingVariationImages[${index}]`, imageFile);
        } else {
          formData.append(`variationImage_${index}`, imageFile);
        }
      }

      // Append the image file separately to FormData with a unique key
      // if (imageFile) {
      //   formData.append(`variationImage_${index}`, imageFile);
      // }
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
