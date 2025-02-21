google.charts.load('current', {'packages':['corechart']});

const nationalStocksYields = {
  "yields": [
    {
      "Perfil": 6.0,
      "rentabilidadMesCLP": 0.0644042156250317,
      "mes": "2024-09"
    },
    {
      "Perfil": 6.0,
      "rentabilidadMesCLP": 0.0128425815314861,
      "mes": "2024-10"
    },
    {
      "Perfil": 6.0,
      "rentabilidadMesCLP": 0.00476704918407012,
      "mes": "2024-11"
    },
    {
      "Perfil": 6.0,
      "rentabilidadMesCLP": 0.0284704818458175,
      "mes": "2024-12"
    },
    {
      "Perfil": 6.0,
      "rentabilidadMesCLP": 0.0590570239918173,
      "mes": "2025-01"
    }
  ]
}

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
  if (portfolioType === 'harryIpsa') return nationalStocksYields;
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
        accYieldCLP: previousYieldCLP * ((currentYieldData.rentabilidadMesCLP ?? currentYieldData.rentabilidadMes) + 1),
        accYieldUSD: previousYieldUSD * ((currentYieldData.rentabilidadMesUSD ?? currentYieldData.rentabilidadMes) + 1),
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
  const clpKey = portfolioType === 'wallet' ? 'rentabilidadMesCLP' : 'rentabilidadMesCLP';
  const usdKey = portfolioType === 'wallet' ? 'rentabilidadMesUSD' :'rentabilidadMesUSD';
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

const defaultData = {
  year: '2023',
  month: '01',
  portfolioType: 'smart'
}

const onLoad = () => {
  updateAllYieldsInfoFor({
      chartId: 'wallet-chart',
      displayCurrency: 'CLP',
      lastMonthTextId: 'wallet-last-month-yield',
      lastYearTextId: 'wallet-anual-yield',
      historicTextId: 'wallet-historical-yield'
  }, {
    ...defaultData,
     portfolioType: 'wallet'
    })
    
   updateAllYieldsInfoFor({
      chartId: 'chile-smart-fund-chart',
      displayCurrency: 'CLP',
      lastMonthTextId: 'chile-smart-fund-last-month-yield',
      lastYearTextId: 'chile-smart-fund-anual-yield',
      historicTextId: 'chile-smart-fund-historical-yield'
  }, {
    ...defaultData,
     portfolioType: 'harryIpsa'
    })
  updateAllYieldsInfoFor({
    chartId: 'smart-conservative-chart-clp',
    displayCurrency: 'CLP',
    lastMonthTextId: 'smart-conservative-last-month-yield-clp',
    lastYearTextId: 'smart-conservative-last-year-yield-clp',
    historicTextId: 'smart-conservative-historic-yield-clp'
  }, {...defaultData, risk: 2})

  updateAllYieldsInfoFor({
    chartId: 'smart-conservative-chart-usd',
    displayCurrency: 'USD',
    lastMonthTextId: 'smart-conservative-last-month-yield-usd',
    lastYearTextId: 'smart-conservative-last-year-yield-usd',
    historicTextId: 'smart-conservative-historic-yield-usd'
  }, {...defaultData, risk: 2})

  updateAllYieldsInfoFor({
    chartId: 'smart-moderate-chart-clp',
    displayCurrency: 'CLP',
    lastMonthTextId: 'smart-moderate-last-month-yield-clp',
    lastYearTextId: 'smart-moderate-last-year-yield-clp',
    historicTextId: 'smart-moderate-historic-yield-clp'
  }, {...defaultData, risk: 4})

  updateAllYieldsInfoFor({
    chartId: 'smart-moderate-chart-usd',
    displayCurrency: 'USD',
    lastMonthTextId: 'smart-moderate-last-month-yield-usd',
    lastYearTextId: 'smart-moderate-last-year-yield-usd',
    historicTextId: 'smart-moderate-historic-yield-usd'
  }, {...defaultData, risk: 4})

  updateAllYieldsInfoFor({
    chartId: 'smart-risky-chart-clp',
    displayCurrency: 'CLP',
    lastMonthTextId: 'smart-risky-last-month-yield-clp',
    lastYearTextId: 'smart-risky-last-year-yield-clp',
    historicTextId: 'smart-risky-historic-yield-clp'
  }, {...defaultData, risk: 6})

  updateAllYieldsInfoFor({
    chartId: 'smart-risky-chart-usd',
    displayCurrency: 'USD',
    lastMonthTextId: 'smart-risky-last-month-yield-usd',
    lastYearTextId: 'smart-risky-last-year-yield-usd',
    historicTextId: 'smart-risky-historic-yield-usd'
  }, {...defaultData, risk: 6})

  updateAllYieldsInfoFor({
    chartId: 'template-crypto-chart-clp',
    displayCurrency: 'CLP',
    lastMonthTextId: 'template-crypto-last-month-yield-clp',
    lastYearTextId: 'template-crypto-last-year-yield-clp',
    historicTextId: 'template-crypto-historic-yield-clp'
  }, {...defaultData, typeUniverse: 'cryptoThematicUniverse', risk: 6})

  updateAllYieldsInfoFor({
    chartId: 'template-crypto-chart-usd',
    displayCurrency: 'USD',
    lastMonthTextId: 'template-crypto-last-month-yield-usd',
    lastYearTextId: 'template-crypto-last-year-yield-usd',
    historicTextId: 'template-crypto-historic-yield-usd'
  }, {...defaultData, typeUniverse: 'cryptoThematicUniverse', risk: 6})

  updateAllYieldsInfoFor({
    chartId: 'template-green-chart-clp',
    displayCurrency: 'CLP',
    lastMonthTextId: 'template-green-last-month-yield-clp',
    lastYearTextId: 'template-green-last-year-yield-clp',
    historicTextId: 'template-green-historic-yield-clp'
  }, {...defaultData, typeUniverse: 'greenThematicUniverse', risk: 6})

  updateAllYieldsInfoFor({
    chartId: 'template-green-chart-usd',
    displayCurrency: 'USD',
    lastMonthTextId: 'template-green-last-month-yield-usd',
    lastYearTextId: 'template-green-last-year-yield-usd',
    historicTextId: 'template-green-historic-yield-usd'
  }, {...defaultData, typeUniverse: 'greenThematicUniverse', risk: 6})

  updateAllYieldsInfoFor({
    chartId: 'template-tech-chart-clp',
    displayCurrency: 'CLP',
    lastMonthTextId: 'template-tech-last-month-yield-clp',
    lastYearTextId: 'template-tech-last-year-yield-clp',
    historicTextId: 'template-tech-historic-yield-clp'
  }, {...defaultData, typeUniverse: 'techThematicUniverse', risk: 6})

  updateAllYieldsInfoFor({
    chartId: 'template-tech-chart-usd',
    displayCurrency: 'USD',
    lastMonthTextId: 'template-tech-last-month-yield-usd',
    lastYearTextId: 'template-tech-last-year-yield-usd',
    historicTextId: 'template-tech-historic-yield-usd'
  }, {...defaultData, typeUniverse: 'techThematicUniverse', risk: 6})

  updateAllYieldsInfoFor({
    chartId: 'template-equity-chart-clp',
    displayCurrency: 'CLP',
    lastMonthTextId: 'template-equity-last-month-yield-clp',
    lastYearTextId: 'template-equity-last-year-yield-clp',
    historicTextId: 'template-equity-historic-yield-clp'
  }, {...defaultData, risk: 6})

  updateAllYieldsInfoFor({
    chartId: 'template-equity-chart-usd',
    displayCurrency: 'USD',
    lastMonthTextId: 'template-equity-last-month-yield-usd',
    lastYearTextId: 'template-equity-last-year-yield-usd',
    historicTextId: 'template-equity-historic-yield-usd'
  }, {...defaultData, risk: 6})

  updateAllYieldsInfoFor({
    chartId: 'template-bonds-chart-clp',
    displayCurrency: 'CLP',
    lastMonthTextId: 'template-bonds-last-month-yield-clp',
    lastYearTextId: 'template-bonds-last-year-yield-clp',
    historicTextId: 'template-bonds-historic-yield-clp'
  }, {...defaultData, risk: 1})

  updateAllYieldsInfoFor({
    chartId: 'template-bonds-chart-usd',
    displayCurrency: 'USD',
    lastMonthTextId: 'template-bonds-last-month-yield-usd',
    lastYearTextId: 'template-bonds-last-year-yield-usd',
    historicTextId: 'template-bonds-historic-yield-usd'
  }, {...defaultData, risk: 1})

  updateAllYieldsInfoFor({
    chartId: 'template-mid-risk-chart-clp',
    displayCurrency: 'CLP',
    lastMonthTextId: 'template-mid-risk-last-month-yield-clp',
    lastYearTextId: 'template-mid-risk-last-year-yield-clp',
    historicTextId: 'template-mid-risk-historic-yield-clp'
  }, {...defaultData, risk: 3})

  updateAllYieldsInfoFor({
    chartId: 'template-mid-risk-chart-usd',
    displayCurrency: 'USD',
    lastMonthTextId: 'template-mid-risk-last-month-yield-usd',
    lastYearTextId: 'template-mid-risk-last-year-yield-usd',
    historicTextId: 'template-mid-risk-historic-yield-usd'
  }, {...defaultData, risk: 3})
}

onLoad();
drawAllChartsFromBuffer();

const tabs = document.getElementsByClassName("hld---pc-tab")

const sleep = m => new Promise(r => setTimeout(r, m))
for(let i = 0; i < tabs.length; i++) {
	tabs[i].onclick = async () => {
    await sleep(200) // wait for div to be displayed
  	drawAllChartsFromBuffer()
 
  }
}