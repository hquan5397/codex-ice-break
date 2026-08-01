import type { jsPDF as JsPdfType } from 'jspdf';
import { Bike } from './api';

type StoreInfo = {
  name: string;
  phone: string;
  address: string;
};

export type ContractData = {
  buyerName: string;
  buyerPhone: string;
  buyerId: string;
  buyerAddress: string;
  frameNumber: string;
  engineNumber: string;
  paymentMethod: string;
  contractDate: string;
};

const pageMargin = 18;
const lineHeight = 8;

export async function downloadBikePdf(bike: Bike, store: StoreInfo) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF();
  const today = new Date().toLocaleDateString();
  const filename = `${slugify(bike.title)}.pdf`;
  const imageUrls = bike.imageUrls?.length ? bike.imageUrls : [bike.imageUrl];
  const images = (await Promise.all(imageUrls.slice(0, 4).map((imageUrl) => getImageDataUrl(imageUrl)))).filter(Boolean) as string[];

  let y = 20;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text(store.name, pageMargin, y);

  y += 10;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  y = writeLine(pdf, `Phone: ${store.phone}`, y);
  y = writeLine(pdf, `Address: ${store.address}`, y);

  y += 8;
  pdf.setDrawColor(210, 216, 211);
  pdf.line(pageMargin, y, 192, y);

  y += 14;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(17);
  y = writeWrappedText(pdf, bike.title, y, 174);

  y += 2;
  pdf.setTextColor(217, 47, 28);
  pdf.setFontSize(15);
  y = writeLine(pdf, formatPdfPrice(bike.price), y);
  pdf.setTextColor(23, 33, 29);

  if (images.length > 0) {
    y += 4;
    y = addBikeImage(pdf, images[0], y);
    if (images.length > 1) {
      y += 5;
      y = addImageGallery(pdf, images.slice(1), y);
    }
  } else {
    y += 4;
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(10);
    pdf.setTextColor(95, 109, 102);
    y = writeLine(pdf, 'Image could not be embedded in this PDF.', y);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(23, 33, 29);
  }

  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);

  const details = [
    ['Brand', bike.brand],
    ['Model', bike.model],
    ['Year', bike.year?.toString()],
    ['Mileage', bike.mileage !== undefined && bike.mileage !== null ? `${bike.mileage.toLocaleString()} km` : undefined],
  ];

  details.forEach(([label, value]) => {
    if (value) {
      y = writeLine(pdf, `${label}: ${value}`, y);
    }
  });

  if (bike.description) {
    y += 5;
    pdf.setFont('helvetica', 'bold');
    y = writeLine(pdf, 'Description', y);
    pdf.setFont('helvetica', 'normal');
    y = writeWrappedText(pdf, bike.description, y, 174);
  }

  y = ensureSpace(pdf, y, 24);
  y += 10;
  pdf.setDrawColor(210, 216, 211);
  pdf.line(pageMargin, y, 192, y);

  y += 10;
  pdf.setFontSize(10);
  pdf.setTextColor(95, 109, 102);
  y = writeLine(pdf, `Generated: ${today}`, y);
  writeWrappedText(pdf, 'Please call the store to confirm availability and latest price.', y, 174);

  pdf.save(filename);
}

function addImageGallery(pdf: JsPdfType, images: string[], y: number) {
  const imageWidth = 54;
  const imageHeight = 38;
  const gap = 6;
  y = ensureSpace(pdf, y, imageHeight + 8);

  images.forEach((image, index) => {
    const x = pageMargin + index * (imageWidth + gap);
    try {
      pdf.addImage(image, getImageType(image), x, y, imageWidth, imageHeight);
    } catch {
      // Keep exporting the rest of the PDF if a gallery image cannot be embedded.
    }
  });

  return y + imageHeight;
}

function writeLine(pdf: JsPdfType, text: string, y: number) {
  pdf.text(text, pageMargin, y);
  return y + lineHeight;
}

function writeWrappedText(pdf: JsPdfType, text: string, y: number, maxWidth: number) {
  const lines = pdf.splitTextToSize(text, maxWidth);
  lines.forEach((line: string) => {
    y = ensureSpace(pdf, y, lineHeight);
    pdf.text(line, pageMargin, y);
    y += lineHeight;
  });
  return y;
}

function ensureSpace(pdf: JsPdfType, y: number, neededSpace: number) {
  if (y + neededSpace <= 282) {
    return y;
  }

  pdf.addPage();
  return 20;
}

function addBikeImage(pdf: JsPdfType, image: string, y: number) {
  const imageWidth = 174;
  const imageHeight = 98;
  y = ensureSpace(pdf, y, imageHeight + 8);
  const imageType = getImageType(image);

  try {
    pdf.addImage(image, imageType, pageMargin, y, imageWidth, imageHeight);
    return y + imageHeight;
  } catch {
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(10);
    pdf.setTextColor(95, 109, 102);
    const nextY = writeLine(pdf, 'Image could not be embedded in this PDF.', y);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(23, 33, 29);
    return nextY;
  }
}

async function getImageDataUrl(imageUrl: string): Promise<string | undefined> {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return undefined;
    }

    const blob = await response.blob();
    const dataUrl = await blobToDataUrl(blob);
    return await imageDataUrlToJpeg(dataUrl);
  } catch {
    return undefined;
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function getImageType(_dataUrl: string) {
  return 'JPEG';
}

function imageDataUrlToJpeg(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Could not create canvas context'));
        return;
      }

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    image.onerror = () => reject(new Error('Could not load bike image'));
    image.src = dataUrl;
  });
}

function formatPdfPrice(price: string) {
  const amount = new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(Number(price));

  return `${amount} VND`;
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'bike-listing';
}

export async function downloadContractPdf(bike: Bike, contract: ContractData, store: StoreInfo) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF();
  const filename = `contract-${slugify(bike.title)}.pdf`;
  const colLeft = pageMargin;
  const colRight = 110;

  const displayDate = contract.contractDate
    ? new Date(`${contract.contractDate}T00:00:00`).toLocaleDateString()
    : new Date().toLocaleDateString();

  let y = 20;

  // Store header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.text(store.name, colLeft, y);
  y += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  y = writeLine(pdf, `Phone: ${store.phone}  |  Address: ${store.address}`, y);

  y += 4;
  pdf.setDrawColor(210, 216, 211);
  pdf.line(colLeft, y, 192, y);
  y += 12;

  // Contract title — centered
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  const titleText = 'VEHICLE SALE CONTRACT';
  pdf.text(titleText, 105, y, { align: 'center' });
  y += 8;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text('Hop Dong Mua Ban Xe May', 105, y, { align: 'center' });
  y += 10;

  pdf.setFontSize(11);
  y = writeLine(pdf, `Date: ${displayDate}`, y);
  y += 6;

  pdf.setDrawColor(210, 216, 211);
  pdf.line(colLeft, y, 192, y);
  y += 10;

  // Seller
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  y = writeLine(pdf, 'SELLER', y);
  pdf.setFont('helvetica', 'normal');
  y = writeLine(pdf, store.name, y);
  y = writeLine(pdf, `Phone: ${store.phone}`, y);
  y = writeLine(pdf, `Address: ${store.address}`, y);
  y += 6;

  // Buyer
  pdf.setFont('helvetica', 'bold');
  y = writeLine(pdf, 'BUYER', y);
  pdf.setFont('helvetica', 'normal');
  y = writeLine(pdf, `Name: ${contract.buyerName || '___________________________'}`, y);
  y = writeLine(pdf, `Phone: ${contract.buyerPhone || '___________________________'}`, y);
  y = writeLine(pdf, `ID / Passport: ${contract.buyerId || '___________________________'}`, y);
  y = writeLine(pdf, `Address: ${contract.buyerAddress || '___________________________'}`, y);
  y += 6;

  // Vehicle details
  pdf.setFont('helvetica', 'bold');
  y = writeLine(pdf, 'VEHICLE DETAILS', y);
  pdf.setFont('helvetica', 'normal');
  y = writeWrappedText(pdf, bike.title, y, 174);

  const vehicleMeta = [bike.brand, bike.model, bike.year?.toString()].filter(Boolean).join(' / ');
  if (vehicleMeta) {
    y = writeLine(pdf, vehicleMeta, y);
  }

  if (bike.mileage !== undefined && bike.mileage !== null) {
    y = writeLine(pdf, `Mileage: ${bike.mileage.toLocaleString()} km`, y);
  }

  y = writeLine(pdf, `Frame No.: ${contract.frameNumber || '___________________________'}`, y);
  y = writeLine(pdf, `Engine No.: ${contract.engineNumber || '___________________________'}`, y);
  y += 6;

  // Sale price
  pdf.setFont('helvetica', 'bold');
  y = writeLine(pdf, 'SALE PRICE', y);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(217, 47, 28);
  y = writeLine(pdf, formatPdfPrice(bike.price), y);
  pdf.setTextColor(23, 33, 29);
  y = writeLine(pdf, `Payment method: ${contract.paymentMethod || 'Cash'}`, y);
  y += 6;

  // Terms
  pdf.setFont('helvetica', 'bold');
  y = writeLine(pdf, 'TERMS', y);
  pdf.setFont('helvetica', 'normal');
  y = writeWrappedText(
    pdf,
    'The seller agrees to transfer full ownership of the above vehicle to the buyer upon receipt of full payment. The buyer accepts the vehicle in its current condition.',
    y,
    174,
  );
  y += 10;

  // Signature block
  y = ensureSpace(pdf, y, 60);
  pdf.setDrawColor(210, 216, 211);
  pdf.line(colLeft, y, 192, y);
  y += 10;

  pdf.setFont('helvetica', 'bold');
  pdf.text('Seller Signature', colLeft, y);
  pdf.text('Buyer Signature', colRight, y);
  y += 8;

  pdf.setFont('helvetica', 'normal');
  pdf.text(store.name, colLeft, y);
  pdf.text(contract.buyerName || '___________________________', colRight, y);
  y += 18;

  pdf.setDrawColor(100, 120, 110);
  pdf.line(colLeft, y, colLeft + 80, y);
  pdf.line(colRight, y, colRight + 80, y);
  y += 12;

  // Footer
  pdf.setDrawColor(210, 216, 211);
  pdf.line(colLeft, y, 192, y);
  y += 8;
  pdf.setFontSize(9);
  pdf.setTextColor(95, 109, 102);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, colLeft, y);
  pdf.text(store.name, 192, y, { align: 'right' });

  pdf.save(filename);
}
