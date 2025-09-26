import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CImage,
  CSpinner,
  CAlert,
  CBadge,
  CButton,
} from '@coreui/react'
import { getVendorById } from '../../../api/vendor/getVendorById'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft } from '@coreui/icons'

const VendorDetails = () => {
  const { vendorId } = useParams()
  const navigate = useNavigate()
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        setLoading(true)
        const response = await getVendorById(vendorId)
        if (response && response.vendor) {
          setVendor(response.vendor)
        } else {
          setError('Vendor not found.')
        }
      } catch (err) {
        setError('Failed to fetch vendor details.')
        console.error('Error fetching vendor details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchVendorDetails()
  }, [vendorId])

  if (loading) {
    return (
      <CRow className="justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <CSpinner color="primary" />
      </CRow>
    )
  }

  if (error) {
    return <CAlert color="danger">{error}</CAlert>
  }

  if (!vendor) {
    return <CAlert color="warning">No vendor data available.</CAlert>
  }

  const renderDocumentImage = (url, altText) => {
    if (!url) return <p className="text-muted">Not Provided</p>
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <CImage thumbnail src={url} alt={altText} width={150} height={150} className="mb-2 me-2" />
      </a>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const fullAddress = [
    vendor.location?.address?.addressLine1,
    vendor.location?.address?.addressLine2,
    vendor.location?.address?.landmark,
    vendor.location?.address?.city,
    vendor.location?.address?.state,
    vendor.location?.address?.postalCode,
    vendor.location?.address?.country,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Vendor Registration Details</strong>
            <CButton color="secondary" onClick={() => navigate('/vendor/list')}>
              <CIcon icon={cilArrowLeft} className="me-2" />
              Back to Vendor List
            </CButton>
          </CCardHeader>
          <CCardBody>
            {/* Personal and Business Information */}
            <CRow className="mb-4">
              <CCol md={6}>
                <h5>Personal Information</h5>
                <p>
                  <strong>Name:</strong> {vendor.name || 'N/A'}
                </p>
                <p>
                  <strong>Email:</strong> {vendor.email || 'N/A'}
                </p>
                <p>
                  <strong>Role:</strong> <CBadge color="info">{vendor.role || 'N/A'}</CBadge>
                </p>
              </CCol>
              <CCol md={6}>
                <h5>Business Information</h5>
                <p>
                  <strong>Business Name:</strong> {vendor.vendorInfo?.businessName || 'N/A'}
                </p>
                <p>
                  <strong>Contact Number:</strong> {vendor.vendorInfo?.contactNumber || 'N/A'}
                </p>
                <p>
                  <strong>Alternative Contact:</strong>{' '}
                  {vendor.vendorInfo?.alternativeContactNumber || 'N/A'}
                </p>
                <p>
                  <strong>Category:</strong> {vendor.category?.name || 'N/A'}
                </p>
              </CCol>
            </CRow>
            <hr />
            {/* Location Information */}
            <CRow className="mb-4">
              <CCol>
                <h5>Location</h5>
                <p>
                  <strong>Full Address:</strong> {fullAddress || 'N/A'}
                </p>
                <p>
                  <strong>Serviceable Pincodes:</strong>{' '}
                  {vendor.location?.address?.postalCodes?.join(', ') || 'N/A'}
                </p>
                <p>
                  <strong>Coordinates:</strong> {vendor.location?.coordinates?.join(', ') || 'N/A'}
                </p>
              </CCol>
            </CRow>
            <hr />
            {/* Account Status */}
            <CRow className="mb-4">
              <CCol>
                <h5>Account Status</h5>
                <p>
                  <strong>Online Status:</strong>{' '}
                  {vendor.isOnline ? (
                    <CBadge color="success">Online</CBadge>
                  ) : (
                    <CBadge color="danger">Offline</CBadge>
                  )}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <CBadge color={vendor.status === 'online' ? 'success' : 'secondary'}>
                    {vendor.status}
                  </CBadge>
                </p>
                <p>
                  <strong>Restricted:</strong>{' '}
                  {vendor.isRestricted ? (
                    <CBadge color="danger">Yes</CBadge>
                  ) : (
                    <CBadge color="success">No</CBadge>
                  )}
                </p>
              </CCol>
            </CRow>
            <hr />
            {/* Uploaded Documents */}
            <CRow className="mb-4">
              <CCol>
                <h5>Uploaded Documents</h5>
                <div className="mb-3">
                  <h6>Shop Photos</h6>
                  <div>
                    {vendor.documents?.shopPhoto && vendor.documents.shopPhoto.length > 0 ? (
                      vendor.documents.shopPhoto.map((photo, index) =>
                        renderDocumentImage(photo, `Shop Photo ${index + 1}`),
                      )
                    ) : (
                      <p className="text-muted">No Shop Photos Provided</p>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <h6>Selfie Photo</h6>
                  {renderDocumentImage(vendor.documents?.selfiePhoto, 'Selfie Photo')}
                </div>
                <div className="mb-3">
                  <h6>Aadhar Card (Front)</h6>
                  {renderDocumentImage(vendor.documents?.aadharFrontDocument, 'Aadhar Front')}
                </div>
                <div className="mb-3">
                  <h6>Aadhar Card (Back)</h6>
                  {renderDocumentImage(vendor.documents?.aadharBackDocument, 'Aadhar Back')}
                </div>
                <div className="mb-3">
                  <h6>PAN Card</h6>
                  {renderDocumentImage(vendor.documents?.panCardDocument, 'PAN Card')}
                </div>
              </CCol>
            </CRow>
            <hr />
            {/* Timestamps */}
            <CRow>
              <CCol>
                <h5>Timestamps</h5>
                <p>
                  <strong>Created At:</strong> {formatDate(vendor.createdAt)}
                </p>
                <p>
                  <strong>Last Updated At:</strong> {formatDate(vendor.updatedAt)}
                </p>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default VendorDetails
