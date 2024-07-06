import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../../../assets/brand/logo_long.png'; // adjust the path to your logo image

export const getFormattedDate = (dateTime) => {
    const createdAtDate = new Date(dateTime);
    const formattedCreatedDate = `${createdAtDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} ${createdAtDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    return formattedCreatedDate

}


export const handleDownloadInvoice = (order) => {
    const doc = new jsPDF();
    doc.page = 1;

    // Function to format address
    const formatAddress = (address) => {
        return `${address.address}\n${address.city}, ${address.state} - ${address.postalCode}\n${address.country}`;
    };

    // Calculate the total amount
    const totalAmount = order.vendors.products.reduce((total, product) => {
        const totalAmount = product.totalAmount;
        return total + totalAmount;
    }, 0).toFixed(2);

    const finalTotal = (parseFloat(totalAmount) + 20).toFixed(2);

    // Use the Unicode character for the Rupee symbol
    const rupeeSymbol = 'INR';

    doc.autoTable({
        body: [
            [
                {
                    content: 'Order Invoice',
                    styles: {
                        halign: 'left',
                        fontSize: 20,
                        fontStyle: 'bold'
                    }
                },
                {
                    content: '', // Empty content for the logo cell
                    styles: {
                        halign: 'right'
                    }
                }
            ],
        ],
        theme: 'plain',
        didDrawCell: function (data) {
            if (data.column.index === 1 && data.row.index === 0) {
                const imgWidth = 30; // width of the logo
                const imgHeight = 10; // height of the logo
                const xPos = data.cell.x + data.cell.width - imgWidth;
                const yPos = data.cell.y + (data.cell.height - imgHeight) / 2;
                doc.addImage(logo, 'PNG', xPos, yPos, imgWidth, imgHeight);
            }
        }
    });

    doc.autoTable({
        body: [
            [
                {
                    content: `Invoice: #${order.shortId}`
                        + `\nDate: ${getFormattedDate(order.createdAt)}`
                        + `\nShop Name: ${order.vendors?.vendor?.businessName}`,
                    styles: {
                        halign: 'right',
                        fontStyle: 'bold'
                    }
                }
            ],
        ],
        theme: 'plain'
    });

    // Shipping to and Billing address sections
    const shippingAddress = formatAddress(order.shippingAddress);
    const billingAddress = formatAddress(order.billingAddress || order.shippingAddress); // Default to shipping if billing address not provided

    doc.autoTable({
        body: [
            [
                {
                    content: 'Shipping to:',
                    styles: {
                        halign: 'left',
                        fontStyle: 'bold',
                        fontSize: 12,
                        cellPadding: { top: 2, right: 5, bottom: 0, left: 5 }
                    }
                },
                {
                    content: 'Billing address:',
                    styles: {
                        halign: 'right',
                        fontStyle: 'bold',
                        fontSize: 12,
                        cellPadding: { top: 2, right: 5, bottom: 0, left: 5 }
                    }
                },
            ],
            [
                {
                    content: shippingAddress,
                    styles: {
                        halign: 'left',
                        fontSize: 10,
                        cellPadding: { top: 0, right: 5, bottom: 0, left: 5 },
                        lineHeight: 1.2
                    }
                },
                {
                    content: billingAddress,
                    styles: {
                        halign: 'right',
                        fontSize: 10,
                        cellPadding: { top: 0, right: 5, bottom: 0, left: 5 },
                        lineHeight: 1.2
                    }
                },
            ],
        ],
        theme: 'plain',
        styles: {
            cellPadding: { top: 2, right: 5, bottom: 0, left: 5 },
        },
        margin: { top: 10, right: 10, bottom: 0, left: 10 },
    });

    const items = order.vendors.products.map((product) => {
        const actualPrice = product.price;
        const discountPercentage = product.discount;
        const discountAmount = (actualPrice * discountPercentage) / 100;
        const discountedPrice = (actualPrice - discountAmount) * product.quantity;
        const paymentStatus = order.paymentStatus;

        return [
            product.product.name,  // Replace with actual category if available
            product.quantity,
            `${discountPercentage} %`,
            `${rupeeSymbol} ${actualPrice.toFixed(2)}`,
            `${rupeeSymbol} ${discountedPrice.toFixed(2)}`,
            paymentStatus
        ];
    });

    doc.autoTable({
        head: [['Items', 'Quantity', 'Discount', 'Price', 'Amount', 'Status']],
        body: items,
        theme: 'striped',
        headStyles: {
            fillColor: '#0066b2'
        }
    });

    doc.autoTable({
        body: [
            [
                {
                    content: 'Subtotal:',
                    styles: {
                        halign: 'right',
                        fontStyle: 'bold'
                    }
                },
                {
                    content: `${rupeeSymbol} ${totalAmount}`,
                    styles: {
                        halign: 'right',
                        fontStyle: 'bold'
                    }
                },
            ],
            [
                {
                    content: 'Delivery charge:',
                    styles: {
                        halign: 'right',
                        fontStyle: 'bold'
                    }
                },
                {
                    content: `${rupeeSymbol} 20`,
                    styles: {
                        halign: 'right',
                        fontStyle: 'bold'
                    }
                },
            ],
            [
                {
                    content: 'Total amount:',
                    styles: {
                        halign: 'right',
                        fontStyle: 'bold'
                    }
                },
                {
                    content: `${rupeeSymbol} ${finalTotal}`,
                    styles: {
                        halign: 'right',
                        fontStyle: 'bold'
                    }
                },
            ],
        ],
        theme: 'plain'
    });

    // doc.autoTable({
    //     body: [
    //         [
    //             {
    //                 content: 'If you require any assistance or have feedback or suggestions about our site you can email us at (sevabazar.com@gmail.com)',
    //                 styles: {
    //                     halign: 'left'
    //                 }
    //             }
    //         ],
    //     ],
    //     theme: 'plain',
    //     startY: doc.autoTable.previous.finalY  // Start from where the previous table ended plus some margin
    // });

    const footer = (data) => {
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const footerContent = 'Phone : 8809959154\nEmail : sevabazar.com@gmail.com\nAll Copyright Reserved © 2024 Seva Bazar';

        // Set background color
        doc.setFillColor('#dddddd');
        // Draw rectangle for the footer background
        const footerRectWidth = doc.internal.pageSize.width - 2 * data.settings.margin.left;
        const footerRectHeight = 30;
        const footerRectX = data.settings.margin.left;
        const footerRectY = pageHeight - 50;
        doc.rect(footerRectX, footerRectY, footerRectWidth, footerRectHeight, 'F');

        // Set text color and font
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);

        // Calculate text width and height
        const textWidth = doc.getStringUnitWidth(footerContent) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const textHeight = doc.internal.getLineHeight();

        // Calculate positions for centering text
        const textX = footerRectX + (footerRectWidth - textWidth) / 2;
        const textY = footerRectY + (footerRectHeight - textHeight - 5) / 2 + textHeight / 2; // Adjusted for vertical centering

        // Add footer text
        doc.text(footerContent, textX, textY);
    };

    // Call footer function at the end of each page
    doc.autoTable({
        body: [],
        theme: 'plain',
        margin: { top: 10, bottom: 30 }, // Provide some bottom margin for the footer
        didDrawPage: footer // Call the footer function at the end of each page
    });


    doc.save(`invoice_${order.shortId}.pdf`);
};

export const handleDownloadChatInvoice = (order) => {
    const doc = new jsPDF();

    // Function to format address
    const formatAddress = (address) => {
        return `${address.address}\n${address.city}, ${address.state} - ${address.postalCode}\n${address.country}`;
    };

    const totalAmount = (20).toFixed(2); // Assuming there is a delivery charge of 20
    const finalTotal = (parseFloat(order.totalAmount) + 20).toFixed(2);
    const rupeeSymbol = '\u20B9';

    doc.autoTable({
        body: [
            [
                {
                    content: 'Order Invoice',
                    styles: {
                        halign: 'left',
                        fontSize: 20,
                        fontStyle: 'bold'
                    }
                },
                {
                    content: '', // Empty content for the logo cell
                    styles: {
                        halign: 'right'
                    }
                }
            ],
        ],
        theme: 'plain',
        didDrawCell: function (data) {
            if (data.column.index === 1 && data.row.index === 0) {
                const imgWidth = 30; // width of the logo
                const imgHeight = 10; // height of the logo
                const xPos = data.cell.x + data.cell.width - imgWidth;
                const yPos = data.cell.y + (data.cell.height - imgHeight) / 2;
                doc.addImage(logo, 'PNG', xPos, yPos, imgWidth, imgHeight);
            }
        }
    });

    doc.autoTable({
        body: [
            [
                {
                    content: `Invoice: #${order.shortId}`
                        + `\nDate: ${getFormattedDate(order.createdAt)}`
                        + `\nShop Name: ${order.vendors?.vendor?.businessName}`,
                    styles: {
                        halign: 'right',
                        fontStyle: 'bold'
                    }
                }
            ],
        ],
        theme: 'plain'
    });

    // Shipping to and Billing address sections
    const shippingAddress = formatAddress(order.shippingAddress);
    const billingAddress = formatAddress(order.billingAddress || order.shippingAddress); // Default to shipping if billing address not provided

    doc.autoTable({
        body: [
            [
                {
                    content: 'Shipping to:',
                    styles: {
                        halign: 'left',
                        fontStyle: 'bold',
                        fontSize: 12,
                        cellPadding: { top: 2, right: 5, bottom: 0, left: 5 }
                    }
                },
                {
                    content: 'Billing address:',
                    styles: {
                        halign: 'right',
                        fontStyle: 'bold',
                        fontSize: 12,
                        cellPadding: { top: 2, right: 5, bottom: 0, left: 5 }
                    }
                },
            ],
            [
                {
                    content: shippingAddress,
                    styles: {
                        halign: 'left',
                        fontSize: 10,
                        cellPadding: { top: 0, right: 5, bottom: 0, left: 5 },
                        lineHeight: 1.2
                    }
                },
                {
                    content: billingAddress,
                    styles: {
                        halign: 'right',
                        fontSize: 10,
                        cellPadding: { top: 0, right: 5, bottom: 0, left: 5 },
                        lineHeight: 1.2
                    }
                },
            ],
        ],
        theme: 'plain',
        styles: {
            cellPadding: { top: 2, right: 5, bottom: 0, left: 5 },
        },
        margin: { top: 10, right: 10, bottom: 0, left: 10 },
    });



    doc.autoTable({
        head: [['Items', 'Price', 'Status']],
        body: [
            [`${order.orderMessage}`, `rs ${order.totalAmount}`, order.paymentStatus],
        ],
        theme: 'striped',
        headStyles: { fillColor: '#0066b2' }
    });

    doc.autoTable({
        body: [
            [
                { content: 'Subtotal:', styles: { halign: 'right', fontStyle: 'bold', } },
                { content: `rs ${order.totalAmount}`, styles: { halign: 'right', fontStyle: 'bold', } },
            ],
            [
                { content: 'Delivery charge:', styles: { halign: 'right', fontStyle: 'bold', } },
                { content: `rs 20`, styles: { halign: 'right', fontStyle: 'bold', } },
            ],
            [
                { content: 'Total amount:', styles: { halign: 'right', fontStyle: 'bold', } },
                { content: `rs ${finalTotal}`, styles: { halign: 'right', fontStyle: 'bold', } },
            ],
        ],
        theme: 'plain'
    });

    // doc.autoTable({
    //     body: [
    //         [
    //             {
    //                 content: 'If you require any assistance or have feedback or suggestions about our site you can email us at (sevabazar.com@gmail.com)',
    //                 styles: {
    //                     halign: 'left'
    //                 }
    //             }
    //         ],
    //     ],
    //     theme: 'plain',
    //     startY: doc.autoTable.previous.finalY + 120 // Start from where the previous table ended plus some margin
    // });

    // doc.autoTable({
    //     body: [
    //         [
    //             {
    //                 content: 'Phone : 8809959154\nEmail : sevabazar.com@gmail.com\nAll Copyright Reserved © 2024 Seva Bazar',
    //                 styles: {
    //                     halign: 'center',
    //                     fillColor: '#dddddd', // Grey background color
    //                     valign: 'middle' // Vertically centered text
    //                 }
    //             }
    //         ],
    //     ],
    //     theme: 'plain'
    // });

    const footer = (data) => {
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const footerContent = 'Phone : 8809959154\nEmail : sevabazar.com@gmail.com\nAll Copyright Reserved © 2024 Seva Bazar';

        // Set background color
        doc.setFillColor('#dddddd');
        // Draw rectangle for the footer background
        const footerRectWidth = doc.internal.pageSize.width - 2 * data.settings.margin.left;
        const footerRectHeight = 30;
        const footerRectX = data.settings.margin.left;
        const footerRectY = pageHeight - 50;
        doc.rect(footerRectX, footerRectY, footerRectWidth, footerRectHeight, 'F');

        // Set text color and font
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);

        // Calculate text width and height
        const textWidth = doc.getStringUnitWidth(footerContent) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const textHeight = doc.internal.getLineHeight();

        // Calculate positions for centering text
        const textX = footerRectX + (footerRectWidth - textWidth) / 2;
        const textY = footerRectY + (footerRectHeight - textHeight - 5) / 2 + textHeight / 2; // Adjusted for vertical centering

        // Add footer text
        doc.text(footerContent, textX, textY);
    };

    // Call footer function at the end of each page
    doc.autoTable({
        body: [],
        theme: 'plain',
        margin: { top: 10, bottom: 30 }, // Provide some bottom margin for the footer
        didDrawPage: footer // Call the footer function at the end of each page
    });


    doc.save(`invoice_${order.shortId}.pdf`);
};






