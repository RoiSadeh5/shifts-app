/**
 * Charts component – Chart.js visualizations (monthly bar, shift-type donut, net trend).
 * Requires Chart.js loaded. Call initCharts() when charts container is visible.
 */
var chartInstances = { monthly: null, donut: null, trend: null };

function destroyCharts() {
  [chartInstances.monthly, chartInstances.donut, chartInstances.trend].forEach(function(c) {
    if (c) { c.destroy(); }
  });
  chartInstances.monthly = null;
  chartInstances.donut = null;
  chartInstances.trend = null;
}

function getChartDefaults() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top', rtl: true }
    }
  };
}

function getMonthlyChartData() {
  var history = typeof loadHistory === 'function' ? loadHistory() : {};
  var shifts = typeof loadShifts === 'function' ? loadShifts() : [];
  var now = new Date();
  var labels = [];
  var grossData = [];
  var netData = [];
  var hebrewMonths = typeof hebrewMonths !== 'undefined' ? hebrewMonths : ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
  for (var i = 11; i >= 0; i--) {
    var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    var y = d.getFullYear();
    var m = d.getMonth();
    var yearKey = String(y);
    var monthData = history[yearKey] && history[yearKey][m] ? history[yearKey][m] : null;
    var gross = monthData && monthData.gross ? monthData.gross : 0;
    var net = monthData && (monthData.actualNet || monthData.net) ? (monthData.actualNet || monthData.net) : 0;
    if (gross <= 0 && net <= 0) {
      var monthShifts = shifts.filter(function(s) {
        var p = s.date.split('-');
        return parseInt(p[0]) === y && parseInt(p[1]) - 1 === m;
      });
      monthShifts.forEach(function(s) {
        gross += (s.result && s.result.totalPay) ? s.result.totalPay : 0;
      });
      if (gross > 0 && typeof calcDeductions === 'function' && typeof calcIncomeTax === 'function') {
        var ded = calcDeductions(gross);
        var tax = calcIncomeTax(gross);
        net = gross - ded.employee.total - (dedSettings.incomeTax ? tax.finalTax : 0);
      }
    }
    labels.push(hebrewMonths[m] + ' \'' + String(y).slice(-2));
    grossData.push(gross);
    netData.push(net);
  }
  return { labels: labels, gross: grossData, net: netData };
}

function getShiftTypeData() {
  var shifts = typeof loadShifts === 'function' ? loadShifts() : [];
  var typeNames = typeof typeNames !== 'undefined' ? typeNames : { plus: 'פלוס', training: 'אימון', vacation: 'חופש', sick: 'מחלה', minus: 'ידני' };
  var now = new Date();
  var currentYear = now.getFullYear();
  var currentMonth = now.getMonth();
  var monthShifts = shifts.filter(function(s) {
    var p = s.date.split('-');
    return parseInt(p[0]) === currentYear && parseInt(p[1]) - 1 === currentMonth;
  });
  var totals = {};
  monthShifts.forEach(function(s) {
    var t = s.type || 'plus';
    totals[t] = (totals[t] || 0) + (s.result && s.result.totalPay ? s.result.totalPay : 0);
  });
  if (Object.keys(totals).length === 0) return null;
  var colors = ['#818cf8', '#f59e0b', '#10b981', '#ef4444', '#38bdf8'];
  var labels = [];
  var data = [];
  var backgroundColors = [];
  Object.keys(totals).forEach(function(t, i) {
    labels.push(typeNames[t] || t);
    data.push(totals[t]);
    backgroundColors.push(colors[i % colors.length]);
  });
  return { labels: labels, data: data, backgroundColor: backgroundColors };
}

function initCharts() {
  if (typeof Chart === 'undefined') return;
  var container = document.getElementById('chartsContainer');
  if (!container) return;
  destroyCharts();
  var monthlyData = getMonthlyChartData();
  var monthlyCanvas = document.getElementById('chartMonthly');
  if (monthlyCanvas) {
    var ctx = monthlyCanvas.getContext('2d');
    chartInstances.monthly = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: monthlyData.labels,
        datasets: [
          { label: 'ברוטו', data: monthlyData.gross, backgroundColor: 'rgba(99,102,241,0.6)' },
          { label: 'נטו', data: monthlyData.net, backgroundColor: 'rgba(16,185,129,0.6)' }
        ]
      },
      options: Object.assign({}, getChartDefaults(), {
        scales: { x: { stacked: false }, y: { beginAtZero: true } }
      })
    });
  }
  var donutData = getShiftTypeData();
  var donutCanvas = document.getElementById('chartDonut');
  if (donutCanvas && donutData) {
    var ctx2 = donutCanvas.getContext('2d');
    chartInstances.donut = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: donutData.labels,
        datasets: [{ data: donutData.data, backgroundColor: donutData.backgroundColor }]
      },
      options: Object.assign({}, getChartDefaults(), { cutout: '55%' })
    });
  }
  var trendCanvas = document.getElementById('chartTrend');
  if (trendCanvas) {
    var ctx3 = trendCanvas.getContext('2d');
    chartInstances.trend = new Chart(ctx3, {
      type: 'line',
      data: {
        labels: monthlyData.labels,
        datasets: [{ label: 'נטו', data: monthlyData.net, borderColor: '#10b981', fill: true, backgroundColor: 'rgba(16,185,129,0.1)' }]
      },
      options: Object.assign({}, getChartDefaults(), {
        scales: { x: {}, y: { beginAtZero: true } }
      })
    });
  }
}
