google.charts.load('current', {'packages':['corechart']});


const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago','Sept', 'Oct', 'Nov', 'Dic']
const optionsBuilder = (data) => ({
  width: '100%',
  height: 250,
  colors: ['#25D16A'],
  maintainAspectRatio: false,
  legend: {
    position:'none'
  },
  vAxis: {
    format: "#.##'%'",
    textStyle:{color: '#74797f'},
    viewWindow: { min: Math.min(0, data.getColumnRange(1).min) }
  },
  hAxis: {
    textStyle:{color: '#74797f'}
  },
  pointSize: 5,
  chartArea: {
    height: '100%',
    width: '100%',
    top: 48,
    left: 48,
    right: 16,
    bottom: 48
  },
  height: '100%',
  width: '100%',
});

var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const DEFAULT_URL = 'https://91o7sqo7s3.execute-api.us-east-1.amazonaws.com/prod/';

const getYieldsFor = ({
  year,
  month,
  risk,
  portfolioType,
  typeUniverse
}) => {
  var routeParam = 'recommendationYields';
  if (portfolioType === 'harryIpsa') return chileanSmartFundYields;
  if (portfolioType === 'wallet') routeParam = 'walletYields';
  const url = `${DEFAULT_URL}${routeParam}`;
  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify({ year, month, risk, typeUniverse}),
    redirect: 'follow'
  };
  return fetch(url, requestOptions)
    .then(response => response.json())
};
const numberToPercent = (number) => ((number) * 100).toFixed(2) + '%';

const mapExtractingPercentagesWithTooltipInfo = (accumulatedYields, key) => accumulatedYields.
map(
  (data, index)=> {
    const [year, month] = data.dateInfo.split('-');
    const monthString = MONTHS[Number(month) - 1];
    return [
      `${monthString} ${year}`,
      (data[key] - 1) * 100,
      `Rentabilidad acumulada: ${numberToPercent(data[key] - 1)} \n
        Rentabilidad mensual: ${numberToPercent((data[key] / (accumulatedYields[index - 1]?.[key] ?? 1 )) - 1)}`,
    ]
  }
)

const createDataTable = (key) => (accumulatedYields) => {
  var dataTable = new google.visualization.DataTable();
  dataTable.addColumn('string');
  dataTable.addColumn('number');
  dataTable.addColumn({type: 'string', role: 'tooltip'});
  dataTable.addRows(mapExtractingPercentagesWithTooltipInfo(accumulatedYields, key));
  return dataTable;
}
const drawChart = (containerId, chartData, options) =>{
  const container = document.getElementById(containerId);
  const { displayCurrency = 'USD', accumulatedYields } = chartData;
  const keyMap = {
    CLP: 'accYieldCLP',
    USD: 'accYieldUSD'
  };
  const key = displayCurrency ? keyMap[displayCurrency] : undefined;
  if (container) {
    const dataTable = createDataTable(key)(accumulatedYields);
    const options = optionsBuilder(dataTable);
    const chartWrapper = new google.visualization.ChartWrapper({
      chartType: 'LineChart',
      dataTable: dataTable,
      options: options,
      containerId: containerId
    });
    chartWrapper.draw();
  }
}

const getTotalYield = (key) => (yields) => yields.reduce((accYield, monthYield) => (1 + monthYield[key]) * accYield , 1);
const asPercentage = (yieldData) => ((yieldData - 1) * 100).toFixed(2) + '%';
const calculateAccumulatedYieldsFrom = (yields) => {
  const newYields = yields.reduce((acc, currentYieldData) => {
    const previousYieldCLP = acc.length ? acc.at(-1).accYieldCLP : 1;
    const previousYieldUSD = acc.length ? acc.at(-1).accYieldUSD : 1;
    return acc.concat([
      {
        accYieldCLP: previousYieldCLP * ((currentYieldData.rentabilidadMesCLP ?? currentYieldData.rentabilidadMes ?? 0) + 1),
        accYieldUSD: previousYieldUSD * ((currentYieldData.rentabilidadMesUSD ?? currentYieldData.rentabilidadMes ?? 0) + 1),
        dateInfo: currentYieldData.mes
      }
    ]);
  }, []);
return newYields;
}

const chartDataBuffer = {}

const updateAllYieldsInfoFor = async (
  {
    chartId,
    displayCurrency,
    lastMonthTextId,
    lastYearTextId,
    historicTextId
  },
  { 
    year,
    month,
    risk,
    portfolioType,
    typeUniverse
  }
) => {
  const clpKey = 'rentabilidadMesCLP';
  const usdKey = 'rentabilidadMesUSD';
  const currencyKey = displayCurrency === 'CLP' ? clpKey : usdKey;
  const response = await getYieldsFor({
    portfolioType,
    year,
    month,
    risk,
    typeUniverse
  });
  const yields = response.yields;
  const lastTwelveYields = yields.slice(-12);
  const lastMonthYield = yields.at(-1)[currencyKey];
  const lastYearYield = getTotalYield(currencyKey)(lastTwelveYields);
  const historicYield = getTotalYield(currencyKey)(yields);
  const accumulatedYields = calculateAccumulatedYieldsFrom(yields);
  if (lastMonthTextId) document.getElementById(lastMonthTextId).textContent = String(asPercentage(lastMonthYield + 1));
  if (lastYearTextId) document.getElementById(lastYearTextId).textContent = String(asPercentage(lastYearYield));
  if (historicTextId) document.getElementById(historicTextId).textContent = String(asPercentage(historicYield));
  chartDataBuffer[chartId] = { displayCurrency, accumulatedYields};
  drawChart(chartId, chartDataBuffer[chartId]);
}

const drawAllChartsFromBuffer = () => {
  Object.keys(chartDataBuffer).forEach((chartId) => {
    drawChart(chartId, chartDataBuffer[chartId]);
  });
}
