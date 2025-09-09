import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
  CSpinner,
  CFormText,
  CFormSelect, // Import the FormSelect component
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
// Import a new icon for the category dropdown
import {
  cilLockLocked,
  cilUser,
  cilBuilding,
  cilLocationPin,
  cilPhone,
  cilList,
} from '@coreui/icons'
import axiosInstance from '../../../utils/axiosConfig'
import { useNavigate } from 'react-router-dom'

const Register = () => {
  const navigate = useNavigate()

  // Form fields state
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [businessPincode, setBusinessPincode] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [alternativeContactNumber, setAlternativeContactNumber] = useState('')

  // Location state
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [locationStatus, setLocationStatus] = useState('')

  // 👇 New state for categories
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')

  // UI state
  const [alertMessage, setAlertMessage] = useState('')
  const [alertVisible, setAlertVisible] = useState(false)
  const [alertColor, setAlertColor] = useState('primary')
  const [isLoading, setIsLoading] = useState(false)

  // 👇 New useEffect to fetch categories when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/category')
        if (response.data && response.data.categories) {
          setCategories(response.data.categories)
        }
      } catch (error) {
        console.error('Failed to fetch categories', error)
        setAlertMessage('Could not load business categories. Please try again later.')
        setAlertColor('danger')
        setAlertVisible(true)
      }
    }

    fetchCategories()
  }, []) // Empty dependency array ensures this runs only once

  useEffect(() => {
    let timeout
    if (alertVisible) {
      timeout = setTimeout(() => {
        setAlertVisible(false)
      }, 3000)
    }
    return () => clearTimeout(timeout)
  }, [alertVisible])

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setLocationStatus('Fetching location...')
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude)
          setLongitude(position.coords.longitude)
          setLocationStatus(
            `✅ Location captured: Lat: ${position.coords.latitude.toFixed(
              4,
            )}, Lng: ${position.coords.longitude.toFixed(4)}`,
          )
        },
        (error) => {
          console.error('Geolocation error:', error)
          setLocationStatus(`❌ Error: ${error.message}. Please enter address manually.`)
        },
      )
    } else {
      setLocationStatus('Geolocation is not supported by this browser.')
    }
  }

  const handleSignUp = async () => {
    // Basic validation
    if (!selectedCategory) {
      setAlertMessage('Please select a business category.')
      setAlertColor('warning')
      setAlertVisible(true)
      return
    }
    setIsLoading(true)

    try {
      // 👇 MODIFIED: Payload now includes the selected category ID
      const payload = {
        name,
        password,
        email,
        vendorInfo: {
          contactNumber,
          alternativeContactNumber,
          businessName,
        },
        location: {
          address: {
            addressLine1: businessAddress,
            postalCode: businessPincode,
          },
          coordinates: latitude && longitude ? [longitude, latitude] : [],
        },
        category: selectedCategory, // Add the selected category ID here
      }

      const response = await axiosInstance.post('/vendors/signup', payload)

      if (response.status === 201) {
        setAlertMessage('Registration successful!')
        setAlertColor('success')
        setAlertVisible(true)
        setTimeout(() => {
          navigate('/')
        }, 1500)
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'No response from server.'
      setAlertMessage(`Registration failed: ${errorMessage}`)
      setAlertColor('danger')
      setAlertVisible(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          {alertVisible && (
            <CAlert color={alertColor} onClose={() => setAlertVisible(false)} dismissible>
              {alertMessage}
            </CAlert>
          )}
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm>
                  <h1>Register</h1>
                  <p className="text-body-secondary">Create your vendor account</p>

                  {/* Personal and Business Info */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput placeholder="Name" onChange={(e) => setName(e.target.value)} />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilPhone} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Contact Number"
                      onChange={(e) => setContactNumber(e.target.value)}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilPhone} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Alternative Contact Number"
                      onChange={(e) => setAlternativeContactNumber(e.target.value)}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilBuilding} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Business Name"
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </CInputGroup>

                  {/* 👇 New Category Selection Dropdown */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilList} />
                    </CInputGroupText>
                    <CFormSelect
                      aria-label="Select business category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option>Select your business category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CInputGroup>

                  {/* Address and Location Section */}
                  <hr />
                  <p className="text-body-secondary">Business Location</p>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLocationPin} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Business Address (Line 1)"
                      onChange={(e) => setBusinessAddress(e.target.value)}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLocationPin} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Business Pincode"
                      onChange={(e) => setBusinessPincode(e.target.value)}
                    />
                  </CInputGroup>

                  <div className="mb-3 text-center">
                    <CButton color="secondary" variant="outline" onClick={handleGetLocation}>
                      📍 Get Current Geo-Location
                    </CButton>
                    {locationStatus && <CFormText className="mt-2">{locationStatus}</CFormText>}
                  </div>
                  <hr />

                  {/* Password Section */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput type="password" placeholder="Repeat password" />
                  </CInputGroup>

                  <div className="d-grid">
                    <CButton color="primary" onClick={handleSignUp} disabled={isLoading}>
                      {isLoading ? <CSpinner size="sm" /> : 'Create Account'}
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register
