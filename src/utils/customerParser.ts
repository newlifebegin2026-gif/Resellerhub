import { OrganizedCustomerData, DeliveryLocationType } from '../types';
import { BANGLADESH_DISTRICTS } from '../constants/locations';

/**
 * Intelligent parser for unstructured customer text commonly sent via WhatsApp/Messenger/Facebook
 * Handles formats like:
 * "Rahim, Mirpur 10, Dhaka, Washroom Rack : 1 pieces, 01712345678, COD ৳560"
 * "মোঃ করিম\nগ্রাম: বাঘারপাড়া, থানা: বাঘারপাড়া, জেলা: যশোর\nফোন: 01812345678\nপণ্য: ২টা ঘড়ি, মোট ১০০০ টাকা"
 */
export function parseCustomerDetails(rawText: string): OrganizedCustomerData {
  if (!rawText || !rawText.trim()) {
    return {
      rawInput: '',
      customerName: '',
      customerPhone: '',
      cleanPhone: '',
      district: 'Dhaka',
      location: 'Dhaka',
      address: '',
    };
  }

  const text = rawText.trim();
  const lines = text.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);

  // 1. Phone Extraction
  // Support standard Bangladeshi 11-digit numbers (013-019) with +880, 880, spaces, dashes
  // Also detect foreign numbers with international country codes
  let customerPhone = '';
  let cleanPhone = '';
  let foreignPhone: string | undefined = undefined;

  // Convert Bengali numerals in text for matching
  const bengaliToEnglishDigits = (s: string) => {
    const map: Record<string, string> = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
    };
    return s.replace(/[০-৯]/g, (d) => map[d] || d);
  };

  const normalizedText = bengaliToEnglishDigits(text);

  // Look for BD mobile numbers first
  const bdPhoneRegex = /(?:(?:\+|00)?880|0)?1[3-9]\d{8}\b/g;
  const bdMatches = normalizedText.match(bdPhoneRegex);

  if (bdMatches && bdMatches.length > 0) {
    const rawMatch = bdMatches[0];
    let cleaned = rawMatch.replace(/^(\+880|880|00880)/, '0');
    if (!cleaned.startsWith('0')) cleaned = '0' + cleaned;
    cleanPhone = cleaned;
    customerPhone = cleaned;
  } else {
    // Check for foreign numbers (e.g., +966, +971, +60, +1, +44, etc.)
    const foreignRegex = /(?:\+|00)(?:966|971|968|974|965|973|60|65|91|44|1|39|49)\d{7,12}\b/g;
    const foreignMatches = normalizedText.match(foreignRegex);
    if (foreignMatches && foreignMatches.length > 0) {
      foreignPhone = foreignMatches[0];
      customerPhone = foreignPhone;
      cleanPhone = foreignPhone;
    }
  }

  // 2. District & Delivery Location Extraction
  let detectedDistrict = 'Dhaka';
  let detectedLocation: DeliveryLocationType = 'Other District';
  const lowerNorm = normalizedText.toLowerCase();

  // Check against all 64 districts
  for (const dist of BANGLADESH_DISTRICTS) {
    const dLower = dist.toLowerCase();
    if (
      lowerNorm.includes(`জেলা: ${dLower}`) ||
      lowerNorm.includes(`district: ${dLower}`) ||
      lowerNorm.includes(`district : ${dLower}`) ||
      lowerNorm.includes(` ${dLower},`) ||
      lowerNorm.includes(`, ${dLower}`) ||
      lowerNorm.includes(`\n${dLower}`) ||
      lowerNorm.includes(`${dLower} `) ||
      lowerNorm === dLower
    ) {
      detectedDistrict = dist;
      break;
    }
  }

  // Determine if inside Dhaka or outside
  if (
    detectedDistrict.toLowerCase() === 'dhaka' ||
    lowerNorm.includes('dhaka') ||
    lowerNorm.includes('ঢাকা') ||
    lowerNorm.includes('mirpur') ||
    lowerNorm.includes('মিরপুর') ||
    lowerNorm.includes('dhanmondi') ||
    lowerNorm.includes('ধানমন্ডি') ||
    lowerNorm.includes('uttara') ||
    lowerNorm.includes('উত্তরা') ||
    lowerNorm.includes('gulshan') ||
    lowerNorm.includes('গুলশান') ||
    lowerNorm.includes('banani') ||
    lowerNorm.includes('বনানী') ||
    lowerNorm.includes('motijheel') ||
    lowerNorm.includes('মতিঝিল') ||
    lowerNorm.includes('mohammadpur') ||
    lowerNorm.includes('মোহাম্মদপুর') ||
    lowerNorm.includes('badda') ||
    lowerNorm.includes('বাড্ডা')
  ) {
    detectedDistrict = 'Dhaka';
    detectedLocation = 'Dhaka';
  } else {
    detectedLocation = 'Other District';
  }

  // 3. Name Extraction
  let customerName = '';
  // Try explicit name markers
  const nameLabelMatch = normalizedText.match(/(?:name|customer|নাম|গ্রাহক|কাস্টমার)\s*[:=\-]\s*([^\n\r,;]+)/i);
  if (nameLabelMatch && nameLabelMatch[1]) {
    customerName = nameLabelMatch[1].trim();
  } else if (lines.length > 0) {
    // If comma separated on first line: "Rahim, Mirpur 10, Dhaka..."
    const firstLineParts = lines[0].split(/[,|•;]+/).map((p) => p.trim()).filter(Boolean);
    if (firstLineParts.length >= 2 && !/^\d+$/.test(firstLineParts[0]) && !firstLineParts[0].toLowerCase().includes('dhaka')) {
      customerName = firstLineParts[0].replace(/^(name|customer|নাম)[:\-\s]+/i, '').trim();
    } else {
      // First line if not phone or price
      const candidate = lines[0].replace(/^(name|customer|নাম)[:\-\s]+/i, '').trim();
      if (!/^\d+$/.test(candidate) && candidate.length < 50 && !candidate.toLowerCase().includes('cod')) {
        customerName = candidate;
      }
    }
  }

  if (!customerName || customerName.length > 60 || /^\d+$/.test(customerName)) {
    customerName = 'Customer';
  }

  // 4. Area & Address
  let address = text;
  let area = '';

  // Look for specific area mentions like "Mirpur 10", "Sector 7", "Agrabad"
  const areaLabelMatch = normalizedText.match(/(?:area|thana|থানা|গ্রাম|ঠিকানা|address|location)\s*[:=\-]\s*([^\n\r,;]+)/i);
  if (areaLabelMatch && areaLabelMatch[1]) {
    area = areaLabelMatch[1].trim();
  }

  // 5. COD / Price Extraction
  let extractedCOD: number | undefined = undefined;
  const codMatch =
    normalizedText.match(/(?:cod|cash|amount|price|total|টাকা|৳|বিল)\s*[:=\-]?\s*(\d{2,6})/i) ||
    normalizedText.match(/(\d{2,6})\s*(?:tk|taka|bdt|৳|টাকা|\/\-)/i);

  if (codMatch && codMatch[1]) {
    const num = parseInt(codMatch[1], 10);
    if (!isNaN(num) && num > 0 && num < 500000) {
      extractedCOD = num;
    }
  }

  // 6. Product Name / Quantity Mentions
  let extractedProduct: string | undefined = undefined;
  let extractedQuantity: number | undefined = undefined;

  const qtyMatch = normalizedText.match(/(\d+)\s*(?:piece|pieces|pcs|pc|টা|টি|জোড়া|box|boxes|সেট|set)/i);
  if (qtyMatch && qtyMatch[1]) {
    extractedQuantity = parseInt(qtyMatch[1], 10);
  }

  const prodLabelMatch = normalizedText.match(/(?:product|item|পণ্য|আইটেম)\s*[:=\-]\s*([^\n\r,;]+)/i);
  if (prodLabelMatch && prodLabelMatch[1]) {
    extractedProduct = prodLabelMatch[1].trim();
  }

  const isComplete = Boolean(
    customerName &&
    (customerPhone || foreignPhone) &&
    detectedDistrict &&
    extractedCOD
  );

  return {
    rawInput: text,
    customerName,
    name: customerName,
    customerPhone: customerPhone || cleanPhone,
    phone: customerPhone || cleanPhone,
    cleanPhone,
    foreignPhone,
    foreignNumber: foreignPhone || '',
    location: detectedLocation,
    locationArea: area,
    area,
    areaThana: area,
    thana: area,
    district: detectedDistrict,
    address,
    product: extractedProduct,
    productName: extractedProduct || '',
    quantity: extractedQuantity || 1,
    productAmount: extractedCOD || 0,
    codAmount: extractedCOD,
    cod: extractedCOD || 0,
    isComplete,
  };
}
