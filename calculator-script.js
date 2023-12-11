function handleKeyPress(event, nextField) {
  if (event.key === 'Enter') {
    event.preventDefault();

    if (nextField === 'calculateButton') {
      calculateTotal();
    } else {
      document.getElementById(nextField).focus();
    }
  }
}

function calculateTotal() {
  var hourlyRate = parseFloat(document.getElementById('hourlyRate').value);
  var hoursWorked = parseFloat(document.getElementById('hoursWorked').value);

  if (isNaN(hourlyRate) || isNaN(hoursWorked)) {
    alert('Please enter valid numeric values');
    return;
  }

  var totalDollars = hourlyRate * hoursWorked;

  document.getElementById('result').textContent = 'Total: $' + totalDollars.toFixed(2);
}

function goBack() {
  window.history.back();
}