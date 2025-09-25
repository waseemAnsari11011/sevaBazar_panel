import axiosInstance from '../../utils/axiosConfig'

export const getVendorById = async (vendorId) => {
  const response = await axiosInstance.get(`/vendors/${vendorId}`)
  return response.data
}
