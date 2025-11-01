import React, { useState } from 'react'
import { CButton, CForm, CFormInput, CFormLabel, CCol, CRow, CSpinner, CAlert } from '@coreui/react'
import { updateProfile } from '../../api/vendor/updateProfile' // Import your new API call
import { useDispatch } from 'react-redux'

const UpdateBusinessInfo = ({ user }) => {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    name: user.name || '',
    businessName: user.vendorInfo?.businessName || '',
    alternativeContactNumber: user.vendorInfo?.alternativeContactNumber || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const payload = {
      name: formData.name,
      vendorInfo: {
        businessName: formData.businessName,
        alternativeContactNumber: formData.alternativeContactNumber,
      },
    }

    try {
      const response = await updateProfile(payload)

      // Update the user in Redux state (you might need to adjust this)
      dispatch({ type: 'SET_USER', payload: response.vendor })

      setSuccess('Business info updated successfully!')
    } catch (err) {
      setError(err.message || 'Failed to update business info.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CForm onSubmit={handleSubmit}>
      {error && <CAlert color="danger">{error}</CAlert>}
      {success && <CAlert color="success">{success}</CAlert>}

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="name">Full Name</CFormLabel>
          <CFormInput type="text" id="name" value={formData.name} onChange={handleChange} />
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="businessName">Business Name</CFormLabel>
          <CFormInput
            type="text"
            id="businessName"
            value={formData.businessName}
            onChange={handleChange}
          />
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="alternativeContactNumber">Alternative Contact Number</CFormLabel>
          <CFormInput
            type="text"
            id="alternativeContactNumber"
            value={formData.alternativeContactNumber}
            onChange={handleChange}
          />
        </CCol>
      </CRow>

      <CButton type="submit" color="primary" disabled={loading}>
        {loading ? <CSpinner size="sm" /> : 'Save Changes'}
      </CButton>
    </CForm>
  )
}

export default UpdateBusinessInfo
