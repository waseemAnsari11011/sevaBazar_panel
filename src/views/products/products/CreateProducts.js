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
    CSpinner, CBadge, CRow, CCol, CFormCheck,
    CAlert,
    CFormSwitch
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
import VariationsComponent from './VariationsComponent';
import { Tags } from './tags';
import SearchComponent from '../../components/Search';


const Products = () => {
    const dispatch = useDispatch()
    const isLoading = useSelector((state) => state.loading)
    const user = useSelector((state) => state.user)
    const vendor = user._id

    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])

    const [modal, setModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [form, setForm] = useState({
        name: '',
        description: '',
        images: [],
        category: '',
        vendor,
        availableLocalities: [],
        tags: [],
        isReturnAllowed: false
    });
    const [categories, setCategories] = useState([]);
    const [pincode, setPincode] = useState('');
    const [pincodes, setPincodes] = useState([]);
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [variations, setVariations] = useState([
        { attributes: { selected: '', value: '' }, price: '', discount: '', quantity: '', images: [], parentVariation: null }
    ]);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertVisible, setAlertVisible] = useState(false);
    const [tag, setTag] = useState('');
    const [tags, setTags] = useState([]);

    useEffect(() => {
        let timeout;
        if (alertVisible) {
            timeout = setTimeout(() => {
                setAlertVisible(false);
            }, 3000); // Hide alert after 5 seconds (adjust as needed)
        }
        return () => clearTimeout(timeout);
    }, [alertVisible]);

    //pincode
    const handleAddPincode = () => {
        if (pincode && !pincodes.includes(pincode)) {
            setPincodes([...pincodes, pincode]);
            setPincode('');
            setForm({ ...form, availableLocalities: [...pincodes, pincode] });

        }
    };

    const handleRemovePincode = (code) => {
        setPincodes(pincodes.filter(p => p !== code));
        setForm({ ...form, availableLocalities: form.availableLocalities.filter(p => p !== code) });
    };

    const handleAllChange = () => {
        setIsAllSelected(!isAllSelected);
        if (!isAllSelected) {
            setPincodes(['all']); // Clear pincodes if "all" is selected
            setForm({ ...form, availableLocalities: ['all'] });
        }
    };






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
            const productsData = await getAllProducts(vendor);
            setProducts(productsData);
            setFilteredProducts(productsData)
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
            setForm({ name: '', quantity: '', price: '', images: [], description: '', discount: '', category: '', vendor, availableLocalities: [], tags: [], isReturnAllowed: false })
            setVariations([{ attributes: { selected: '', value: '' }, price: '', discount: '', quantity: '', parentVariation: null }]);
            setPincodes([])
            setTags([])
            setIsAllSelected(false)
            setEditingProduct(null)
        }
        setModal(!modal)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm({ ...form, [name]: value })
    }

    const toggleReturn = () => {
        setForm({ ...form, isReturnAllowed: !form.isReturnAllowed })
    }

    const onDropProductImages = useCallback((acceptedFiles) => {

        // Update form state with the uploaded images
        setForm({ ...form, images: form.images.concat(acceptedFiles) });

    }, [form]);

    const { getRootProps: getRootPropsProduct, getInputProps: getInputPropsProduct } = useDropzone({
        onDrop: onDropProductImages,
        accept: 'image/*',
        multiple: true
    });





    const handleSubmit = async () => {
        try {
            dispatch(startLoading());

            const productData = {
                ...form,
                variations
            };

            console.log("productData-->>", productData)

            if (editingProduct !== null) {
                let res = await updateProduct(products[editingProduct]._id, productData);
                setAlertMessage(res?.message)
                setAlertVisible(true)
                await fetchProducts();
                dispatch(stopLoading());
            } else {
                let res = await createProduct(productData);
                console.log("res-->>", res)
                // alert(res?.message)
                setAlertMessage(res?.message)
                setAlertVisible(true)
                await fetchProducts();
                dispatch(stopLoading());
            }

            // Reset form fields and state after successful operation
            setForm({
                name: '',
                quantity: '',
                price: '',
                images: [],
                description: '',
                discount: '',
                category: '',
                vendor,
                availableLocalities: [],
                tags: [],
                isReturnAllowed: false
            });
            setVariations([{ attributes: { selected: '', value: '' }, price: '', discount: '', quantity: '', parentVariation: null }]);
            setPincodes([]);
            setTags([])
            setIsAllSelected(false);
            setEditingProduct(null);
            toggleModal();
        } catch (error) {
            dispatch(stopLoading());
            console.log("error-->>", error)
            alert(error?.response?.data?.message)

        }
    };



    const handleEdit = async (index, id) => {
        try {
            let singProduct = await getProductById(id);
            console.log("singProduct--->>", singProduct);
            setEditingProduct(index);

            // Set form state with product details
            setForm({
                name: singProduct.product.name,
                description: singProduct.product.description,
                images: singProduct.product.images,
                category: singProduct.product.category,
                vendor: singProduct.product.vendor,
                availableLocalities: singProduct.product.availableLocalities,
                tags: singProduct.product.tags,
                isReturnAllowed: singProduct.product.isReturnAllowed,
            });

            // Set variations state with product variations
            setVariations(singProduct.product.variations);

            setTags(singProduct.product.tags);


            // Check if all locations are selected
            if (singProduct.product.availableLocalities[0] === 'all') {
                setIsAllSelected(true);
            } else {
                setPincodes(singProduct.product.availableLocalities);
            }

            toggleModal();
        } catch (error) {
            console.error('Failed to fetch product details:', error);
        }
    };





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


const getProductVariants = (variations) => {
    return variations?.map(variation => `${variation.attributes.selected}: "${variation.attributes.value}"`).join('\n');
  };

  console.log("getProductVariants[0]-->>", getProductVariants(products[0]?.variations))


  const getVariantsPrice = (variations) => {
    return variations?.map(variation => `₹${variation.price}, `).join('\n');
  };

  const getVariantsQuantity = (variations) => {
    return variations?.map(variation => `${variation.quantity}, `).join('\n');
  };

  const getVariantsDiscount = (variations) => {
    return variations?.map(variation => `${variation.discount}, `).join('\n');
  };
  

    return (
        <div>
            {alertVisible && (
                <CAlert color={'success'} onClose={() => setAlertVisible(false)} dismissible>
                    {alertMessage}
                </CAlert>
            )}
            <h2>Manage Products</h2>
            <div className="mb-4">
                <CButton color="primary" onClick={toggleModal}>Add Product</CButton>
            </div>
            <SearchComponent
                items={products}
                searchKey="name"
                onFilteredItems={setFilteredProducts}
            />
            {isLoading ? <div className="spinner-container">
                <CSpinner size="sm" color="blue" />
            </div> : <div style={{ overflowX: 'auto' }}>
                <CTable striped>
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell>Photo</CTableHeaderCell>
                            <CTableHeaderCell>Name</CTableHeaderCell>
                            <CTableHeaderCell>Variants</CTableHeaderCell>
                            <CTableHeaderCell>Price</CTableHeaderCell>
                            <CTableHeaderCell>Quantity</CTableHeaderCell>
                            <CTableHeaderCell>Discount</CTableHeaderCell>
                            <CTableHeaderCell>Actions</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {filteredProducts.map((product, index) => (
                            <CTableRow key={index}>
                                <CTableDataCell>
                                    {product.images?.slice(0, 2).map((file, imgIndex) => (
                                        <img
                                            key={imgIndex}
                                            src={`${baseURL}/${file}`}
                                            alt={`Product Image ${imgIndex + 1}`}
                                            className="table-img"
                                        />
                                    ))}
                                </CTableDataCell>
                                <CTableDataCell>{product.name}</CTableDataCell>
                                <CTableDataCell>{getProductVariants(product.variations)}</CTableDataCell>
                                <CTableDataCell>{getVariantsPrice(product.variations)}</CTableDataCell>
                                <CTableDataCell>{getVariantsQuantity(product.variations)}</CTableDataCell>
                                <CTableDataCell>{getVariantsDiscount(product.variations)}</CTableDataCell>
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

            <CModal visible={modal} onClose={toggleModal} className="custom-modal">
                <CModalHeader>
                    <CModalTitle>{editingProduct !== null ? 'Edit Product' : 'Add Product'}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <CFormInput
                            name="name"
                            // label="Product Name"
                            placeholder='Product Name'
                            value={form.name}
                            onChange={handleChange}
                        />


                        <Tags tag={tag} tags={tags} setForm={setForm} setTag={setTag} setTags={setTags} form={form} />
                        <div style={{ marginBottom: '1rem' }}>
                            <CFormSwitch
                                label="Hand-to-Hand Return"
                                // id={`formSwitch-${form.name}`}
                                name='isReturnAllowed'
                                value={form.isReturnAllowed}
                                checked={form.isReturnAllowed}
                                onChange={toggleReturn}
                            />
                        </div>

                        <CFormInput
                            name="description"
                            // label="Product Description"
                            placeholder='Product Description'
                            value={form.description}
                            onChange={handleChange}
                        />

                        {/* Dropzone for multi-image upload */}
                        <div {...getRootPropsProduct()} className="upload-container">
                            <input {...getInputPropsProduct()} />
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
                        <div>
                            <CFormCheck
                                type="checkbox"
                                id="selectAll"
                                label="All Locations"
                                checked={isAllSelected}
                                onChange={handleAllChange}
                            />

                            {!isAllSelected && (
                                <>
                                    <CRow>
                                        <CCol xs={8}>
                                            <CFormInput
                                                type="text"
                                                value={pincode}
                                                onChange={(e) => setPincode(e.target.value)}
                                                placeholder="Enter pincode"
                                                disabled={isAllSelected}
                                            />
                                        </CCol>
                                        <CCol xs={4}>
                                            <CButton color="primary" onClick={handleAddPincode} disabled={isAllSelected}>
                                                Add Pincode
                                            </CButton>
                                        </CCol>
                                    </CRow>

                                    <div style={{ marginTop: '1rem' }}>
                                        {pincodes.map((code, index) => (
                                            <CBadge key={index} color="secondary" className="pincode-badge">
                                                {code}
                                                <CButton
                                                    color="danger"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleRemovePincode(code)}
                                                    style={{ marginLeft: '0.5rem' }}
                                                >
                                                    &times;
                                                </CButton>
                                            </CBadge>
                                        ))}
                                    </div>
                                </>
                            )}
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
                        {/* // Add input fields for variations */}
                        <VariationsComponent variations={variations} setVariations={setVariations} />
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
