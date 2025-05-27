import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CartItem } from '@/types/cart';
import { COMPANY_INFO, BANK_INFO } from '@/constants';

// Font data
const ROBOTO_NORMAL = 'https://raw.githubusercontent.com/googlefonts/roboto/main/src/hinted/Roboto-Regular.ttf';
const ROBOTO_MEDIUM = 'https://raw.githubusercontent.com/googlefonts/roboto/main/src/hinted/Roboto-Medium.ttf';

// Bank ID mapping for VietQR
const BANK_ID_MAPPING: { [key: string]: string } = {
  'MB Bank': 'MB'
};

interface BuyerInfo {
  fullName: string;
  phone: string;
  email?: string;
}

interface PDFGeneratorProps {
  cartItems: CartItem[];
  totalPrice: number;
  shipping: number;
  buyerInfo: BuyerInfo;
  preview?: boolean;
}

// Extended jsPDF type with lastAutoTable
interface ExtendedJsPDF extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

// Function to generate VietQR URL
const generateVietQRUrl = (
  bankId: string,
  accountNo: string,
  amount: number,
  description: string,
  accountName: string
) => {
  const encodedDesc = encodeURIComponent(description);
  const encodedName = encodeURIComponent(accountName);
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodedDesc}&accountName=${encodedName}`;
};

export const generatePDF = async ({ cartItems, totalPrice, shipping, buyerInfo, preview = false }: PDFGeneratorProps) => {
  try {
    // Load fonts
    const [normalFontBytes, mediumFontBytes] = await Promise.all([
      fetch(ROBOTO_NORMAL).then(res => res.arrayBuffer()),
      fetch(ROBOTO_MEDIUM).then(res => res.arrayBuffer())
    ]);

    // Create new document with smaller margins
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true
    }) as ExtendedJsPDF;

    // Add fonts
    doc.addFileToVFS('Roboto-Regular.ttf', Buffer.from(normalFontBytes).toString('base64'));
    doc.addFileToVFS('Roboto-Medium.ttf', Buffer.from(mediumFontBytes).toString('base64'));
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.addFont('Roboto-Medium.ttf', 'Roboto', 'bold');
    doc.setFont('Roboto');

    // Template styles
    const styles = {
      headerCell: {
        fillColor: [220, 38, 38] as [number, number, number],
        textColor: 255,
        fontStyle: 'bold' as const,
        fontSize: 10,
        font: 'Roboto',
        halign: 'center' as const
      },
      cell: {
        fontSize: 10,
        font: 'Roboto',
        halign: 'left' as const
      }
    };

    const margin = {
      left: 15,
      right: 15,
      top: 15
    };

    // Add header with logo and company info
    doc.setFillColor(248, 248, 248);
    doc.rect(0, 0, 210, 50, 'F');


    // Add company info in header
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(COMPANY_INFO.name, margin.left, 15);
    doc.text(`Địa chỉ: ${COMPANY_INFO.address}`, margin.left, 20);
    doc.text(`Điện thoại: ${COMPANY_INFO.hotline} | Email: ${COMPANY_INFO.email}`, margin.left, 25);
    doc.text(`Website: ${COMPANY_INFO.website} | Giờ làm việc: ${COMPANY_INFO.workingHours}`, margin.left, 30);

    // Add main title
    doc.setFontSize(24);
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text('ĐƠN HÀNG MUA', 105, 45, { align: 'center' });

    // Reset text color to black
    doc.setTextColor(0);
    
    // Add date and invoice number
    doc.setFontSize(10);
    const today = new Date().toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    // Format date for invoice number (ddMM)
    const dateForInvoice = new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit'
    }).replace('/', '');
    
    const invoiceNumber = `${buyerInfo.phone}-${dateForInvoice}`;

    // Add invoice details in a box
    doc.setFillColor(248, 248, 248);
    doc.rect(margin.left, 55, 180, 20, 'F');
    doc.setFont('Roboto', 'normal');
    doc.text(`Ngày: ${today}`, margin.left + 5, 65);
    doc.text(`Số hóa đơn: ${invoiceNumber}`, margin.left + 100, 65);

    // Add buyer info and payment info in two columns
    const colWidth = 85;
    const startY = 85;

    // Buyer info box
    doc.setFillColor(248, 248, 248);
    doc.rect(margin.left, startY, colWidth, 45, 'F');
    doc.setFont('Roboto', 'bold');
    doc.text('THÔNG TIN NGƯỜI MUA:', margin.left + 5, startY + 7);
    doc.setFont('Roboto', 'normal');
    doc.text(`Họ tên: ${buyerInfo.fullName}`, margin.left + 5, startY + 17);
    doc.text(`Điện thoại: ${buyerInfo.phone}`, margin.left + 5, startY + 27);
    if (buyerInfo.email) {
      doc.text(`Email: ${buyerInfo.email}`, margin.left + 5, startY + 37);
    }

    // Payment info box
    doc.setFillColor(248, 248, 248);
    doc.rect(margin.left + colWidth + 10, startY, colWidth, 45, 'F');
    doc.setFont('Roboto', 'bold');
    doc.text('THÔNG TIN THANH TOÁN:', margin.left + colWidth + 15, startY + 7);
    doc.setFont('Roboto', 'normal');
    doc.text(`Tên TK: ${BANK_INFO.accountName}`, margin.left + colWidth + 15, startY + 17);
    doc.text(`STK: ${BANK_INFO.accountNumber}`, margin.left + colWidth + 15, startY + 27);
    doc.text(`Ngân hàng: ${BANK_INFO.bankName}`, margin.left + colWidth + 15, startY + 37);

    // Add items table with adjusted width
    const tableWidth = 210 - margin.left - margin.right;
    autoTable(doc, {
      head: [['STT', 'Sản phẩm', 'SL', 'Đơn giá', 'Thành tiền']],
      body: cartItems.map((item, index) => [
        (index + 1).toString(),
        item.name,
        item.quantity.toString(),
        `${item.price.toLocaleString()}đ`,
        `${(item.price * item.quantity).toLocaleString()}đ`
      ]),
      startY: startY + 55,
      theme: 'grid',
      headStyles: styles.headerCell,
      styles: {
        ...styles.cell,
        font: 'Roboto',
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: tableWidth * 0.08, halign: 'center' },
        1: { cellWidth: tableWidth * 0.42 },
        2: { cellWidth: tableWidth * 0.1, halign: 'center' },
        3: { cellWidth: tableWidth * 0.2, halign: 'right' },
        4: { cellWidth: tableWidth * 0.2, halign: 'right' }
      },
      margin: { left: margin.left, right: margin.right }
    });

    // Get the last position of the table
    const finalY = doc.lastAutoTable.finalY || (startY + 55);

    // Add summary with styled box
    const summaryWidth = 80;
    doc.setFillColor(248, 248, 248);
    doc.rect(210 - margin.right - summaryWidth, finalY + 10, summaryWidth, 40, 'F');
    
    const total = totalPrice + shipping;
    const summaryX = 210 - margin.right - summaryWidth + 5;
    
    doc.setFontSize(10);
    doc.text('Tổng tiền hàng:', summaryX, finalY + 20);
    doc.text(`${totalPrice.toLocaleString()}đ`, 210 - margin.right - 5, finalY + 20, { align: 'right' });
    
    doc.text('Phí vận chuyển:', summaryX, finalY + 30);
    doc.text(`${shipping.toLocaleString()}đ`, 210 - margin.right - 5, finalY + 30, { align: 'right' });
    
    doc.setFontSize(12);
    doc.setFont('Roboto', 'bold');
    doc.text('Tổng thanh toán:', summaryX, finalY + 40);
    doc.text(`${total.toLocaleString()}đ`, 210 - margin.right - 5, finalY + 40, { align: 'right' });

    // Add QR code
    const bankId = BANK_ID_MAPPING[BANK_INFO.bankName];
    if (!bankId) {
      throw new Error('Unsupported bank for QR code generation');
    }

    const qrDescription = `G3TECH-${invoiceNumber}`;
    const qrUrl = generateVietQRUrl(
      bankId,
      BANK_INFO.accountNumber,
      total,
      qrDescription,
      BANK_INFO.accountName
    );

    // Fetch QR code image
    const qrResponse = await fetch(qrUrl);
    const qrBlob = await qrResponse.blob();
    const qrBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(qrBlob);
    });

    // Add QR code to PDF
    doc.addImage(qrBase64, 'PNG', margin.left, finalY + 10, 40, 40);
    doc.setFontSize(8);
    doc.text('Quét mã QR để thanh toán', margin.left + 20, finalY + 55, { align: 'center' });

    // Add footer
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text('Cảm ơn quý khách đã mua hàng!', 105, finalY + 70, { align: 'center' });
    
    // Save or preview the PDF based on the preview flag
    const safeCustomerName = buyerInfo.fullName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    
    if (preview) {
      // Open PDF in a new tab for preview
      const pdfDataUri = doc.output('datauristring');
      window.open(pdfDataUri, '_blank');
    } else {
      // Save the PDF as before
      doc.save(`${safeCustomerName}-${invoiceNumber}.pdf`);
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại sau.');
  }
}; 