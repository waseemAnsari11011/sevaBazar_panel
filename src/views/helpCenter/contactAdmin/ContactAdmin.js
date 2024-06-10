import React, { useState, useEffect } from 'react';
import {
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CAlert
} from '@coreui/react';
import axiosInstance from '../../../utils/axiosConfig';


const ContactAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    instagramId: '',
    twitterId: '',
    facebookId: ''
  });


  useEffect(() => {
    let timeout;
    if (alertVisible) {
      timeout = setTimeout(() => {
        setAlertVisible(false);
      }, 1000); // Hide alert after 5 seconds (adjust as needed)
    }
    return () => clearTimeout(timeout);
  }, [alertVisible]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactInfo({ ...contactInfo, [name]: value });
  };

  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      const response = await axiosInstance.post('/contact', contactInfo, {
       
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // Include the token in the Authorization header

        }
      });

      if (response.status === 200) {
        setAlertVisible(true)

        const data = response.data;
        console.log('Contact saved:', data);
      } else {
        console.error('Error saving contact:', response.statusText);
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error('Error:', error);
    }
  };

  const getContact = async () => {
    try {
      // Make a GET request to your backend API endpoint
      const response = await axiosInstance.get('/get-contact');

      if (response.status === 200) {
        // If the request is successful, set the contact information
        const contactInfo = response.data;
        // Assuming you have a state setter function named setContactInfo
        setContactInfo(contactInfo);
      } else {
        console.error('Error fetching contact:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {

    getContact()
  }, []);

  console.log("alert-->>", alertVisible)




  return (
    <div>
      {alertVisible && (
        <CAlert color={'success'} onClose={() => setAlertVisible(false)} dismissible>
          Contact Added successfully
        </CAlert>
      )}
       <CCard>
      <CCardHeader>Contact</CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          <div className='mb-2'>
            <CFormLabel htmlFor="phone">Phone</CFormLabel>
            <CFormInput
              type="text"
              id="phone"
              name="phone"
              value={contactInfo.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className='mb-2'>
            <CFormLabel htmlFor="email">Email</CFormLabel>
            <CFormInput
              type="email"
              id="email"
              name="email"
              value={contactInfo.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className='mb-2'>
            <CFormLabel htmlFor="instagramId">Instagram ID</CFormLabel>
            <CFormInput
              type="text"
              id="instagramId"
              name="instagramId"
              value={contactInfo.instagramId}
              onChange={handleChange}
            />
          </div>

          <div className='mb-2'>
            <CFormLabel htmlFor="twitterId">Twitter ID</CFormLabel>
            <CFormInput
              type="text"
              id="twitterId"
              name="twitterId"
              value={contactInfo.twitterId}
              onChange={handleChange}
            />
          </div>
          <div className='mb-2'>
            <CFormLabel htmlFor="facebookId">Facebook ID</CFormLabel>
            <CFormInput
              type="text"
              id="facebookId"
              name="facebookId"
              value={contactInfo.facebookId}
              onChange={handleChange}
            />
          </div>
          <CButton type="submit" color="primary" disabled={loading}>
            {loading ? <CSpinner color="light" size="sm" /> : "Save Contact"}
          </CButton>
        </CForm>
      </CCardBody>
    </CCard>
    </div>
   
  );
};

export default ContactAdmin;
