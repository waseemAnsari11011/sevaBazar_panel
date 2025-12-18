// ui/products/CreateProducts.js

import React, { useState, useEffect, useCallback } from 'react'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSelect,
  CSpinner,
  CAlert,
  CFormSwitch,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'
import { useSelector, useDispatch } from 'react-redux'

// API Imports
import getAllProducts from '../../../api/product/getAllProduct'
import getProductById from '../../../api/product/getSingleProduct'
import createProduct from '../../../api/product/createProduct'
import updateProductDetails from '../../../api/product/updateProductDetails'
import updateVariation from '../../../api/product/updateVariation'
import addVariationApi from '../../../api/product/addVariationApi'
import toggleVisibilityApi from '../../../api/product/toggleProductVisibility'
import axiosInstance from '../../../utils/axiosConfig'
import deleteProduct from '../../../api/product/deleteProduct'
import deleteVariation from '../../../api/product/deleteVariation';

// Component Imports
import VariationsComponent from './VariationsComponent'
import { Tags } from './tags'
import SearchComponent from '../../components/Search'
import { startLoading, stopLoading } from '../../../redux/actions/defaultActions'

const Products = () => {
  const dispatch = useDispatch()
  const isLoading = useSelector((state) => state.app.loading)
  const user = useSelector((state) => state.app.user)
  const vendor = user?._id

  // Component State
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [modal, setModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [alert, setAlert] = useState({ visible: false, message: '', color: 'success' })

  // Form State
  const [form, setForm] = useState({})
  const [variations, setVariations] = useState([])
  const [initialVariations, setInitialVariations] = useState([]) // For tracking changes
  const [tags, setTags] = useState([])

  // Resets the entire form and modal state
  const resetFormState = useCallback(() => {
    setForm({
      name: '',
      description: '',
      vendorProductCategory: '',
      vendor,
      tags: [],
      isReturnAllowed: false,
      isReturnAllowed: false,
      isVisible: true,
      isOffered: false,
    })
    // **CORRECTED:** Initializes variations with the correct nested attribute structure
    setVariations([
      { attributes: [{ name: '', value: '' }], price: '', discount: '', quantity: '', images: [] },
    ])
    setTags([])
    setEditingProduct(null)
    setInitialVariations([])
  }, [vendor])

  // Fetches initial products and categories
  const fetchData = useCallback(async () => {
    if (!vendor) return
    dispatch(startLoading())
    try {
      const [productsData, categoriesResponse] = await Promise.all([
        getAllProducts(vendor),
        axiosInstance.get(`/vendor-product-category/vendor/${vendor}`),
      ])
      setProducts(productsData)
      setFilteredProducts(productsData)
      setCategories(categoriesResponse.data.categories)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setAlert({ visible: true, message: 'Failed to load data.', color: 'danger' })
    } finally {
      dispatch(stopLoading())
    }
  }, [vendor, dispatch])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handles auto-hiding of alerts
  useEffect(() => {
    if (alert.visible) {
      const timer = setTimeout(() => setAlert({ ...alert, visible: false }), 4000)
      return () => clearTimeout(timer)
    }
  }, [alert])

  // Toggles the main Add/Edit modal
  const toggleModal = () => {
    setModal(!modal)
    if (modal) {
      resetFormState()
    }
  }

  // ✅ HANDLER FOR ADD PRODUCT BUTTON
  const handleAddNewProduct = () => {
    resetFormState()
    setModal(true)
  }

  // Handles changes in main product form fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  // Prepares the form for editing an existing product
  const handleEdit = async (id) => {
    dispatch(startLoading())
    try {
      const { product } = await getProductById(id)
      setEditingProduct(product)
      setForm({
        name: product.name,
        description: product.description,
        vendorProductCategory: product.vendorProductCategory?._id || '',
        vendor: product.vendor,
        tags: product.tags,
        isReturnAllowed: product.isReturnAllowed,
        isVisible: product.isVisible,
        isReturnAllowed: product.isReturnAllowed,
        isVisible: product.isVisible,
        isOffered: product.isOffered,
      })
      setTags(product.tags)

      // **CORRECTED:** Ensures fetched variations have a valid attributes array for the UI
      const formattedVariations = product.variations.map((v) => ({
        ...v,
        attributes:
          v.attributes && v.attributes.length > 0 ? v.attributes : [{ name: '', value: '' }],
      }))

      setVariations(formattedVariations)
      setInitialVariations(formattedVariations)
      setModal(true)
    } catch (error) {
      console.error('Failed to fetch product details:', error)
      setAlert({ visible: true, message: 'Could not fetch product details.', color: 'danger' })
    } finally {
      dispatch(stopLoading())
    }
  }

  // Handles form submission for both creating and updating products
  const handleSubmit = async () => {
    dispatch(startLoading())
    try {
      if (editingProduct) {
        // --- UPDATE LOGIC ---
        await updateProductDetails(editingProduct._id, { ...form, tags })

        const initialVarIds = new Set(initialVariations.map((v) => v._id))
        const addedVariations = variations.filter((v) => !v._id)
        const updatedVariations = variations.filter((v) => v._id && initialVarIds.has(v._id))
        
        // Identify deleted variations
        const currentVarIds = new Set(variations.map((v) => v._id).filter(Boolean))
        const deletedVariations = initialVariations.filter((v) => !currentVarIds.has(v._id))

        const promises = [
          ...addedVariations.map((v) => addVariationApi(editingProduct._id, v)),
          ...updatedVariations.map((v) => updateVariation(editingProduct._id, v._id, v)),
          ...deletedVariations.map((v) => deleteVariation(editingProduct._id, v._id)),
        ]

        await Promise.all(promises)
        setAlert({ visible: true, message: 'Product updated successfully!', color: 'success' })
      } else {
        // --- CREATE LOGIC ---
        const productData = { ...form, variations, tags }
        await createProduct(productData)
        setAlert({ visible: true, message: 'Product created successfully!', color: 'success' })
      }

      toggleModal()
      await fetchData() // Refresh data in the table
    } catch (error) {
      console.error('Form submission error:', error)
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.'
      setAlert({ visible: true, message: errorMessage, color: 'danger' })
    } finally {
      dispatch(stopLoading())
    }
  }

  // Toggles product visibility directly from the table
  const handleProductVisibility = async (id, currentVisibility) => {
    try {
      await toggleVisibilityApi(id, !currentVisibility)
      await fetchData() // Refresh to show the new state
    } catch (error) {
      console.error('Failed to toggle visibility:', error)
      setAlert({ visible: true, message: 'Could not update visibility.', color: 'danger' })
    }
  }

  // Handle product deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(startLoading())
      try {
        await deleteProduct(id)
        setAlert({ visible: true, message: 'Product deleted successfully!', color: 'success' })
        await fetchData() // Refresh the list
      } catch (error) {
        console.error('Failed to delete product:', error)
        setAlert({ visible: true, message: 'Failed to delete product.', color: 'danger' })
      } finally {
        dispatch(stopLoading())
      }
    }
  }

  // Main component render
  return (
    <div>
      {alert.visible && (
        <CAlert
          color={alert.color}
          dismissible
          onClose={() => setAlert({ ...alert, visible: false })}
        >
          {alert.message}
        </CAlert>
      )}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Products</h2>
        {/* ✅ CORRECTED ONCLICK HANDLER */}
        <CButton color="primary" onClick={handleAddNewProduct}>
          Add Product
        </CButton>
      </div>
      <SearchComponent items={products} searchKey="name" onFilteredItems={setFilteredProducts} />

      {isLoading && !modal ? (
        <div className="text-center p-5">
          <CSpinner />
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <CTable striped hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Photo</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Category</CTableHeaderCell>
                <CTableHeaderCell>Base Price</CTableHeaderCell>
                <CTableHeaderCell>Total Stock</CTableHeaderCell>
                <CTableHeaderCell>Visibility</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredProducts.map((product) => (
                <CTableRow key={product._id}>
                  <CTableDataCell>
                    <img
                      src={product.variations[0]?.images[0]}
                      alt={product.name}
                      className="table-img"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/50')}
                    />
                  </CTableDataCell>
                  <CTableDataCell>{product.name}</CTableDataCell>
                  <CTableDataCell>{product.vendorProductCategory?.name || 'Uncategorized'}</CTableDataCell>
                  <CTableDataCell>₹{product.variations[0]?.price || 'N/A'}</CTableDataCell>
                  <CTableDataCell>
                    {product.variations.reduce((sum, v) => sum + (v.quantity || 0), 0)}
                  </CTableDataCell>
                  <CTableDataCell>
                    <CFormSwitch
                      checked={product.isVisible}
                      onChange={() => handleProductVisibility(product._id, product.isVisible)}
                    />
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton color="warning" size="sm" onClick={() => handleEdit(product._id)} className="me-2">
                      <CIcon icon={cilPencil} />
                    </CButton>
                    <CButton color="danger" size="sm" onClick={() => handleDelete(product._id)}>
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <CModal visible={modal} onClose={toggleModal} size="lg">
        <CModalHeader>
          <CModalTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              className="mb-3"
              label="Product Name"
              name="name"
              value={form.name || ''}
              onChange={handleChange}
            />
            <CFormInput
              className="mb-3"
              label="Product Description"
              name="description"
              as="textarea"
              rows={3}
              value={form.description || ''}
              onChange={handleChange}
            />
            <CFormSelect
              className="mb-3"
              label="Product Category"
              name="vendorProductCategory"
              value={form.vendorProductCategory || ''}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </CFormSelect>
            <Tags tags={tags} setTags={setTags} />
            <Tags tags={tags} setTags={setTags} />
            <CFormSwitch
              className="my-3"
              label="Hand-to-Hand Return Allowed"
              name="isReturnAllowed"
              checked={form.isReturnAllowed || false}
              onChange={handleChange}
            />
            <CFormSwitch
              className="mb-3"
              label="Visible to Customers"
              name="isVisible"
              checked={form.isVisible || false}
              onChange={handleChange}
            />
            <CFormSwitch
              className="mb-3"
              label="Add to Offers"
              name="isOffered"
              checked={form.isOffered || false}
              onChange={handleChange}
            />
            <VariationsComponent variations={variations} setVariations={setVariations} />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={toggleModal}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <CSpinner size="sm" /> : editingProduct ? 'Save Changes' : 'Add Product'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default Products
