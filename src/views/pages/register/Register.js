import React, { useState, useEffect, useRef } from 'react'
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
  CFormSelect,
  CFormLabel,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilLockLocked,
  cilUser,
  cilBuilding,
  cilLocationPin,
  cilPhone,
  cilList,
  cilCamera,
  cilCloudUpload,
  cilTrash,
  cilCheckCircle,
} from '@coreui/icons'
import axiosInstance from '../../../utils/axiosConfig'
import { useNavigate } from 'react-router-dom'

const Register = () => {
  const navigate = useNavigate()
  const addressInputRef = useRef(null)
  const autocompleteRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const shopPhotoInputRef = useRef(null)
  const aadharInputRef = useRef(null)

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
  const [placeDetails, setPlaceDetails] = useState(null)

  // Categories state
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')

  // Image upload states
  const [shopPhoto, setShopPhoto] = useState(null)
  const [shopPhotoPreview, setShopPhotoPreview] = useState(null)
  const [selfiePhoto, setSelfiePhoto] = useState(null)
  const [selfiePhotoPreview, setSelfiePhotoPreview] = useState(null)
  const [aadharDocument, setAadharDocument] = useState(null)
  const [aadharDocumentPreview, setAadharDocumentPreview] = useState(null)

  // Camera modal states
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [isCameraReady, setIsCameraReady] = useState(false)

  // UI state
  const [alertMessage, setAlertMessage] = useState('')
  const [alertVisible, setAlertVisible] = useState(false)
  const [alertColor, setAlertColor] = useState('primary')
  const [isLoading, setIsLoading] = useState(false)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)

  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setGoogleMapsLoaded(true)
      return
    }

    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true

    script.onload = () => {
      setGoogleMapsLoaded(true)
    }

    script.onerror = () => {
      console.error('Failed to load Google Maps API')
      setAlertMessage('Failed to load Google Maps. Address autocomplete will not be available.')
      setAlertColor('warning')
      setAlertVisible(true)
    }

    document.head.appendChild(script)

    return () => {
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`)
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [])

  useEffect(() => {
    if (googleMapsLoaded && addressInputRef.current && !autocompleteRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'in' },
        fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()

        if (!place.geometry) {
          setAlertMessage('Please select a valid address from the dropdown.')
          setAlertColor('warning')
          setAlertVisible(true)
          return
        }

        const addressComponents = place.address_components || []
        let postalCode = ''
        let formattedAddress = place.formatted_address || ''

        const postalCodeComponent = addressComponents.find((component) =>
          component.types.includes('postal_code'),
        )
        if (postalCodeComponent) {
          postalCode = postalCodeComponent.long_name
        }

        setBusinessAddress(formattedAddress)
        setBusinessPincode(postalCode)

        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        setLatitude(lat)
        setLongitude(lng)

        setPlaceDetails(place)

        setLocationStatus(`✅ Address selected: Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`)
      })

      autocompleteRef.current = autocomplete
    }
  }, [googleMapsLoaded])

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
  }, [])

  useEffect(() => {
    let timeout
    if (alertVisible) {
      timeout = setTimeout(() => {
        setAlertVisible(false)
      }, 3000)
    }
    return () => clearTimeout(timeout)
  }, [alertVisible])

  // Cleanup camera stream when modal closes
  useEffect(() => {
    if (!showCameraModal && cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
      setIsCameraReady(false)
    }
  }, [showCameraModal, cameraStream])

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setLocationStatus('Fetching current location...')
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude

          setLatitude(lat)
          setLongitude(lng)

          if (googleMapsLoaded) {
            const geocoder = new window.google.maps.Geocoder()
            const latlng = { lat, lng }

            geocoder.geocode({ location: latlng }, (results, status) => {
              if (status === 'OK' && results[0]) {
                const address = results[0].formatted_address
                setBusinessAddress(address)

                const postalCodeComponent = results[0].address_components.find((component) =>
                  component.types.includes('postal_code'),
                )
                if (postalCodeComponent) {
                  setBusinessPincode(postalCodeComponent.long_name)
                }

                if (addressInputRef.current) {
                  addressInputRef.current.value = address
                }

                setLocationStatus(
                  `✅ Current location: Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
                )
              } else {
                setLocationStatus(
                  `✅ Location captured: Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}. Please enter address manually.`,
                )
              }
            })
          } else {
            setLocationStatus(
              `✅ Location captured: Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
            )
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
          setLocationStatus(`❌ Error: ${error.message}. Please enter address manually.`)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      )
    } else {
      setLocationStatus('Geolocation is not supported by this browser.')
    }
  }

  const handleAddressChange = (e) => {
    const value = e.target.value
    setBusinessAddress(value)

    if (autocompleteRef.current && placeDetails) {
      setLatitude(null)
      setLongitude(null)
      setPlaceDetails(null)
      setLocationStatus('Please select an address from the dropdown for accurate location.')
    }
  }

  // Image upload handlers
  const handleFileUpload = (file, setFile, setPreview) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target.result)
      }
      reader.readAsDataURL(file)
      setFile(file)
    }
  }

  const handleShopPhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setAlertMessage('Shop photo size should be less than 5MB.')
        setAlertColor('warning')
        setAlertVisible(true)
        return
      }
      handleFileUpload(file, setShopPhoto, setShopPhotoPreview)
    }
  }

  const handleAadharUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setAlertMessage('Aadhar document size should be less than 5MB.')
        setAlertColor('warning')
        setAlertVisible(true)
        return
      }
      handleFileUpload(file, setAadharDocument, setAadharDocumentPreview)
    }
  }

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })
      setCameraStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          setIsCameraReady(true)
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setAlertMessage('Unable to access camera. Please check permissions.')
      setAlertColor('danger')
      setAlertVisible(true)
      setShowCameraModal(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)

      canvas.toBlob(
        (blob) => {
          const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' })
          handleFileUpload(file, setSelfiePhoto, setSelfiePhotoPreview)
          setShowCameraModal(false)
        },
        'image/jpeg',
        0.8,
      )
    }
  }

  const openCamera = () => {
    setShowCameraModal(true)
    setTimeout(() => {
      startCamera()
    }, 100)
  }

  const removeImage = (setFile, setPreview) => {
    setFile(null)
    setPreview(null)
  }

  const handleSignUp = async () => {
    // Validation
    if (!name.trim()) {
      setAlertMessage('Please enter your name.')
      setAlertColor('warning')
      setAlertVisible(true)
      return
    }

    if (!email.trim()) {
      setAlertMessage('Please enter your email.')
      setAlertColor('warning')
      setAlertVisible(true)
      return
    }

    if (!password.trim()) {
      setAlertMessage('Please enter a password.')
      setAlertColor('warning')
      setAlertVisible(true)
      return
    }

    if (!businessName.trim()) {
      setAlertMessage('Please enter your business name.')
      setAlertColor('warning')
      setAlertVisible(true)
      return
    }

    if (!selectedCategory) {
      setAlertMessage('Please select a business category.')
      setAlertColor('warning')
      setAlertVisible(true)
      return
    }

    if (!businessAddress.trim()) {
      setAlertMessage('Please enter your business address.')
      setAlertColor('warning')
      setAlertVisible(true)
      return
    }

    if (!contactNumber.trim()) {
      setAlertMessage('Please enter your contact number.')
      setAlertColor('warning')
      setAlertVisible(true)
      return
    }

    if (!shopPhoto) {
      setAlertMessage('Please upload a shop photo.')
      setAlertColor('warning')
      setAlertVisible(true)
      return
    }

    if (!selfiePhoto) {
      setAlertMessage('Please take a selfie.')
      setAlertColor('warning')
      setAlertVisible(true)
      return
    }

    if (!aadharDocument) {
      setAlertMessage('Please upload your Aadhar document.')
      setAlertColor('warning')
      setAlertVisible(true)
      return
    }

    setIsLoading(true)

    try {
      // Create FormData for multipart upload
      const formData = new FormData()

      // Add text fields
      formData.append('name', name.trim())
      formData.append('password', password.trim())
      formData.append('email', email.trim())
      formData.append(
        'vendorInfo',
        JSON.stringify({
          contactNumber: contactNumber.trim(),
          alternativeContactNumber: alternativeContactNumber.trim(),
          businessName: businessName.trim(),
        }),
      )
      formData.append(
        'location',
        JSON.stringify({
          address: {
            addressLine1: businessAddress.trim(),
            postalCode: businessPincode.trim(),
          },
          coordinates: latitude && longitude ? [longitude, latitude] : [],
        }),
      )
      formData.append('category', selectedCategory)

      if (placeDetails) {
        formData.append('placeId', placeDetails.place_id)
      }

      // Add image files
      formData.append('shopPhoto', shopPhoto)
      formData.append('selfiePhoto', selfiePhoto)
      formData.append('aadharDocument', aadharDocument)

      const response = await axiosInstance.post('/vendors/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.status === 201) {
        setAlertMessage('Registration successful! Redirecting to login...')
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

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilPhone} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Contact Number"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      required
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilPhone} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Alternative Contact Number (Optional)"
                      value={alternativeContactNumber}
                      onChange={(e) => setAlternativeContactNumber(e.target.value)}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilBuilding} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Business Name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilList} />
                    </CInputGroupText>
                    <CFormSelect
                      aria-label="Select business category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      required
                    >
                      <option value="">Select your business category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CInputGroup>

                  <hr />
                  <p className="text-body-secondary">Business Location</p>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLocationPin} />
                    </CInputGroupText>
                    <CFormInput
                      ref={addressInputRef}
                      placeholder={
                        googleMapsLoaded
                          ? 'Start typing your business address...'
                          : 'Business Address'
                      }
                      value={businessAddress}
                      onChange={handleAddressChange}
                      autoComplete="off"
                      required
                    />
                  </CInputGroup>

                  {!googleMapsLoaded && (
                    <CFormText className="mb-2 text-warning">
                      Address autocomplete is loading...
                    </CFormText>
                  )}

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLocationPin} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Postal Code / PIN Code"
                      value={businessPincode}
                      onChange={(e) => setBusinessPincode(e.target.value)}
                    />
                  </CInputGroup>

                  <div className="mb-3">
                    <div className="d-grid d-md-flex justify-content-md-center gap-2">
                      <CButton
                        color="secondary"
                        variant="outline"
                        onClick={handleGetCurrentLocation}
                        disabled={!googleMapsLoaded}
                        className="mb-2 mb-md-0"
                      >
                        📍 Use Current Location
                      </CButton>
                      <CButton
                        color="info"
                        variant="outline"
                        onClick={() => {
                          setLocationStatus('')
                          setBusinessAddress('')
                          setBusinessPincode('')
                          setLatitude(null)
                          setLongitude(null)
                          setPlaceDetails(null)
                          if (addressInputRef.current) {
                            addressInputRef.current.value = ''
                            addressInputRef.current.focus()
                          }
                        }}
                        className="mb-2 mb-md-0"
                      >
                        🔄 Clear Address
                      </CButton>
                    </div>

                    {locationStatus && (
                      <CFormText className="mt-2 d-block text-center">{locationStatus}</CFormText>
                    )}
                  </div>

                  <hr />
                  <p className="text-body-secondary">Upload Documents & Photos</p>

                  {/* Shop Photo Upload */}
                  <div className="mb-3">
                    <CFormLabel>Shop Photo *</CFormLabel>
                    <div className="d-grid gap-2">
                      <CButton
                        color="primary"
                        variant="outline"
                        onClick={() => shopPhotoInputRef.current?.click()}
                      >
                        <CIcon icon={cilCloudUpload} className="me-2" />
                        Upload Shop Photo
                      </CButton>
                      <CFormInput
                        type="file"
                        ref={shopPhotoInputRef}
                        accept="image/*"
                        onChange={handleShopPhotoUpload}
                        style={{ display: 'none' }}
                      />
                    </div>
                    {shopPhotoPreview && (
                      <div className="mt-2 text-center">
                        <img
                          src={shopPhotoPreview}
                          alt="Shop preview"
                          style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '5px' }}
                        />
                        <div className="mt-1">
                          <CIcon icon={cilCheckCircle} className="text-success me-2" />
                          <small className="text-success">Shop photo uploaded</small>
                          <CButton
                            color="danger"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(setShopPhoto, setShopPhotoPreview)}
                            className="ms-2"
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selfie Photo */}
                  <div className="mb-3">
                    <CFormLabel>Your Selfie *</CFormLabel>
                    <div className="d-grid gap-2">
                      <CButton color="success" variant="outline" onClick={openCamera}>
                        <CIcon icon={cilCamera} className="me-2" />
                        Take Selfie
                      </CButton>
                    </div>
                    {selfiePhotoPreview && (
                      <div className="mt-2 text-center">
                        <img
                          src={selfiePhotoPreview}
                          alt="Selfie preview"
                          style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '50%' }}
                        />
                        <div className="mt-1">
                          <CIcon icon={cilCheckCircle} className="text-success me-2" />
                          <small className="text-success">Selfie captured</small>
                          <CButton
                            color="danger"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(setSelfiePhoto, setSelfiePhotoPreview)}
                            className="ms-2"
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Aadhar Document Upload */}
                  <div className="mb-3">
                    <CFormLabel>Aadhar Card Document *</CFormLabel>
                    <div className="d-grid gap-2">
                      <CButton
                        color="info"
                        variant="outline"
                        onClick={() => aadharInputRef.current?.click()}
                      >
                        <CIcon icon={cilCloudUpload} className="me-2" />
                        Upload Aadhar Document
                      </CButton>
                      <CFormInput
                        type="file"
                        ref={aadharInputRef}
                        accept="image/*,application/pdf"
                        onChange={handleAadharUpload}
                        style={{ display: 'none' }}
                      />
                    </div>
                    <CFormText className="text-muted">
                      Accepted formats: JPG, PNG, PDF (Max: 5MB)
                    </CFormText>
                    {aadharDocumentPreview && (
                      <div className="mt-2 text-center">
                        <img
                          src={aadharDocumentPreview}
                          alt="Aadhar preview"
                          style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '5px' }}
                        />
                        <div className="mt-1">
                          <CIcon icon={cilCheckCircle} className="text-success me-2" />
                          <small className="text-success">Aadhar document uploaded</small>
                          <CButton
                            color="danger"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(setAadharDocument, setAadharDocumentPreview)}
                            className="ms-2"
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </div>
                      </div>
                    )}
                  </div>

                  <hr />

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </CInputGroup>

                  <div className="d-grid">
                    <CButton
                      color="primary"
                      onClick={handleSignUp}
                      disabled={isLoading || !googleMapsLoaded}
                    >
                      {isLoading ? (
                        <>
                          <CSpinner size="sm" className="me-2" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* Camera Modal */}
        <CModal visible={showCameraModal} onClose={() => setShowCameraModal(false)} size="lg">
          <CModalHeader>
            <CModalTitle>Take Your Selfie</CModalTitle>
          </CModalHeader>
          <CModalBody className="text-center">
            <video
              ref={videoRef}
              style={{ width: '100%', maxWidth: '400px', borderRadius: '10px' }}
              autoPlay
              muted
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {!isCameraReady && (
              <div className="mt-3">
                <CSpinner />
                <p className="mt-2">Loading camera...</p>
              </div>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowCameraModal(false)}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={capturePhoto} disabled={!isCameraReady}>
              <CIcon icon={cilCamera} className="me-2" />
              Capture Photo
            </CButton>
          </CModalFooter>
        </CModal>
      </CContainer>
    </div>
  )
}

export default Register
