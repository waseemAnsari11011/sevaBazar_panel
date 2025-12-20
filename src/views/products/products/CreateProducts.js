// ui/products/CreateProducts.js

import React, { useState, useEffect, useCallback } from 'react'
import {
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CAlert,
  CFormSwitch,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

// API Imports
import getAllProducts from '../../../api/product/getAllProduct'
import toggleVisibilityApi from '../../../api/product/toggleProductVisibility'
import axiosInstance from '../../../utils/axiosConfig'
import deleteProduct from '../../../api/product/deleteProduct'

// Component Imports
import SearchComponent from '../../components/Search'
import { startLoading, stopLoading } from '../../../redux/actions/defaultActions'

const Products = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isLoading = useSelector((state) => state.app.loading)
  const user = useSelector((state) => state.app.user)
  const vendor = user?._id

  // Component State
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [alert, setAlert] = useState({ visible: false, message: '', color: 'success' })

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

  // ✅ HANDLER FOR ADD PRODUCT BUTTON
  const handleAddNewProduct = () => {
    navigate('/products/add-product')
  }

  // Prepares the form for editing an existing product
  const handleEdit = (id) => {
    navigate(`/products/edit-product/${id}`)
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

      {isLoading ? (
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
    </div>
  )
}

export default Products

