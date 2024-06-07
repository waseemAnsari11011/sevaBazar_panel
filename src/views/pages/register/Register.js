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
  CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilBuilding, cilLocationPin, cilPhone } from '@coreui/icons'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosConfig';


const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertColor, setAlertColor] = useState('primary');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timeout;
    if (alertVisible) {
      timeout = setTimeout(() => {
        setAlertVisible(false);
      }, 1000); // Hide alert after 5 seconds (adjust as needed)
    }
    return () => clearTimeout(timeout);
  }, [alertVisible]);


  const handleSignUp = async () => {
    setIsLoading(true);  // Set loading to true when login starts
    try {
      const response = await axiosInstance.post('/vendors/signup', {
        name:name,
        password,
        email,
        vendorInfo: {
          contactNumber,
          businessName
        },
      });

      if (response.status === 201) {
        setAlertMessage('Registration successful!');
        setAlertColor('success');
        setAlertVisible(true);
        console.log("navigate")
        setTimeout(() => {
          navigate('/');
        }, 1000); // Adjust delay as needed
      }
    } catch (error) {
      if (error.response) {
        console.error('Response error:', error.response.data);
        setAlertMessage(`Registration failed: ${error.response.data.message}`);
      } else if (error.request) {
        console.error('Request error:', error.request);
        setAlertMessage('Registration failed: No response from server.');
      } else {
        console.error('Error:', error.message);
        setAlertMessage(`Registration failed: ${error.message}`);
      }
      setAlertColor('danger');
      setAlertVisible(true);
    }finally {
      setIsLoading(false);  // Set loading to false when login is complete
    }
  };


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
                  <p className="text-body-secondary">Create your account</p>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput placeholder="Name" autoComplete="name" onChange={(e) => setName(e.target.value)} />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput placeholder="Email" autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText><CIcon icon={cilPhone} /></CInputGroupText>
                    <CFormInput placeholder="Contact Number" autoComplete="contactNumber" onChange={(e) => setContactNumber(e.target.value)} />
                  </CInputGroup>
                  {/* <CInputGroup className="mb-3">
                    <CInputGroupText> <CIcon icon={cilBuilding} /></CInputGroupText>
                    <CFormInput placeholder="Business Name" autoComplete="businessName" onChange={(e) => setBusinessName(e.target.value)} />
                  </CInputGroup> */}
                  {/* <CInputGroup className="mb-3">
                    <CInputGroupText>  <CIcon icon={cilLocationPin} /></CInputGroupText>
                    <CFormInput placeholder="Available Locations (pin code)" autoComplete="availableLocalities" onChange={(e) => setAvailableLocalities(e.target.value)} />
                  </CInputGroup> */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      autoComplete="new-password"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </CInputGroup>
                  <div className="d-grid">
                    <CButton color="primary" className="px-4" onClick={handleSignUp} disabled={isLoading}>
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
