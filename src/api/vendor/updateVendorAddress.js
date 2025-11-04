import axiosInstance from 'src/utils/axiosConfig'
import { toast } from 'react-toastify'
import { SET_USER } from 'src/redux/actions/types' // 1. Import SET_USER

export const updateVendorAddress = (vendorId, data) => async (dispatch) => {
  try {
    // The backend returns the updated vendor object in the response
    const res = await axiosInstance.put(`/vendors/me/profile`, data)

    if (res.data && res.data.vendor) {
      // 2. Dispatch the SET_USER action with the updated vendor data
      dispatch({
        type: SET_USER,
        user: res.data.vendor,
      })
      toast.success('Address updated successfully!')
    }

    return res
  } catch (err) {
    const errorMessage = err.response ? err.response.data.message : 'Error updating address'
    toast.error(errorMessage)
    console.error(err)
  }
}
