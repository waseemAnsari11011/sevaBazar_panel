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
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLocationPin } from '@coreui/icons'
import { updateVendorAddress } from '../../api/vendor/updateVendorAddress'
import { getVendorById } from '../../api/vendor/getVendorById'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const UpdateAddress = () => {
  const user = useSelector((state) => state.auth?.user)
  console.log('user===>>>', user)
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated)
  const navigate = useNavigate()

  const [address, setAddress] = useState('')
  const [landmark, setLandmark] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const addressInputRef = useRef(null)
  const autocompleteRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const fetchVendorData = async () => {
      if (user) {
        try {
          const { vendor } = await getVendorById(user._id)
          if (vendor.location && vendor.location.address) {
            setAddress(vendor.location.address.addressLine1 || '')
            setLandmark(vendor.location.address.landmark || '')
            setPostalCode(vendor.location.address.postalCode || '')
          }
          if (vendor.location && vendor.location.coordinates) {
            setLongitude(vendor.location.coordinates[0])
            setLatitude(vendor.location.coordinates[1])
          }
        } catch (error) {
          console.error('Failed to fetch vendor data', error)
        }
      }
    }

    fetchVendorData()
  }, [user])

  useEffect(() => {
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

    if (window.google && window.google.maps && window.google.maps.places) {
      setGoogleMapsLoaded(true)
    } else {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setGoogleMapsLoaded(true)
      document.head.appendChild(script)
    }
  }, [])

  useEffect(() => {
    if (googleMapsLoaded && addressInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'in' },
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()

        if (place.geometry) {
          setAddress(place.formatted_address)
          setLatitude(place.geometry.location.lat())
          setLongitude(place.geometry.location.lng())

          const postalCodeComponent = place.address_components.find((component) =>
            component.types.includes('postal_code'),
          )

          if (postalCodeComponent) {
            setPostalCode(postalCodeComponent.long_name)
          }
        }
      })

      autocompleteRef.current = autocomplete
    }
  }, [googleMapsLoaded])

  const handleUpdateAddress = async () => {
    setIsLoading(true)
    try {
      await updateVendorAddress(user._id, {
        address,
        landmark,
        postalCode,
        latitude,
        longitude,
      })
      alert('Address updated successfully!')
    } catch (error) {
      console.error('Failed to update address', error)
      alert('Failed to update address')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <CContainer
        className="d-flex justify-content-center align-items-center"
        style={{ height: '50vh' }}
      >
        <CSpinner color="primary" />
      </CContainer>
    )
  }

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={6}>
          <CCard>
            <CCardBody>
              <CForm>
                <h1>Update Address</h1>
                <p className="text-body-secondary">Update your business address</p>
                <CInputGroup className="mb-3">
                  <CInputGroupText>
                    <CIcon icon={cilLocationPin} />
                  </CInputGroupText>
                  <CFormInput
                    ref={addressInputRef}
                    placeholder="Business Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </CInputGroup>
                <CInputGroup className="mb-3">
                  <CInputGroupText>
                    <CIcon icon={cilLocationPin} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Landmark"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                  />
                </CInputGroup>
                <CInputGroup className="mb-3">
                  <CInputGroupText>
                    <CIcon icon={cilLocationPin} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Postal Code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                  />
                </CInputGroup>
                <CButton color="primary" onClick={handleUpdateAddress} disabled={isLoading}>
                  {isLoading ? <CSpinner size="sm" /> : 'Update Address'}
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default UpdateAddress
