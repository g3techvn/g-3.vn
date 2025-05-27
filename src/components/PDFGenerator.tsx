import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CartItem } from '@/types/cart';
import { COMPANY_INFO } from '@/constants';

// Font data
const ROBOTO_NORMAL = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
const ROBOTO_BOLD = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf';

interface PDFGeneratorProps {
  cartItems: CartItem[];
  totalPrice: number;
  shipping: number;
}

// Extended jsPDF type with lastAutoTable
interface ExtendedJsPDF extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

export const generatePDF = async ({ cartItems, totalPrice, shipping }: PDFGeneratorProps) => {
  try {
    // Load fonts
    const [normalFontBytes, boldFontBytes] = await Promise.all([
      fetch(ROBOTO_NORMAL).then(res => res.arrayBuffer()),
      fetch(ROBOTO_BOLD).then(res => res.arrayBuffer())
    ]);

    // Create new document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true
    }) as ExtendedJsPDF;

    // Add fonts
    doc.addFileToVFS('Roboto-Regular.ttf', Buffer.from(normalFontBytes).toString('base64'));
    doc.addFileToVFS('Roboto-Bold.ttf', Buffer.from(boldFontBytes).toString('base64'));
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
    doc.setFont('Roboto');

    // Template styles
    const styles = {
      headerCell: {
        fillColor: [220, 38, 38] as [number, number, number],
        textColor: 255,
        fontStyle: 'bold' as const,
        fontSize: 10,
        halign: 'center' as const
      },
      cell: {
        fontSize: 10,
        halign: 'left' as const
      }
    };

    // Add logo and header
    doc.setFillColor(220, 38, 38);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Add white text for header
    doc.setTextColor(255);
    doc.setFontSize(24);
    doc.text('G3-TECH', 20, 20);
    doc.setFontSize(12);
    doc.text('HÓA ĐƠN MUA HÀNG', 20, 30);

    // Reset text color to black
    doc.setTextColor(0);
    
    // Add date and invoice number
    doc.setFontSize(10);
    const today = new Date().toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const invoiceNumber = `HD${Date.now().toString().slice(-8)}`;
    doc.text(`Ngày: ${today}`, 20, 50);
    doc.text(`Số hóa đơn: ${invoiceNumber}`, 20, 57);

    // Add company info
    doc.setFontSize(10);
    doc.text(COMPANY_INFO.name, 20, 67);
    doc.text(`Địa chỉ: ${COMPANY_INFO.address}`, 20, 74);
    doc.text(`Điện thoại: ${COMPANY_INFO.hotline}`, 20, 81);
    doc.text(`Email: ${COMPANY_INFO.email}`, 20, 88);
    doc.text(`Website: ${COMPANY_INFO.website}`, 20, 95);
    doc.text(`Giờ làm việc: ${COMPANY_INFO.workingHours}`, 20, 102);

    // Line separator
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.5);
    doc.line(20, 110, 190, 110);

    // Prepare table data
    const tableData = cartItems.map((item, index) => [
      (index + 1).toString(),
      item.name,
      item.quantity.toString(),
      `${item.price.toLocaleString()}đ`,
      `${(item.price * item.quantity).toLocaleString()}đ`
    ]);

    // Add items table
    autoTable(doc, {
      head: [['STT', 'Sản phẩm', 'Số lượng', 'Đơn giá', 'Thành tiền']],
      body: tableData,
      startY: 115,
      theme: 'grid',
      headStyles: styles.headerCell,
      styles: {
        ...styles.cell,
        font: 'Roboto'
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 65 },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 40, halign: 'right' },
        4: { cellWidth: 40, halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    });

    // Get the last position of the table
    const finalY = doc.lastAutoTable.finalY || 115;

    // Add summary with styled box
    doc.setDrawColor(220, 38, 38);
    doc.setFillColor(248, 248, 248);
    doc.rect(120, finalY + 10, 70, 40, 'F');
    
    const total = totalPrice + shipping;
    
    doc.setFontSize(10);
    doc.text(`Tổng tiền hàng:`, 125, finalY + 20);
    doc.text(`${totalPrice.toLocaleString()}đ`, 185, finalY + 20, { align: 'right' });
    
    doc.text(`Phí vận chuyển:`, 125, finalY + 30);
    doc.text(`${shipping.toLocaleString()}đ`, 185, finalY + 30, { align: 'right' });
    
    doc.setFontSize(12);
    doc.setFont('Roboto', 'bold');
    doc.text(`Tổng thanh toán:`, 125, finalY + 40);
    doc.text(`${total.toLocaleString()}đ`, 185, finalY + 40, { align: 'right' });

    // Add footer
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(10);
    doc.text('Cảm ơn quý khách đã mua hàng!', 105, finalY + 60, { align: 'center' });
    
    // Add QR code placeholder
    doc.setDrawColor(0);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(20, finalY + 10, 40, 40, 3, 3, 'FD');
    doc.setFontSize(8);
    doc.text('Mã QR', 40, finalY + 30, { align: 'center' });
    doc.text('Thanh toán', 40, finalY + 35, { align: 'center' });

    // Save the PDF
    doc.save('hoa-don-g3tech.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại sau.');
  }
}; 