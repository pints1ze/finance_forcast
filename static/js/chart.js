/**
 * Chart-related functions for the Finance Forecast application
 */

// Chart.js instance variable
let financialChart = null;

/**
 * Load and display financial chart
 */
async function loadFinancialChart() {
  const chartCanvas = document.getElementById('financialChart');
  const loadingMsg = document.getElementById('chartLoadingMsg');
  const emptyMsg = document.getElementById('chartEmptyMsg');
  
  try {
    // Show loading state
    loadingMsg.style.display = 'flex';
    emptyMsg.style.display = 'none';
    chartCanvas.style.display = 'block';
    
    // Fetch chart data from backend
    const response = await fetch('/api/transactions/chart_data');
    if (!response.ok) {
      throw new Error('Failed to fetch chart data');
    }
    
    const chartData = await response.json();
    
    // Hide loading message
    loadingMsg.style.display = 'none';
    
    // Check if we have data
    if (!chartData.labels || chartData.labels.length === 0) {
      chartCanvas.style.display = 'none';
      emptyMsg.style.display = 'flex';
      return;
    }
    
    // Destroy existing chart if it exists
    if (financialChart) {
      financialChart.destroy();
    }
    
    // Format dates for display
    const formattedLabels = chartData.labels.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    // Create the chart
    const ctx = chartCanvas.getContext('2d');
    financialChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: formattedLabels,
        datasets: [{
          label: 'Account Balance',
          data: chartData.data,
          fill: true,
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 3,
          tension: 0.2,
          pointBackgroundColor: 'rgb(75, 192, 192)',
          pointBorderColor: 'rgb(255, 255, 255)',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: {
                size: 14
              },
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: function(context) {
                return 'Balance: $' + context.parsed.y.toFixed(2);
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Date',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Total Value ($)',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              callback: function(value) {
                return '$' + value.toFixed(0);
              }
            }
          }
        }
      }
    });
    
  } catch (error) {
    console.error('Error loading chart:', error);
    loadingMsg.style.display = 'none';
    chartCanvas.style.display = 'none';
    
    // Show error message
    const errorMsg = document.createElement('div');
    errorMsg.className = 'absolute inset-0 flex items-center justify-center text-base-content/60';
    errorMsg.innerHTML = `
      <div class="text-center">
        <i class="bi bi-exclamation-triangle text-4xl mb-4 text-warning"></i>
        <p class="text-lg">Failed to load chart</p>
        <p class="text-sm">Please refresh the page to try again</p>
      </div>
    `;
    document.querySelector('.bg-base-100.rounded-lg.p-6').appendChild(errorMsg);
  }
}


