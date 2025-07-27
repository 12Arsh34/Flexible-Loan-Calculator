let paymentChart;

document.getElementById('dark-mode-switch').addEventListener('change', function () {
  document.body.classList.toggle('dark-mode', this.checked);
});

document.getElementById('year-slider').addEventListener('input', function () {
  document.getElementById('years').value = this.value;
});

document.getElementById('calculate').addEventListener('click', function () {
  const principal = parseFloat(document.getElementById('amount').value);
  const rate = parseFloat(document.getElementById('rate').value) / 100 / 12;
  const years = parseInt(document.getElementById('years').value);
  const extra = parseFloat(document.getElementById('extra-payment').value) || 0;

  const totalPayments = years * 12;
  const x = Math.pow(1 + rate, totalPayments);
  const baseMonthly = (principal * x * rate) / (x - 1);
  const monthly = baseMonthly + extra;

  if (isFinite(monthly)) {
    let balance = principal;
    let month = 0;
    let amortization = [];
    let totalInterest = 0;

    while (balance > 0 && month < 1000) {
      const interest = balance * rate;
      const principalPayment = Math.min(monthly - interest, balance);
      balance -= principalPayment;
      amortization.push({
        month: month + 1,
        payment: principalPayment + interest,
        principal: principalPayment,
        interest: interest,
        balance: Math.max(balance, 0)
      });
      totalInterest += interest;
      month++;
      if (principalPayment <= 0) break;
    }

    const actualTotalPayment = amortization.reduce((sum, p) => sum + p.payment, 0);
    const savedInterest = ((baseMonthly * totalPayments) - actualTotalPayment).toFixed(2);
    const monthsSaved = totalPayments - amortization.length;

    document.getElementById('monthly-payment').textContent = `Monthly Payment: $${monthly.toFixed(2)}`;
    document.getElementById('total-payment').textContent = `Total Payment: $${actualTotalPayment.toFixed(2)}`;
    document.getElementById('total-interest').textContent = `Total Interest: $${totalInterest.toFixed(2)}`;
    document.getElementById('interest-saved').textContent = `Interest Saved: $${savedInterest}`;
    document.getElementById('time-saved').textContent = `Time Saved: ${monthsSaved} months`;

    updateChart(principal, totalInterest);
    updateAmortizationTable(amortization);
  } else {
    alert("Please check your input values.");
  }
});

function updateChart(principal, interest) {
  if (paymentChart) {
    paymentChart.destroy();
  }

  const ctx = document.getElementById('payment-chart').getContext('2d');
  paymentChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Principal', 'Interest'],
      datasets: [{
        data: [principal, interest],
        backgroundColor: ['#28a745', '#007bff']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function updateAmortizationTable(data) {
  const tbody = document.querySelector('#amortization-table tbody');
  tbody.innerHTML = '';
  data.forEach(entry => {
    const row = `<tr>
      <td>${entry.month}</td>
      <td>$${entry.payment.toFixed(2)}</td>
      <td>$${entry.principal.toFixed(2)}</td>
      <td>$${entry.interest.toFixed(2)}</td>
      <td>$${entry.balance.toFixed(2)}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}
