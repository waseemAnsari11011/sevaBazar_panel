import React, { useState, useEffect } from 'react';
import {
  CAccordion, CAccordionItem, CAccordionHeader, CAccordionBody,
  CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CFormLabel, CFormInput, CFormTextarea, CSpinner
} from '@coreui/react';
import '@coreui/coreui/dist/css/coreui.min.css';
import { cilPencil, cilTrash } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { startLoading, stopLoading } from '../../../store';
import addFaq from '../../../api/helpCenter/addFaq';
import getFAQs from '../../../api/helpCenter/getFaqs';
import getFaqById from '../../../api/helpCenter/getFaqById';
import updateFAQ from '../../../api/helpCenter/updateFaq';
import deleteFAQ from '../../../api/helpCenter/deleteFaq';

const Faqs = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.loading);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    question: '',
    answer: ''
  });
  const [faqs, setFaqs] = useState([]);

  console.log("faqs--->>>", faqs)

  useEffect(() => {

    fetchFaqs()
  }, []);


  // Fetch products 
  const fetchFaqs = async () => {
    try {
      dispatch(startLoading())
      const data = await getFAQs();
      setFaqs(data);
      dispatch(stopLoading())
    } catch (error) {
      dispatch(stopLoading())
      console.error('Failed to fetch categories:', error);
    }
  };

  const toggleModal = () => {
    if (editing !== null) {
      setForm({
        question: '',
        answer: ''
      });
      setEditing(null);
    }
    setModal(!modal);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (id) => {
    try {
      dispatch(startLoading());
      if (editing !== null) {
        // Handle edit logic here if needed
        await updateFAQ(id, form.question, form.answer);
        await fetchFaqs()
        dispatch(stopLoading())

      } else {
        await addFaq(form.question, form.answer); // Call addFaq API with question and answer
        await fetchFaqs()
      }
      dispatch(stopLoading());
      setForm({
        question: '',
        answer: ''
      });
      setEditing(null);
      toggleModal();
    } catch (error) {
      console.error('Error adding FAQ:', error);
      dispatch(stopLoading());
    }
  };

  const handleEdit = async (index, id) => {
    let singleFaq = await getFaqById(id)
    setEditing(index)
    setForm(singleFaq)
    toggleModal()
  }

  const handleDelete = async (id) => {
    try {
        await deleteFAQ(id);
       await fetchFaqs()
    } catch (error) {
        console.error('Failed to delete category:', error);
    }
};


  return (
    <div>
      <h2>FAQs</h2>
      <div className="mb-3">
        <CButton color="primary" onClick={toggleModal}>Add FAQ</CButton>
      </div>

      <div>
        {faqs.map((faq, index) => (
          <div key={index} className='mb-3'>
            <div className="d-flex justify-content-end mb-2">
              <CButton color="warning" size="sm" className="me-2" onClick={() => handleEdit(index, faq._id)}>
                <CIcon icon={cilPencil} /> Edit
              </CButton>
              <CButton color="danger" size="sm" onClick={() => handleDelete(faq?._id)}>
                <CIcon icon={cilTrash} /> Delete
              </CButton>
            </div>
            <CAccordion>
              <CAccordionItem key={faq._id}>
                <CAccordionHeader>{faq.question}</CAccordionHeader>
                <CAccordionBody>{faq.answer}</CAccordionBody>
              </CAccordionItem>
            </CAccordion>
          </div>
        ))}
      </div>


      <CModal visible={modal} onClose={toggleModal}>
        <CModalHeader onClose={toggleModal}>
          <CModalTitle>{editing !== null ? 'Edit FAQ' : 'Add FAQ'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <CFormLabel htmlFor="question">Question</CFormLabel>
              <CFormInput
                name="question"
                value={form.question}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="answer">Answer</CFormLabel>
              <CFormTextarea
                name="answer"
                value={form.answer}
                onChange={handleChange}
                required
              />
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          {isLoading ? (
            <CButton color="primary">{editing !== null ? "Updating FAQ" : "Creating FAQ"} <CSpinner size="sm" color='white' /></CButton>
          ) : (
            <CButton color="primary" onClick={() => handleSubmit(form._id)}>
              {editing !== null ? 'Save Changes' : 'Add FAQ'}
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default Faqs;
