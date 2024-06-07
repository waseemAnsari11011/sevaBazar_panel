import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
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
import { cilLockLocked, cilUser } from '@coreui/icons'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosConfig'
import { useDispatch } from 'react-redux'
import { setUser } from '../../../store'


const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleLogin = async () => {
    setIsLoading(true);  // Set loading to true when login starts
    try {
      const response = await axiosInstance.post('/vendors/login', {
        email,
        password
      });

      if (response.status === 200) {
        setAlertMessage('Login successful!');
        setAlertColor('success');
        setAlertVisible(true);
        const user = response.data.vendor;

        // Dispatch the setUser action to store user details in Redux and local storage
        dispatch(setUser(user));
        dispatch({ type: 'setIsAuthenticated', isAuthenticated: true });
        dispatch({ type: 'setToken', token: response.data.token });
      }
    } catch (error) {
      if (error.response) {
        console.error('Response error:', error.response.data);
        setAlertMessage(`Login failed: ${error.response.data.message}`);
      } else if (error.request) {
        console.error('Request error:', error.request);
        setAlertMessage('Login failed: No response from server.');
      } else {
        console.error('Error:', error.message);
        setAlertMessage(`Login failed: ${error.message}`);
      }
      setAlertColor('danger');
      setAlertVisible(true);
    } finally {
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
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput placeholder="email" autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" className="px-4" onClick={handleLogin} disabled={isLoading}>
                          {isLoading ? <CSpinner size="sm" /> : 'Login'}
                        </CButton>

                      </CCol>
                      <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                      tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
