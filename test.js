<div>
                            {variations.map((variation, index) => {
                                const { getRootProps, getInputProps } = useDropzone({
                                    onDrop: (acceptedFiles) => handleDropVariationImages(index, acceptedFiles),
                                    accept: 'image/*',
                                    multiple: true
                                });
                                return (
                                    <div key={index}>
                                        <div>
                                            <CFormCheck
                                                type="radio"
                                                id={`size-${index}`}
                                                name={`attribute-${index}`}
                                                label="Size"
                                                checked={variation.attributes.selected === 'size'}
                                                onChange={() => handleAttributeChange(index, 'size')}
                                            />
                                            <CFormCheck
                                                type="radio"
                                                id={`color-${index}`}
                                                name={`attribute-${index}`}
                                                label="Color"
                                                checked={variation.attributes.selected === 'color'}
                                                onChange={() => handleAttributeChange(index, 'color')}
                                            />
                                            <CFormCheck
                                                type="radio"
                                                id={`weight-${index}`}
                                                name={`attribute-${index}`}
                                                label="Weight"
                                                checked={variation.attributes.selected === 'weight'}
                                                onChange={() => handleAttributeChange(index, 'weight')}
                                            />
                                            <CFormCheck
                                                type="radio"
                                                id={`packet-${index}`}
                                                name={`attribute-${index}`}
                                                label="Packet"
                                                checked={variation.attributes.selected === 'packet'}
                                                onChange={() => handleAttributeChange(index, 'packet')}
                                            />
                                        </div>
                                        <div {...getRootProps()} className="upload-container">
                                            <input {...getInputProps()} />
                                            <CButton color="primary" variant="outline">
                                                <CIcon icon={cilCloudUpload} size="lg" className="me-2" />
                                                Upload Images
                                            </CButton>
                                        </div>


                                        {/* Display uploaded images for this variation */}
                                        <div className="actions-cell">
                                            {variation.images.map((imageObj, imgIndex) => (
                                                <div key={imgIndex} className="image-wrapper">
                                                    <img
                                                        className="img"
                                                        src={typeof imageObj.file === 'string' ? `${baseURL}/${imageObj.file}` : imageObj.preview}
                                                        alt={`Variation Image ${imgIndex + 1}`}
                                                    />
                                                    <button type="button" className="close-button" onClick={() => removeImageVariation(index, imgIndex)}>✖</button>
                                                </div>
                                            ))}
                                        </div>
                                        <CFormInput
                                            name="attributeValue"
                                            label="Attribute Value"
                                            value={variation.attributes.value}
                                            onChange={(e) => handleVariationChange(index, 'attributes', 'value', e.target.value)}
                                        />
                                        <CFormInput
                                            name="price"
                                            label="Price"
                                            value={variation.price}
                                            onChange={(e) => handleVariationChange(index, 'price', undefined, e.target.value)}
                                        />
                                        <CFormInput
                                            name="discount"
                                            label="Discount"
                                            value={variation.discount}
                                            onChange={(e) => handleVariationChange(index, 'discount', undefined, e.target.value)}
                                        />
                                        <CFormInput
                                            name="quantity"
                                            label="Quantity"
                                            value={variation.quantity}
                                            onChange={(e) => handleVariationChange(index, 'quantity', undefined, e.target.value)}
                                        />
                                        <CFormSelect
                                            name="parentVariation"
                                            label="Parent Variation"
                                            value={variation.parentVariation || ''}
                                            onChange={(e) => handleVariationChange(index, 'parentVariation', undefined, e.target.value)}
                                        >
                                            <option value="">None</option>
                                            {variations.map((v, i) => (
                                                <option key={i} value={v._id} disabled={i === index}>
                                                    {`Variation ${i + 1} - ${v.attributes.selected}: ${v.attributes.value}`}
                                                </option>
                                            ))}
                                        </CFormSelect>
                                        <CButton color="danger" onClick={() => removeVariation(index)}>Remove Variation</CButton>
                                    </div>
                                )
                            })}
                            <CButton color="primary" onClick={addVariation}>Add Variation</CButton>
                        </div>