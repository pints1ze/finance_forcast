/**
 * Dashboard card management functions for the Finance Forecast application
 */

/**
 * Load and update current balance card
 */
async function updateBalance() {
  try {
    const response = await fetch('/api/balance');
    if (!response.ok) {
      throw new Error('Failed to fetch balance');
    }
    
    const balanceData = await response.json();
    
    // Update balance display
    const balanceElement = document.getElementById('currentBalance');
    const transactionCountElement = document.getElementById('transactionCount');
    
    if (balanceElement) {
      balanceElement.textContent = balanceData.balance.toFixed(2);
    }
    
    if (transactionCountElement) {
      const count = balanceData.transaction_count;
      transactionCountElement.textContent = `${count} transaction${count !== 1 ? 's' : ''}`;
    }
    
  } catch (error) {
    console.error('Error updating balance:', error);
  }
}
