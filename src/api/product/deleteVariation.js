import axiosInstance from '../../utils/axiosConfig';

const deleteVariation = async (productId, variationId) => {
  const response = await axiosInstance.delete(`/products/${productId}/variations/${variationId}`);
  return response.data;
};

export default deleteVariation;
