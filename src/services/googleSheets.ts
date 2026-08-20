// Google Sheets Sync Service for Reseller Orders
// Target Spreadsheet: https://docs.google.com/spreadsheets/d/1cQLW4tHWcN_KqtS8mOLdIMs7vA0dkwpPtVY0LZkZ9a0/edit?usp=sharing

import { Order } from '../types';

export const TARGET_SPREADSHEET_ID = '1cQLW4tHWcN_KqtS8mOLdIMs7vA0dkwpPtVY0LZkZ9a0';
export const TARGET_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${TARGET_SPREADSHEET_ID}/edit`;

const TOKEN_STORAGE_KEY = 'google_sheets_oauth_token';
const EXPIRY_STORAGE_KEY = 'google_sheets_token_expires_at';
const AUTO_SYNC_STORAGE_KEY = 'google_sheets_auto_sync_enabled';

declare global {
  interface Window {
    google?: any;
  }
}

// Check if token is valid and unexpired
export function getSavedSheetsToken(): string | null {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const expiresAt = localStorage.getItem(EXPIRY_STORAGE_KEY);
  if (!token) return null;
  if (expiresAt && Date.now() > Number(expiresAt)) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(EXPIRY_STORAGE_KEY);
    return null;
  }
  return token;
}

export function saveSheetsToken(token: string, expiresInSeconds: number = 3600): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(EXPIRY_STORAGE_KEY, String(Date.now() + (expiresInSeconds - 60) * 1000));
}

export function clearSheetsToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(EXPIRY_STORAGE_KEY);
}

export function isSheetsAutoSyncEnabled(): boolean {
  const val = localStorage.getItem(AUTO_SYNC_STORAGE_KEY);
  return val === null ? true : val === 'true';
}

export function setSheetsAutoSyncEnabled(enabled: boolean): void {
  localStorage.setItem(AUTO_SYNC_STORAGE_KEY, String(enabled));
}

/**
 * Initiates Google OAuth Token Client popup for user authentication
 */
export async function authenticateGoogleSheets(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services library is still loading. Please try again in a moment.'));
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: '', // Empty client_id allows AI Studio OAuth infrastructure
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        callback: (response: any) => {
          if (response.error) {
            console.error('Google OAuth error:', response);
            reject(new Error(response.error_description || response.error || 'Failed to authenticate with Google.'));
            return;
          }
          if (response.access_token) {
            saveSheetsToken(response.access_token, Number(response.expires_in) || 3600);
            resolve(response.access_token);
          } else {
            reject(new Error('No access token received from Google.'));
          }
        },
      });

      client.requestAccessToken({ prompt: '' });
    } catch (err: any) {
      reject(err);
    }
  });
}

/**
 * Formats order into Google Spreadsheet row columns
 * Headers: [Order ID, Date & Time, Reseller, Customer Name, Customer Phone, Full Address, District, Thana, Products, Total Qty, Products Total (BDT), Delivery Charge (BDT), Total COD (BDT), Order Type, Status, Profit Before Ad Cost (BDT), Notes]
 */
export function formatOrderToSheetRow(order: Order): (string | number)[] {
  const formattedDate = order.orderDate
    ? new Date(order.orderDate).toLocaleString('en-GB', {
        timeZone: 'Asia/Dhaka',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    : new Date().toLocaleString();

  return [
    order.id,
    formattedDate,
    order.resellerName || 'Direct Reseller',
    order.customerName,
    `'${order.customerPhone}`, // leading quote prevents phone numbers from losing leading zero
    order.customerAddress,
    order.district || '',
    order.thana || '',
    order.productDetails || (order.items?.map((i) => `${i.productName} (x${i.quantity})`).join(', ') ?? ''),
    order.quantity || 1,
    order.productsTotal !== undefined ? order.productsTotal : order.orderAmount - (order.deliveryCharge || 0),
    order.deliveryCharge || 0,
    order.orderAmount,
    order.orderType || 'Direct Order',
    order.status || 'Pending',
    order.profitBeforeAdCost !== undefined ? order.profitBeforeAdCost : '',
    order.notes || '',
  ];
}

export const SPREADSHEET_HEADERS = [
  'Order ID',
  'Date & Time',
  'Reseller Name',
  'Customer Name',
  'Customer Phone',
  'Delivery Address',
  'District',
  'Thana',
  'Product Details',
  'Total Quantity',
  'Products Total (BDT)',
  'Delivery Charge (BDT)',
  'Total COD Amount (BDT)',
  'Order Type',
  'Order Status',
  'Profit Before Ad Cost (BDT)',
  'Notes',
];

/**
 * Ensures header row exists in the spreadsheet
 */
async function ensureSheetHeaders(token: string, spreadsheetId: string): Promise<void> {
  try {
    // Check first row
    const checkRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:Q1`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (checkRes.ok) {
      const data = await checkRes.json();
      if (!data.values || data.values.length === 0 || !data.values[0] || data.values[0].length === 0) {
        // Append or set headers
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:Q1?valueInputOption=USER_ENTERED`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              values: [SPREADSHEET_HEADERS],
            }),
          }
        );
      }
    }
  } catch (err) {
    console.warn('Notice checking sheet headers:', err);
  }
}

/**
 * Appends a new order directly to the Google Spreadsheet
 */
export async function appendOrderToGoogleSheet(
  order: Order,
  spreadsheetId: string = TARGET_SPREADSHEET_ID
): Promise<{ success: boolean; message: string; updatedRange?: string }> {
  const token = getSavedSheetsToken();
  if (!token) {
    return {
      success: false,
      message: 'Google Sheets authorization required. Please connect Google Account in Admin / Settings.',
    };
  }

  try {
    // Make sure header exists
    await ensureSheetHeaders(token, spreadsheetId);

    const row = formatOrderToSheetRow(order);

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    });

    if (response.status === 401) {
      clearSheetsToken();
      return {
        success: false,
        message: 'Google Sheets session expired. Please re-authenticate.',
      };
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Google Sheets API error (${response.status})`);
    }

    const resJson = await response.json();
    return {
      success: true,
      message: `Order #${order.id} instantly appended to Google Sheet!`,
      updatedRange: resJson.updates?.updatedRange,
    };
  } catch (err: any) {
    console.error('Failed to append order to Google Sheet:', err);
    return {
      success: false,
      message: err.message || 'Failed to append order to Google Sheet.',
    };
  }
}

/**
 * Bulk sync list of orders to Google Spreadsheet
 */
export async function bulkSyncOrdersToGoogleSheet(
  orders: Order[],
  spreadsheetId: string = TARGET_SPREADSHEET_ID
): Promise<{ success: boolean; message: string; rowsAdded: number }> {
  let token = getSavedSheetsToken();
  if (!token) {
    token = await authenticateGoogleSheets();
  }

  if (orders.length === 0) {
    return { success: true, message: 'No orders to sync.', rowsAdded: 0 };
  }

  await ensureSheetHeaders(token, spreadsheetId);

  const rows = orders.map((o) => formatOrderToSheetRow(o));

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: rows,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Google Sheets API error (${response.status})`);
  }

  return {
    success: true,
    message: `Successfully synced ${rows.length} order(s) to Google Spreadsheet!`,
    rowsAdded: rows.length,
  };
}
