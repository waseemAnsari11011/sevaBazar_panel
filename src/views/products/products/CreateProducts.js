import { useCallback, useState, useEffect } from 'react';
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
    CSpinner

} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilCloudUpload } from '@coreui/icons'
import '../Products.css' // Import custom CSS file
import { useDropzone } from 'react-dropzone';
import getAllCategories from '../../../api/category/getAllCategory';
import createProduct from '../../../api/product/createProduct';
import getAllProducts from '../../../api/product/getAllProduct';
import { baseURL } from '../../../utils/axiosConfig';
import getProductById from '../../../api/product/getSingleProduct';
import updateProduct from '../../../api/product/updateProduct';
import deleteProduct from '../../../api/product/deleteProduct';
import { useDispatch, useSelector } from 'react-redux';
import { startLoading, stopLoading } from '../../../store';


const Products = () => {
    const dispatch = useDispatch()
    const isLoading = useSelector((state) => state.loading)
    const [products, setProducts] = useState([])
    const [modal, setModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [form, setForm] = useState({
        name: '',
        price: '',
        description: '',
        images: [],
        discount: '',
        category: ''
    });
    const [categories, setCategories] = useState([]);
    // Fetch categories 
    const fetchCategories = async () => {
        try {
            dispatch(startLoading())
            const categoriesData = await getAllCategories();
            setCategories(categoriesData);
            dispatch(stopLoading())
        } catch (error) {
            dispatch(stopLoading())
            console.error('Failed to fetch categories:', error);
        }
    };
    // Fetch products 
    const fetchProducts = async () => {
        try {
            dispatch(startLoading())
            const productsData = await getAllProducts();
            setProducts(productsData);
            dispatch(stopLoading())
        } catch (error) {
            dispatch(stopLoading())
            console.error('Failed to fetch categories:', error);
        }
    };

    useEffect(() => {

        fetchProducts()
        fetchCategories();
    }, []);

    const toggleModal = () => {
        if (editingProduct !== null) {
            setForm({ name: '', price: '', images: [], description: '', discount: '', category: '' })
            setEditingProduct(null)
        }
        setModal(!modal)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm({ ...form, [name]: value })
    }

    const onDrop = useCallback(acceptedFiles => {
        // Update form state with the uploaded images
        setForm({ ...form, images: form.images.concat(acceptedFiles) });
    }, [form]);

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const handleSubmit = async (productId) => {
        try {
            dispatch(startLoading())

            if (editingProduct !== null) {
                const updatedProducts = products.map((product, index) =>
                    index === editingProduct ? form : product
                )
                // setProducts(updatedProducts)
                // await updateProduct(productId, { ...form, category: typeof form.category === 'string' ? form.category : form.category._id });
                await updateProduct(productId, form);

                await fetchProducts()
                dispatch(stopLoading())

            } else {
                await createProduct(form)
                await fetchProducts()
                dispatch(stopLoading())


                // setProducts([...products, form])
            }
            setForm({ name: '', price: '', images: [], description: '', discount: '', category: '' })
            setEditingProduct(null)
            toggleModal()

        } catch (error) {
            dispatch(stopLoading())

            console.log("error--->", error)
        }

    }

    const handleEdit = async (index, id) => {
        let singProduct = await getProductById(id)
        setEditingProduct(index)
        // setForm(products[index])
        setForm(singProduct.product)
        toggleModal()
    }



    const removeImage = (index) => {
        setForm({
            ...form,
            images: form.images.filter((_, i) => i !== index)
        });
    };



    const handleCategoryChange = (e) => {
        setForm({
            ...form,
            category: e.target.value
        });
    };

    const handleDelete = async (id) => {
        try {
            await deleteProduct(id);
            fetchProducts()
        } catch (error) {
            console.error('Failed to delete category:', error);
        }
    };


    

    return (
        <div>
            <h2>Manage Products</h2>
            <div className="mb-4">
                <CButton color="primary" onClick={toggleModal}>Add Product</CButton>
            </div>
            {isLoading ? <div className="spinner-container">
                <CSpinner size="sm" color="blue" />
            </div> : <div style={{ overflowX: 'auto' }}>
                <CTable striped>
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell>Photo</CTableHeaderCell>
                            <CTableHeaderCell>Name</CTableHeaderCell>
                            <CTableHeaderCell>Description</CTableHeaderCell>
                            <CTableHeaderCell>Price</CTableHeaderCell>
                            <CTableHeaderCell>Discount</CTableHeaderCell>
                            <CTableHeaderCell>Actions</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {products.map((product, index) => (
                            <CTableRow key={index}>
                                <CTableDataCell>
                                    {product.images.slice(0, 2).map((file, imgIndex) => (
                                        <img
                                            key={imgIndex}
                                            src={`${baseURL}/${file}`}
                                            alt={`Product Image ${imgIndex + 1}`}
                                            className="table-img"
                                        />
                                    ))}
                                </CTableDataCell>
                                <CTableDataCell>{product.name}</CTableDataCell>
                                <CTableDataCell>{product.description}</CTableDataCell>
                                <CTableDataCell>{product.price}</CTableDataCell>
                                <CTableDataCell>{product.discount}</CTableDataCell>
                                <CTableDataCell >
                                    <div className='actions-cell'>
                                        <CButton color="warning" onClick={() => handleEdit(index, product._id)}>
                                            <CIcon icon={cilPencil} />
                                        </CButton>{' '}
                                        <CButton color="danger" onClick={() => handleDelete(product?._id)}>
                                            <CIcon icon={cilTrash} />
                                        </CButton>
                                    </div>

                                </CTableDataCell>
                            </CTableRow>
                        ))}
                    </CTableBody>
                </CTable>
            </div>}

            <CModal visible={modal} onClose={toggleModal}>
                <CModalHeader>
                    <CModalTitle>{editingProduct !== null ? 'Edit Product' : 'Add Product'}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <CFormInput
                            name="name"
                            label="Product Name"
                            value={form.name}
                            onChange={handleChange}
                        />
                        {/* Dropzone for multi-image upload */}
                        <div {...getRootProps()} className="upload-container">
                            <input {...getInputProps()} />
                            <CButton color="primary" variant="outline">
                                <CIcon icon={cilCloudUpload} size="lg" className="me-2" />
                                Upload Images
                            </CButton>
                        </div>
                        {/* Display uploaded images */}
                        <div className="actions-cell">
                            {form?.images?.map((file, index) => (
                                <div key={index} className="image-wrapper">
                                    <img
                                        className="img"
                                        src={typeof file === 'string' ? `${baseURL}/${file}` : URL.createObjectURL(file)}
                                        alt={`Product Image ${index + 1}`}
                                    />
                                    <button type="button" className="close-button" onClick={() => removeImage(index)}>✖</button>
                                </div>
                            ))}
                        </div>
                        {/* Dropdown to select category */}
                        <CFormSelect
                            name="category"
                            label="Category"
                            value={form?.category}
                            onChange={handleCategoryChange}
                        >
                            <option value="" disabled>Select Category</option>
                            {categories.map((category) => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </CFormSelect>
                        <CFormInput
                            name="price"
                            label="Product Price"
                            value={form.price}
                            onChange={handleChange}
                        />
                        <CFormInput
                            name="discount"
                            label="Product Discount"
                            value={form.discount}
                            onChange={handleChange}
                        />
                        <CFormInput
                            name="description"
                            label="Product Description"
                            value={form.description}
                            onChange={handleChange}
                        />


                    </CForm>
                </CModalBody>
                <CModalFooter>
                    {isLoading ? <CButton color="primary">{editingProduct !== null ? "Updating Product" : "Creating Product"} <CSpinner size="sm" color='white' /></CButton> : <CButton color="primary" onClick={() => handleSubmit(form._id)}>
                        {editingProduct !== null ? 'Save Changes' : 'Add Product'}
                    </CButton>}

                </CModalFooter>
            </CModal>
        </div>
    )
}

export default Products
