import axiosInstance from "../../utils/axiosConfig";

const updateOrderStatus = async (orderId, vendorId, newStatus) => {

  console.log(orderId, vendorId, newStatus)
  try {
    const response = await axiosInstance.put(`/order/status/${orderId}/vendor/${vendorId}`, { newStatus });
    return response.data;
  } catch (error) {
    console.error('Failed to update order status:', error);
    throw error;
  }
};

const updateOrderPaymentStatus = async (orderId, newStatus) => {

  try {
    const response = await axiosInstance.post(`manually-verify-payment`, { orderId, newStatus });
    return response.data;
  } catch (error) {
    console.error('Failed to update order status:', error);
    throw error;
  }
};

export { updateOrderStatus, updateOrderPaymentStatus };
