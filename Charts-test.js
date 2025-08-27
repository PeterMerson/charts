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
    tooltip: { isHtml: true, ignoreBounds: false },
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
    tooltip: { isHtml: true, ignoreBounds: false },
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
}