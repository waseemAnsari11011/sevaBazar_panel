import axiosInstance from '../../utils/axiosConfig'

export const updateVendorAddress = async (vendorId, addressData) => {
  const response = await axiosInstance.put(`/vendors/address/${vendorId}`, addressData)
  return response.data
}
