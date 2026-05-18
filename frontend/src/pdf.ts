import type { jsPDF as JsPdfType } from 'jspdf';
import { Bike } from './api';

type StoreInfo = {
  name: string;
  phone: string;
  address: string;
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
