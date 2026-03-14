/**
 * PDF Export for שכ״ש – monthly summary with shifts table.
 * Requires jsPDF and jspdf-autotable. Hebrew may render with fallback.
 */
function generateMonthlyPdf() {
  var jspdf = window.jspdf;
  if (!jspdf || typeof jspdf.jsPDF === 'undefined') {
    showToast('ספריית PDF לא נטענה');
    return null;
  }
  var doc = new jspdf.jsPDF();
  var monthShifts = getMonthShifts();
  var totalH = 0, totalP = 0;
  monthShifts.forEach(function(s) {
    totalH += s.result && s.result.totalHours ? s.result.totalHours : 0;
    totalP += s.result && s.result.totalPay ? s.result.totalPay : 0;
  });
  var fixedAdd = monthShifts.length > 0 && typeof SalaryEngine !== 'undefined'
    ? SalaryEngine.calculateFixedMonthlyAdditions().total : 0;
  var gross = totalP + fixedAdd;
  var ded = typeof calcDeductions === 'function' ? calcDeductions(gross) : { employee: { total: 0 } };
  var tax = typeof calcIncomeTax === 'function' ? calcIncomeTax(gross) : { finalTax: 0 };
  var net = gross - ded.employee.total - (dedSettings.incomeTax ? tax.finalTax : 0);

  var h = typeof hebrewMonths !== 'undefined' ? hebrewMonths[currentMonth] : (currentMonth + 1);
  var title = 'Sachash - ' + h + ' ' + currentYear;
  doc.setFontSize(18);
  doc.text(title, 14, 20);

  doc.setFontSize(11);
  doc.text('Gross: ' + gross.toFixed(0), 14, 30);
  doc.text('Net: ' + net.toFixed(0), 14, 37);
  doc.text('Shifts: ' + monthShifts.length + ' | Hours: ' + totalH.toFixed(1), 14, 44);

  if (typeof doc.autoTable === 'function' && monthShifts.length > 0) {
    var rows = monthShifts.map(function(s) {
      var tn = (typeof typeNames !== 'undefined' && typeNames[s.type]) ? typeNames[s.type] : s.type;
      return [s.date, tn, (s.result && s.result.totalHours) ? s.result.totalHours.toFixed(1) : '-', (s.result && s.result.totalPay) ? s.result.totalPay.toFixed(0) : '0'];
    });
    doc.autoTable({
      startY: 52,
      head: [['Date', 'Type', 'Hours', 'Pay']],
      body: rows,
      theme: 'grid'
    });
  }
  return doc;
}

function downloadMonthlyPdf() {
  haptic(true);
  var doc = generateMonthlyPdf();
  if (!doc) return;
  var h = typeof hebrewMonths !== 'undefined' ? hebrewMonths[currentMonth] : (currentMonth + 1);
  doc.save('sachash-' + h + '-' + currentYear + '.pdf');
  showToast('PDF יוצא');
}
