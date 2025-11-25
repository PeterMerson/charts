<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Untitled Document</title>
</head>

<body>
	// Load Google Charts library
google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(initCharts);

function initCharts() {
  // Fetch data from data.json
  fetch('data1.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load data1.json');
      }
      return response.json();
    })
    .then(data => {
      // Assign fetched data to variables
      const incomeExpensesData = data.incomeExpensesData;
      const cashReservesData = data.cashReservesData;

      // Error handling for chart containers
      if (!document.getElementById('expenses') || !document.getElementById('cash-reserves')) {
        console.error('Chart containers not found.');
        return;
      }

      // Draw charts with fetched data
      drawIncomeExpensesChart(incomeExpensesData);
      drawCashReservesChart(cashReservesData);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

// Helper: ensure tooltip can receive pointer events and simple styling
function injectTooltipStyles() {
  if (document.getElementById('google-tooltip-styles')) return;
  const style = document.createElement('style');
  style.id = 'google-tooltip-styles';
  style.innerHTML = `
    /* Allow the Google tooltip to receive pointer events so it can be clicked */
    .google-visualization-tooltip { pointer-events: auto !important; }
    /* Make the custom tooltip content look interactive */
    .chart-tooltip { cursor: pointer; }
    .chart-tooltip .tooltip-close-btn { margin-top: 6px; padding: 4px 8px; cursor: pointer; }
  `;
  document.head.appendChild(style);
}

// Helper: build clickable HTML around original annotationText content
function buildTooltipHtml(rawHtml, chartId, row, col) {
  // rawHtml may already be HTML; we wrap it in a container with a close button
  // data attributes allow identifying tooltip origin if needed
  return `
    <div class="chart-tooltip" data-chart="${chartId}" data-row="${row}" data-col="${col}">
      <div class="chart-tooltip-content">${rawHtml}</div>
      <div><button class="tooltip-close-btn" data-chart="${chartId}">Close</button></div>
    </div>
  `;
}

function drawIncomeExpensesChart(incomeExpensesData) {
  const dataTable = new google.visualization.DataTable();
  dataTable.addColumn('string', 'Year');
  dataTable.addColumn('number', 'Total Income');
  dataTable.addColumn({ type: 'string', role: 'annotation' });
  dataTable.addColumn({ type: 'string', role: 'annotationText', p: { html: true } });
  dataTable.addColumn('number', 'Total Expenses');
  dataTable.addColumn({ type: 'string', role: 'annotation' });
  dataTable.addColumn({ type: 'string', role: 'annotationText', p: { html: true } });
  dataTable.addRows(incomeExpensesData);

  // Convert annotationText cells into richer clickable HTML tooltips
  // annotationText columns are at indexes 3 and 6
  injectTooltipStyles();
  const chartId = 'expenses';
  for (let r = 0; r < dataTable.getNumberOfRows(); r++) {
    // column 3
    const raw3 = dataTable.getValue(r, 3) || '';
    dataTable.setValue(r, 3, buildTooltipHtml(raw3, chartId, r, 3));
    // column 6
    const raw6 = dataTable.getValue(r, 6) || '';
    dataTable.setValue(r, 6, buildTooltipHtml(raw6, chartId, r, 6));
  }

  // Apply number formatting
  const formatter = new google.visualization.NumberFormat({
    prefix: '$',
    fractionDigits: 0,
    negativeColor: 'red',
    negativeParens: true
  });
  formatter.format(dataTable, 1); // Total Income
  formatter.format(dataTable, 4); // Total Expenses

  const options = {
    tooltip: { isHtml: true, ignoreBounds: false, trigger: 'selection' },
    legend: { position: 'top', alignment: 'center' },
    vAxis: { title: 'Dollars ($)' },
    hAxis: {
      title: '*Total Operating Expenses include Mortgage Principal Costs - Total Co-op shares are 85,027',
      titleTextStyle: { color: 'red', fontWeight: 'bold' }
    },
    chartArea: { width: '86%', height: '75%' },
    seriesType: 'area',
    series: { 1: { type: 'line' } },
    lineWidth: 10,
    pointSize: 8
  };

  const chart = new google.visualization.ComboChart(document.getElementById('expenses'));
  chart.draw(dataTable, options);

  // Allow clicking a point to open a persistent tooltip, and clicking the same point again to close it.
  let lastSelection = null;
  google.visualization.events.addListener(chart, 'select', function () {
    const sel = chart.getSelection() || [];
    // If the same point is clicked twice, clear selection (close tooltip)
    if (lastSelection && JSON.stringify(lastSelection) === JSON.stringify(sel)) {
      chart.setSelection([]); // this will close the tooltip
      lastSelection = null;
      return;
    }
    // Otherwise remember the new selection
    if (sel.length) {
      lastSelection = sel.slice();
    } else {
      lastSelection = null;
    }
  });

  // Make the tooltip itself clickable: clicking inside the tooltip (or the Close button) closes it.
  const container = document.getElementById('expenses');
  container.addEventListener('click', function (e) {
    // If user clicked anywhere inside our custom tooltip content, close the tooltip
    const clickedTooltip = e.target.closest('.chart-tooltip, .tooltip-close-btn');
    if (clickedTooltip) {
      // Close current selection (tooltip)
      chart.setSelection([]);
      lastSelection = null;
      // Stop propagation so a click on the tooltip doesn't cause other chart interactions
      e.stopPropagation();
    }
  });
}

function drawCashReservesChart(cashReservesData) {
  const dataTable = new google.visualization.DataTable();
  dataTable.addColumn('string', 'Year');
  dataTable.addColumn('number', 'Cash & Reserve Fund balance');
  dataTable.addColumn({ type: 'string', role: 'annotation' });
  dataTable.addColumn({ type: 'string', role: 'annotationText', p: { html: true } });
  dataTable.addColumn('number', 'Capital Expenditures - (cumulative from 2006)');
  dataTable.addColumn({ type: 'string', role: 'annotation' });
  dataTable.addColumn({ type: 'string', role: 'annotationText', p: { html: true } });
  dataTable.addRows(cashReservesData);

  // Convert annotationText cells into richer clickable HTML tooltips
  // annotationText columns are at indexes 3 and 6
  injectTooltipStyles();
  const chartId = 'cash-reserves';
  for (let r = 0; r < dataTable.getNumberOfRows(); r++) {
    // column 3
    const raw3 = dataTable.getValue(r, 3) || '';
    dataTable.setValue(r, 3, buildTooltipHtml(raw3, chartId, r, 3));
    // column 6
    const raw6 = dataTable.getValue(r, 6) || '';
    dataTable.setValue(r, 6, buildTooltipHtml(raw6, chartId, r, 6));
  }

  // Apply number formatting
  const formatter = new google.visualization.NumberFormat({
    prefix: '$',
    fractionDigits: 0,
    negativeColor: 'red',
    negativeParens: true
  });
  formatter.format(dataTable, 1); // Cash & Reserve
  formatter.format(dataTable, 4); // Capital Expenditures

  const options = {
    tooltip: { isHtml: true, ignoreBounds: false, trigger: 'selection' },
    legend: { position: 'top', alignment: 'center' },
    vAxis: { title: 'Dollars ($)' },
    hAxis: {
      title: 'Cash & Reserve is from the BALANCE SHEET - Capital Expenditures are from the STATEMENT OF CASH FLOWS',
      titleTextStyle: { color: 'red' }
    },
    chartArea: { width: '86%', height: '75%' },
    lineWidth: 10,
    pointSize: 8
  };

  const chart = new google.visualization.AreaChart(document.getElementById('cash-reserves'));
  chart.draw(dataTable, options);

  // Toggle persistent tooltip behavior for this chart as well
  let lastSelection = null;
  google.visualization.events.addListener(chart, 'select', function () {
    const sel = chart.getSelection() || [];
    if (lastSelection && JSON.stringify(lastSelection) === JSON.stringify(sel)) {
      chart.setSelection([]); // close tooltip on second click
      lastSelection = null;
      return;
    }
    if (sel.length) {
      lastSelection = sel.slice();
    } else {
      lastSelection = null;
    }
  });

  // Make the tooltip itself clickable: clicking inside the tooltip (or the Close button) closes it.
  const container = document.getElementById('cash-reserves');
  container.addEventListener('click', function (e) {
    const clickedTooltip = e.target.closest('.chart-tooltip, .tooltip-close-btn');
    if (clickedTooltip) {
      chart.setSelection([]);
      lastSelection = null;
      e.stopPropagation();
    }
  });
}
</body>
</html>
