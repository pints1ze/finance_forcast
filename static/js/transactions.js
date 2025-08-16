/**
 * Transaction-related functions for the Finance Forecast application
 */

/**
 * Open transaction modal with specified direction
 * @param {string} direction - Either 'deposit' or 'withdraw'
 */
function openTransactionModal(direction) {
  const modal = document.getElementById('transactionModal');
  const depositTab = document.getElementById('depositTab');
  const withdrawTab = document.getElementById('withdrawTab');
  const depositLabel = document.getElementById('depositLabel');
  const withdrawLabel = document.getElementById('withdrawLabel');
  const submitBtn = document.getElementById('submitBtn');
  const dateInput = document.getElementById('dateInput');
  const amountInput = document.getElementById('amountInput');
  const form = document.getElementById('transactionForm');
  
  // Set today's date as default
  dateInput.value = getTodayDate();
  
  // Clear form
  form.reset();
  dateInput.value = getTodayDate(); // Reset date after form reset
  
  // Set direction based on parameter
  if (direction === 'deposit') {
    depositTab.checked = true;
    depositLabel.classList.add('tab-active');
    withdrawLabel.classList.remove('tab-active');
    submitBtn.textContent = 'Add Deposit';
    submitBtn.className = 'btn btn-success';
  } else {
    withdrawTab.checked = true;
    withdrawLabel.classList.add('tab-active');
    depositLabel.classList.remove('tab-active');
    submitBtn.textContent = 'Add Withdrawal';
    submitBtn.className = 'btn btn-warning';
  }
  
  modal.showModal();
}

/**
 * Handle tab switching in the transaction modal
 * @param {string} direction - Either 'deposit' or 'withdraw'
 */
function switchTab(direction) {
  const depositTab = document.getElementById('depositTab');
  const withdrawTab = document.getElementById('withdrawTab');
  const depositLabel = document.getElementById('depositLabel');
  const withdrawLabel = document.getElementById('withdrawLabel');
  const submitBtn = document.getElementById('submitBtn');
  
  if (direction === 'deposit') {
    depositTab.checked = true;
    depositLabel.classList.add('tab-active');
    withdrawLabel.classList.remove('tab-active');
    submitBtn.textContent = 'Add Deposit';
    submitBtn.className = 'btn btn-success';
  } else {
    withdrawTab.checked = true;
    withdrawLabel.classList.add('tab-active');
    depositLabel.classList.remove('tab-active');
    submitBtn.textContent = 'Add Withdrawal';
    submitBtn.className = 'btn btn-warning';
  }
}

/**
 * Handle form submission for transactions
 * @param {Event} event - The form submit event
 */
async function handleTransactionSubmit(event) {
  event.preventDefault();
  
  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.textContent;
  
  // Show loading state
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';
  
  const formData = new FormData(event.target);
  const data = {
    direction: formData.get('direction'),
    amount: formData.get('amount'),
    description: formData.get('description') || '',
    date: formData.get('date')
  };
  
  // Basic validation
  if (!data.amount || parseFloat(data.amount) <= 0) {
    alert('Please enter a valid amount');
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    return;
  }
  
  try {
    const response = await fetch('/add_transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert(result.message);
      document.getElementById('transactionModal').close();
      // Refresh the chart and balance with new data
      loadFinancialChart();
      updateBalance();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while processing the transaction');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}
