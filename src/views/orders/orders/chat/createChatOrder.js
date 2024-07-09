import React, { useState, useEffect } from 'react';
import {
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CButton,
  CForm,
  CFormLabel,
  CFormInput,
  CRow,
  CCol,
} from '@coreui/react';
import axiosInstance from '../../../../utils/axiosConfig';
import { fetchChatOrdersByVendor } from '../../../../redux/actions/chatOrdersActions';
import { useDispatch } from 'react-redux';


const CreateChatOrderModal = ({ orderId, vendorId }) => {
    const dispatch = useDispatch()
  const [visible, setVisible] = useState(false);
  const [products, setProducts] = useState([{ name: '', quantity: 1, price: 0, discount: 0, totalAmount: 0 }]);

  const toggleModal = () => {
    setVisible(!visible);
  };

  useEffect(() => {
    if (visible) {
      fetchChatOrder();
    }
  }, [visible]);

  const fetchChatOrder = async () => {
    try {
      const response = await axiosInstance.get(`/chat-order/${orderId}`);
      const order = response.data;
      setProducts(order.products);
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = products.map((product, i) => {
      if (i === index) {
        const updatedProduct = { ...product, [field]: value };
        if (field === 'price' || field === 'discount' || field === 'quantity') {
          const price = parseFloat(updatedProduct.price) || 0;
          const discount = parseFloat(updatedProduct.discount) || 0;
          const quantity = parseInt(updatedProduct.quantity) || 1;
          updatedProduct.totalAmount = (price * quantity * (1 - discount / 100)).toFixed(2);
        }
        return updatedProduct;
      }
      return product;
    });
    setProducts(updatedProducts);
  };

  const addProduct = () => {
    setProducts([...products, { name: '', quantity: 1, price: 0, discount: 0, totalAmount: 0 }]);
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      const response = await axiosInstance.put('/chat/updateChatOrder', {
        orderId,
        products,
      });
      console.log('Order updated:', response.data);
      dispatch(fetchChatOrdersByVendor(vendorId));
      alert(response.data.message)
      toggleModal();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  console.log("products chat-->>", products)

  return (
    <>
      <CButton color="primary" onClick={toggleModal}>
        Create
      </CButton>
      <CModal visible={visible} onClose={toggleModal}>
        <CModalHeader onClose={toggleModal} closeButton>
          <CModalTitle>Create Chat Order</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            {products.map((product, index) => (
              <div key={index}>
                <CRow>
                  <CCol xs="12" md="6">
                    <CFormLabel htmlFor={`name-${index}`}>Product Name</CFormLabel>
                    <CFormInput
                      id={`name-${index}`}
                      value={product.name}
                      onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                      required
                    />
                  </CCol>
                  <CCol xs="12" md="3">
                    <CFormLabel htmlFor={`quantity-${index}`}>Quantity</CFormLabel>
                    <CFormInput
                      type="number"
                      id={`quantity-${index}`}
                      value={product.quantity}
                      onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                      min="1"
                      required
                    />
                  </CCol>
                  <CCol xs="12" md="3">
                    <CFormLabel htmlFor={`price-${index}`}>Price</CFormLabel>
                    <CFormInput
                      type="number"
                      id={`price-${index}`}
                      value={product.price}
                      onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                      min="0"
                      required
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol xs="12" md="6">
                    <CFormLabel htmlFor={`discount-${index}`}>Discount (%)</CFormLabel>
                    <CFormInput
                      type="number"
                      id={`discount-${index}`}
                      value={product.discount}
                      onChange={(e) => handleProductChange(index, 'discount', e.target.value)}
                      min="0"
                      max="100"
                    />
                  </CCol>
                </CRow>
                <CButton color="danger" onClick={() => removeProduct(index)}>Remove</CButton>
                <hr />
              </div>
            ))}
            <CButton color="success" onClick={addProduct}>Add Product</CButton>
          </CForm>
        </CModalBody>
        <CModalFooter>
          {/* <CButton color="secondary" onClick={toggleModal}>
            Close
          </CButton> */}
          <CButton color="primary" onClick={handleSave}>
            Save changes
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default CreateChatOrderModal;
