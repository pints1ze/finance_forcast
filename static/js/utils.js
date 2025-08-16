/**
 * Utility functions for the Finance Forecast application
 */

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date in YYYY-MM-DD format
 */
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Format currency input with validation
 * @param {HTMLInputElement} input - The input element to format
 */
function formatCurrency(input) {
  let value = input.value.replace(/[^\d.]/g, '');
  
  // Handle multiple decimal points
  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit to 2 decimal places
  if (parts[1] && parts[1].length > 2) {
    value = parts[0] + '.' + parts[1].substring(0, 2);
  }
  
  input.value = value;
}
