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
      title: '*Total Operating Expenses include Mortgage Principal Costs - Total Co-op shares are 85,027 - 2024 excludes $228,074 one-time fire damage charge',
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
  // Also support opening the tooltip on mouseover and clearing on mouseout (unless a point has been clicked to persist).
  let lastSelection = null; // persistent selection from click
  let lastHover = null;     // transient selection from hover

  // Click selection behavior (toggle persistent tooltip)
  google.visualization.events.addListener(chart, 'select', function () {
    const sel = chart.getSelection() || [];
    // If the same point is clicked twice, clear selection (close tooltip)
    if (lastSelection && JSON.stringify(lastSelection) === JSON.stringify(sel)) {
      chart.setSelection([]); // this will close the tooltip
      lastSelection = null;
      return;
    }
    // Otherwise remember the new selection (if any)
    if (sel.length) {
      lastSelection = sel.slice();
    } else {
      lastSelection = null;
    }
  });

  // Mouseover opens tooltip (transient); does not override a persistent selection permanently.
  google.visualization.events.addListener(chart, 'onmouseover', function (e) {
    // e.row is defined for data points; ignore otherwise.
    if (typeof e.row === 'undefined' || e.row === null) return;

    const hoverSel = [{ row: e.row, column: e.column }];

    // If the hovered point is already the persistent selection, do nothing.
    if (lastSelection && JSON.stringify(lastSelection) === JSON.stringify(hoverSel)) {

      lastHover = null;
      return;
    }

    // Show tooltip for hovered point
    chart.setSelection(hoverSel);
    lastHover = hoverSel.slice();
  });

  // Mouseout clears the transient hover tooltip, but restores persistent selection if present.
  google.visualization.events.addListener(chart, 'onmouseout', function () {
    if (lastSelection) {
      // If a point is persistently selected, restore it visually.
      chart.setSelection(lastSelection);
      lastHover = null;
      return;
    }
    // Otherwise clear the selection (close tooltip)
    chart.setSelection([]);
    lastHover = null;
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

  // Toggle persistent tooltip behavior for this chart as well, and support mouseover opening.
  let lastSelection = null;
  let lastHover = null;

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

  google.visualization.events.addListener(chart, 'onmouseover', function (e) {
    if (typeof e.row === 'undefined' || e.row === null) return;

    const hoverSel = [{ row: e.row, column: e.column }];

    if (lastSelection && JSON.stringify(lastSelection) === JSON.stringify(hoverSel)) {
      lastHover = null;
      return;
    }

    chart.setSelection(hoverSel);
    lastHover = hoverSel.slice();
  });

  google.visualization.events.addListener(chart, 'onmouseout', function () {
    if (lastSelection) {
      chart.setSelection(lastSelection);
      lastHover = null;
      return;
    }
    chart.setSelection([]);
    lastHover = null;
  });
}