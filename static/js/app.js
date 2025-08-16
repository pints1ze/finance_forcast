/**
 * Main application initialization for Finance Forecast
 */

/**
 * Initialize the application when the page loads
 */
document.addEventListener('DOMContentLoaded', function() {
  const amountInput = document.getElementById('amountInput');
  const transactionForm = document.getElementById('transactionForm');
  const depositLabel = document.getElementById('depositLabel');
  const withdrawLabel = document.getElementById('withdrawLabel');
  
  // Load the financial chart and balance
  loadFinancialChart();
  updateBalance();
  
  // Add currency formatting to amount input
  amountInput.addEventListener('input', function() {
    formatCurrency(this);
  });
  
  // Add form submission handler
  transactionForm.addEventListener('submit', handleTransactionSubmit);
  
  // Add click handlers for tabs
  depositLabel.addEventListener('click', function() {
    switchTab('deposit');
  });
  
  withdrawLabel.addEventListener('click', function() {
    switchTab('withdraw');
  });
});
