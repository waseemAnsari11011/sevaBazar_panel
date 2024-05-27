import axiosInstance from "../../utils/axiosConfig";


const updateCategory = async (id, data) => {
  try {
    const formData = new FormData();
    
    // Append the category name
    if (data.name) {
      formData.append('name', data.name);
    }

    // Append the images
    if (data.images && data.images.length > 0) {
      data.images.forEach((image, index) => {
        if (typeof image === 'string') {
          // If the image is a string (URL), just append it as a string
          formData.append(`existingImages[${index}]`, image);
        } else {
          // If the image is a File object, append it to the form data
          formData.append('images', image);
        }
      });
    }

    const response = await axiosInstance.put(`/category/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to update category:', error);
    throw error;
  }
};

export default updateCategory;
