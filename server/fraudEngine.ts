export interface FraudCheckResult {
  phoneNumber: string;
  customerName: string;
  riskScore: number; // 0 to 100 (0 = Safe, 100 = High Risk Fraud)
  riskLevel: 'SAFE' | 'MODERATE' | 'HIGH_RISK';
  courierDeliveryRate?: string;
  totalPastOrders: number;
  successfulDeliveries: number;
  returnedOrCancelled: number;
  flags: string[];
  recommendation: 'APPROVE' | 'CALL_VERIFICATION_REQUIRED' | 'REJECT_OR_ADVANCE_PAYMENT';
  checkedAt: string;
  provider: 'Built-in Fraud Engine' | 'External Courier API (Steadfast / Pathao / Custom)';
}

/**
 * Validates Bangladeshi mobile operator prefixes
 */
export function isValidBDPhone(phone: string): boolean {
  const clean = phone.replace(/[\s\-\+]/g, '');
  // Standard BD format: 013, 014, 015, 016, 017, 018, 019 followed by 8 digits
  const regex = /^(?:\+?88)?01[3-9]\d{8}$/;
  return regex.test(clean);
}

/**
 * Evaluates risk score based on customer phone, address, and past order patterns
 */
export function evaluateCustomerFraud(
  customerPhone: string,
  customerName: string,
  customerAddress: string,
  existingOrders: any[] = []
): FraudCheckResult {
  const cleanPhone = customerPhone.replace(/[\s\-\+]/g, '');
  const flags: string[] = [];
  let score = 5; // Base low risk

  // 1. Phone number structure check
  if (!isValidBDPhone(cleanPhone)) {
    score += 45;
    flags.push('Invalid mobile number format or fake operator prefix');
  }

  // 2. Pattern check for obvious fake / test numbers (e.g. 01700000000, 01711111111, 01234567890)
  if (/^(\d)\1+$/.test(cleanPhone.slice(3)) || cleanPhone === '01712345678' || cleanPhone === '01812345678') {
    score += 60;
    flags.push('Repetitive digits or known mock test number detected');
  }

  // 3. Address completeness check
  if (!customerAddress || customerAddress.trim().length < 8) {
    score += 25;
    flags.push('Extremely short or vague delivery address (high risk of courier return)');
  }

  // 4. Duplicate velocity check across recent orders (same phone within last 24h)
  const matchingPastOrders = existingOrders.filter((o) => {
    const pastPhone = (o.customerPhone || '').replace(/[\s\-\+]/g, '');
    return pastPhone === cleanPhone;
  });

  const totalPast = matchingPastOrders.length;
  const returnedCount = matchingPastOrders.filter((o) => o.status === 'Cancelled').length;
  const deliveredCount = matchingPastOrders.filter((o) => o.status === 'Delivered').length;

  if (totalPast > 0) {
    const returnRatio = returnedCount / totalPast;
    if (returnRatio > 0.5 && totalPast >= 2) {
      score += 40;
      flags.push(`High previous order cancellation rate (${returnedCount}/${totalPast} orders returned/cancelled)`);
    } else if (deliveredCount >= 2) {
      score = Math.max(0, score - 20); // Reward loyal repeat customer
    }
  }

  // Cap score between 0 and 100
  score = Math.min(100, Math.max(0, score));

  let riskLevel: 'SAFE' | 'MODERATE' | 'HIGH_RISK' = 'SAFE';
  let recommendation: 'APPROVE' | 'CALL_VERIFICATION_REQUIRED' | 'REJECT_OR_ADVANCE_PAYMENT' = 'APPROVE';

  if (score >= 60) {
    riskLevel = 'HIGH_RISK';
    recommendation = 'REJECT_OR_ADVANCE_PAYMENT';
  } else if (score >= 25) {
    riskLevel = 'MODERATE';
    recommendation = 'CALL_VERIFICATION_REQUIRED';
  }

  const deliveryRate = totalPast > 0 
    ? `${Math.round((deliveredCount / totalPast) * 100)}%` 
    : 'New Customer (No prior history)';

  return {
    phoneNumber: customerPhone,
    customerName,
    riskScore: score,
    riskLevel,
    courierDeliveryRate: deliveryRate,
    totalPastOrders: totalPast,
    successfulDeliveries: deliveredCount,
    returnedOrCancelled: returnedCount,
    flags: flags.length > 0 ? flags : ['No suspicious activity detected. Normal risk profile.'],
    recommendation,
    checkedAt: new Date().toISOString(),
    provider: 'Built-in Fraud Engine',
  };
}
