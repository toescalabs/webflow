google.charts.load('current', {'packages':['corechart']});

const DEFAULT_URL = `https://91o7sqo7s3.execute-api.us-east-1.amazonaws.com/prod/`
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

const getRentArrayWith = async (
  { year= '2023',
    month='01',
    risk=1,
    portfolioType,
    typeUniverse
  }) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const routeParam = portfolioType === 'wallet' ? 'walletYields' : 'recommendationYields';
  const url = `${DEFAULT_URL}${routeParam}`;
  var data = JSON.stringify({"year": year,"month": month,"risk": risk, typeUniverse});
  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: data,
    redirect: 'follow'
  };
  return fetch(url, requestOptions)
    .then(response => response.json())
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
const drawChart = (containerId, dataArray, options) =>{
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
  const response = await getRentArrayWith({ year, month, risk, portfolioType, typeUniverse });
  const yields = response.yields;
  const lastTwelveYields = yields.slice(-12);
  const lastYearYield = getTotalYield(lastTwelveYields);
  const lastMonthYield = yields.at(-1).rentabilidadMes;
  const historicYield = getTotalYield(yields);
  const accumulatedYields = calculateAccumulatedYieldsFrom(yields);
  document.getElementById(lastMonthTextId).textContent = String(asPercentage(lastMonthYield + 1));
  document.getElementById(lastYearTextId).textContent = String(asPercentage(lastYearYield));
  document.getElementById(historicTextId).textContent = String(asPercentage(historicYield));
  console.log(chartId, accumulatedYields, options)
  drawChart(chartId, accumulatedYields, options);
}