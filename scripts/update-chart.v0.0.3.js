google.charts.load('current', {'packages':['corechart']});

const nationalStocksYields = {
  "yields": [
    {
        "Perfil": 6.0,
        "rentabilidadMesCLP": 0.06450688699493035,
        "mes": "2024-09"
    },
    {
        "Perfil": 6.0,
        "rentabilidadMesCLP": 0.0088794,
        "mes": "2024-10"
    },
    {
        "Perfil": 6.0,
        "rentabilidadMesCLP": 0.0053629,
        "mes": "2024-11"
    },
    {
        "Perfil": 6.0,
        "rentabilidadMesCLP": 0.0360834,
        "mes": "2024-12"
    }
  ]
}

const BASE_URL = 'https://91o7sqo7s3.execute-api.us-east-1.amazonaws.com/prod';

const buildQueryString = (queryObject) => Object.entries(queryObject)
  .filter(([_, value]) => !!value)
  .map(([key, value]) => `${key}=${value}`)
  .join('&');

const buildPathBy = (portfolioType) => ({
  harryIpsa: 'harryIpsaYields',
  wallet: 'walletYields',
  smart: 'recommendationYields',
}[portfolioType]);

const fetchDataApi = ({
  portfolioType,
  year,
  month,
  risk,
  typeUniverse
}) => {
  if (portfolioType === 'harryIpsa') return nationalStocksYields; // TODO: fetch this from the API

  const url = `${BASE_URL}/${buildPathBy(portfolioType)}?${buildQueryString({ year, month, risk, typeUniverse })}`

  const requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };

  return fetch(url, requestOptions).then(response => response.json())
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago','Sept', 'Oct', 'Nov', 'Dic']
const options = {
  width: '100%',
  height: 250,
  colors: ['#25D16A'],
  maintainAspectRatio: false,
  legend: {
    position:'none'
  },
  vAxis: {
    format: "#.##'%'",
    textStyle:{color: '#74797f'}
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
};

const numberToPercent = (number) => ((number) * 100).toFixed(2) + '%';

const mapExtractingPercentagesWithTooltipInfo = (accumulatedYields) => accumulatedYields.
map(
  (data, index)=> {
    const [year, month] = data.dateInfo.split('-');
    const monthString = MONTHS[Number(month) - 1];
    return [
      `${monthString} ${year}`,
      (data.accYield - 1) * 100,
      `Rentabilidad acumulada: ${numberToPercent(data.accYield - 1)} \n
        Rentabilidad mensual: ${numberToPercent((data.accYield / (accumulatedYields[index - 1]?.[1] ?? 1 )) - 1)}`,
    ]
  }
)

const createDataTable = (accumulatedYields) => {
  var dataTable = new google.visualization.DataTable();
  dataTable.addColumn('string');
  dataTable.addColumn('number');
  dataTable.addColumn({type: 'string', role: 'tooltip'});
  dataTable.addRows(mapExtractingPercentagesWithTooltipInfo(accumulatedYields));
  return dataTable;
}

const drawChart = (containerId, dataArray, options) => {
  const container = document.getElementById(containerId);
  if (container) {
    const dataTable = createDataTable(dataArray);
    const chartWrapper = new google.visualization.ChartWrapper({
      chartType: 'LineChart',
      dataTable: dataTable,
      options: options,
      containerId: containerId
    });
    chartWrapper.draw();
  }
}

const getTotalYield = (yields) => yields.reduce((accYield, {rentabilidadMes}) => (1 + rentabilidadMes) * accYield , 1);
const asPercentage = (yieldData) => ((yieldData - 1) * 100).toFixed(2) + '%';

const calculateAccumulatedYieldsFrom = (yields) => {
  const newYields = yields.reduce((acc, currentYieldData) => {
    const previousYield = acc.length ? acc.at(-1).accYield : 1;
    return acc.concat([
      {
        accYield: previousYield * (currentYieldData.rentabilidadMes + 1),
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
    lastMonthTextId,
    lastYearTextId,
    historicTextId
  },
  { year,
    month,
    risk,
    portfolioType,
    typeUniverse
  }
) => {
  const response = await fetchDataApi({ portfolioType, year, month, risk, typeUniverse });
  const yields = response.yields;
  const lastTwelveYields = yields.slice(-12);
  const lastYearYield = getTotalYield(lastTwelveYields);
  const lastMonthYield = yields.at(-1).rentabilidadMes;
  const historicYield = getTotalYield(yields);
  const accumulatedYields = calculateAccumulatedYieldsFrom(yields);
  document.getElementById(lastMonthTextId).textContent = String(asPercentage(lastMonthYield + 1));
  document.getElementById(lastYearTextId).textContent = String(asPercentage(lastYearYield));
  document.getElementById(historicTextId).textContent = String(asPercentage(historicYield));
  chartDataBuffer[chartId] = accumulatedYields;
  drawChart(chartId, accumulatedYields, options);
}

const drawAllChartsFromBuffer = () => {
  Object.keys(chartDataBuffer).forEach((chartId) => {
    drawChart(chartId, chartDataBuffer[chartId], options);
  });
}
