/**
 * Share Image – generates summary card (1080×1920) and shares via Web Share or download.
 */
function generateSummaryImage() {
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
  var w = 1080, hImg = 1920;
  var canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = hImg;
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f4f1ea';
  ctx.fillRect(0, 0, w, hImg);

  ctx.fillStyle = '#1c1915';
  ctx.font = '700 72px Heebo, Arial';
  ctx.textAlign = 'center';
  ctx.fillText('שכ״ש', w/2, 220);
  ctx.fillStyle = '#6f6a62';
  ctx.font = '400 40px Heebo, Arial';
  ctx.fillText(h + ' ' + currentYear, w/2, 290);

  ctx.fillStyle = '#6f6a62';
  ctx.font = '600 36px Heebo, Arial';
  ctx.fillText('נטו לבנק', w/2, 460);
  ctx.fillStyle = '#1f6b4a';
  ctx.font = '700 120px Heebo, Arial';
  ctx.fillText('₪' + Math.round(net).toLocaleString(), w/2, 590);

  ctx.fillStyle = '#1c1915';
  ctx.font = '600 42px Heebo, Arial';
  ctx.fillText('ברוטו ₪' + Math.round(gross).toLocaleString(), w/2, 720);
  ctx.fillStyle = '#6f6a62';
  ctx.font = '400 36px Heebo, Arial';
  ctx.fillText(monthShifts.length + ' משמרות · ' + Math.round(totalH) + ' שעות', w/2, 780);

  return canvas.toDataURL('image/png');
}

function shareImage() {
  haptic(true);
  var dataUrl = generateSummaryImage();
  var blob = dataUrlToBlob(dataUrl);
  var file = new File([blob], 'sachash-summary.png', { type: 'image/png' });

  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    navigator.share({
      title: 'Sachash',
      files: [file]
    }).then(function() {
      showToast('נשלח');
    }).catch(function() {
      downloadImageFallback(dataUrl);
    });
  } else {
    downloadImageFallback(dataUrl);
  }
}

function dataUrlToBlob(dataUrl) {
  var arr = dataUrl.split(',');
  var mime = arr[0].match(/:(.*?);/)[1];
  var bstr = atob(arr[1]);
  var n = bstr.length;
  var u8 = new Uint8Array(n);
  for (var i = 0; i < n; i++) u8[i] = bstr.charCodeAt(i);
  return new Blob([u8], { type: mime });
}

function downloadImageFallback(dataUrl) {
  var a = document.createElement('a');
  a.href = dataUrl;
  a.download = 'sachash-' + (typeof hebrewMonths !== 'undefined' ? hebrewMonths[currentMonth] : currentMonth + 1) + '-' + currentYear + '.png';
  a.click();
  showToast('התמונה הורדה');
}
