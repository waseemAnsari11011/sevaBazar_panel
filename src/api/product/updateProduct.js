import axiosInstance from "../../utils/axiosConfig";


const updateProduct = async (id, productData) => {
  console.log("updateProduct--->>>", productData)
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

  // Append the images
  if (productData.images && productData.images.length > 0) {
    productData.images.forEach((image, index) => {
      if (typeof image === 'string') {
        // If the image is a string (URL), just append it as a string
        formData.append(`existingImages[${index}]`, image);
      } else {
        // If the image is a File object, append it to the form data
        formData.append('images', image);
      }
    });
  }

  // productData.images.forEach(image => {
  //     formData.append('images', image);
  // });

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
