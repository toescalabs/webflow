google.charts.load('current', {'packages':['corechart']});
const MOTNHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago','Sept', 'Oct', 'Nov', 'Dic']
const calculateAccumYieldsFor = (dataArray, initialMonth = 0) => {
const selectedYields = dataArray.slice(initialMonth);
const newYields = selectedYields.reduce((acc, currentYield) => {
const previousYield = acc.length ? acc.at(-1)[1] : 1;
return acc.concat([[currentYield[0], previousYield * (currentYield[1] + 1)]]);
}, []);
return newYields;
}
var walletDefaultDataArray = [
["Ene 2023", 0.011152 ], 
["Feb 2023", 0.009857 ], 
["Mar 2023", 0.009968 ], 
["Abr 2023", 0.011129 ],
["May 2023", 0.010774 ],
["Jun 2023", 0.009742 ], 
["Jul 2023", 0.009549 ]
];
var walletAccumDefaultDataArray = calculateAccumYieldsFor(walletDefaultDataArray);
var smartConservativeDefaultDataArray = [
["Ene 2023", 0.027969],
["Feb 2023", -0.019099],
["Mar 2023", 0.029225],
["Abr 2023", 0.001307],
["May 2023", 0.006822],
["Jun 2023", 0.004745],
["Jul 2023", 0.008431]
];
var smartConservativeAccumDefaultDataArray = calculateAccumYieldsFor(smartConservativeDefaultDataArray);
var smartModerateDefaultDataArray = [
["Ene 2023", 0.054134],
["Feb 2023", -0.030147],
["Mar 2023", 0.048235],
["Abr 2023", -0.000339],
["May 2023", 0.020395],
["Jun 2023", 0.010402],
["Jul 2023", 0.011141]
];
var smartModerateAccumDefaultDataArray = calculateAccumYieldsFor(smartModerateDefaultDataArray);
var smartRiskyDefaultDataArray = [
["Ene 2023", 0.096563],
["Feb 2023", -0.042248],
["Mar 2023", 0.0677],
["Abr 2023", 0.00321],
["May 2023", 0.04007],
["Jun 2023", 0.038507],
["Jul 2023", 0.019701]
];
var smartRiskyAccumDefaultDataArray = calculateAccumYieldsFor(smartRiskyDefaultDataArray);
var dataArrays = {
wallet: { max: walletAccumDefaultDataArray, '1a': walletAccumDefaultDataArray },
smartConservative: { max: smartConservativeAccumDefaultDataArray, '1a': smartConservativeAccumDefaultDataArray },
smartModerate: { max: smartModerateAccumDefaultDataArray, '1a': smartModerateAccumDefaultDataArray},
smartRisky: { max: smartRiskyAccumDefaultDataArray, '1a': smartRiskyAccumDefaultDataArray},
templateTech: { max: 0, '1a': []},
templateGreen: { max: 0, '1a': []},
templateCrypto: { max: 0, '1a': []},
templateBonds: { max: 0, '1a': []},
templatesEquity: { max: 0, '1a': []},
};
var walletSelectedPeriod = 'max';
var refreshDataPending = true;
var options = {
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
const numberToPercent = (number) => ((number - 1) * 100).toFixed(2) + '%';
const mapAsDataArray = ({yields}) => yields.reduce((accData, yieldData) => {
const [year, month] = yieldData.mes.split('-');
const monthString = MOTNHS[Number(month) - 1];
return accData.concat([[`${monthString} ${year}`, yieldData.rentabilidadMes]])
}, []);
const getRentArrayWith = async ({year= '2023',month='01',risk=1,portfolio, typeUniverse}) => {
  const url = `https://91o7sqo7s3.execute-api.us-east-1.amazonaws.com/prod/${portfolio}Yields`
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  var raw = JSON.stringify({"year": year,"month": month,"risk": risk, typeUniverse});
  var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};
return fetch(url, requestOptions).then(response => response.json()).then(mapAsDataArray)
};
const mapExtractingPercentages = (dataArray) => dataArray.map(data => ([data[0], (data[1] - 1) * 100]))
const startingPoint = ["", 0];
const mapExtractingPercentagesWithTooltipInfo = (dataArray) => dataArray.map((data, index)=>([	
  data[0],
  (data[1] - 1) * 100,
  `Rentabilidad acumulada: ${numberToPercent(data[1])} \n
    Rentabilidad mensual: ${numberToPercent((data[1] / (dataArray[index - 1]?.[1] ?? 1 )))}`,
  ]))
const getYield = (yieldType) => (portfolioType) => ({
  annual: numberToPercent(dataArrays[portfolioType]['1a'].at(-1)[1]),
  accumulated: numberToPercent(dataArrays[portfolioType].max.at(-1)[1]),
  last: numberToPercent(dataArrays[portfolioType].max.at(-1)[1] / dataArrays[portfolioType].max.at(-2)[1])
  })[yieldType];
const sleep = m => new Promise(r => setTimeout(r, m))
function updateBottomYieldDetails() {
  document.getElementById('wallet-accum-yield').textContent = getYield('accumulated')('wallet');
  document.getElementById('wallet-last-yield').textContent = getYield('last')('wallet');
  document.getElementById('wallet-annual-yield').textContent = getYield('annual')('wallet');

  document.getElementById('smart-conservative-accum-yield').textContent = getYield('accumulated')('smartConservative');
  document.getElementById('smart-conservative-last-yield').textContent = getYield('last')('smartConservative');
  document.getElementById('smart-conservative-annual-yield').textContent = getYield('annual')('smartConservative');
  document.getElementById('smart-moderate-accum-yield').textContent = getYield('accumulated')('smartModerate');
  document.getElementById('smart-moderate-last-yield').textContent = getYield('last')('smartModerate');
  document.getElementById('smart-moderate-annual-yield').textContent = getYield('annual')('smartModerate');
  document.getElementById('smart-risky-accum-yield').textContent = getYield('accumulated')('smartRisky');
  document.getElementById('smart-risky-annual-yield').textContent = getYield('annual')('smartRisky');
  document.getElementById('smart-risky-last-yield').textContent = getYield('last')('smartRisky');

  document.getElementById('template-tech-accum-yield').textContent = getYield('accumulated')('templateTech');
  document.getElementById('template-tech-annual-yield').textContent = getYield('annual')('templateTech');
  document.getElementById('template-tech-last-yield').textContent = getYield('last')('templateTech');
  document.getElementById('template-green-accum-yield').textContent = getYield('accumulated')('templateGreen');
  document.getElementById('template-green-annual-yield').textContent = getYield('annual')('templateGreen');
  document.getElementById('template-green-last-yield').textContent = getYield('last')('templateGreen');
  document.getElementById('template-crypto-accum-yield').textContent = getYield('accumulated')('templateCrypto');
  document.getElementById('template-crypto-annual-yield').textContent = getYield('annual')('templateCrypto');
  document.getElementById('template-crypto-last-yield').textContent = getYield('last')('templateCrypto');
  document.getElementById('template-bonds-accum-yield').textContent = getYield('accumulated')('templateBonds');
  document.getElementById('template-bonds-annual-yield').textContent = getYield('annual')('templateBonds');
  document.getElementById('template-bonds-last-yield').textContent = getYield('last')('templateBonds');
  document.getElementById('template-equity-accum-yield').textContent = getYield('accumulated')('templatesEquity');
  document.getElementById('template-equity-annual-yield').textContent = getYield('annual')('templatesEquity');
  document.getElementById('template-equity-last-yield').textContent = getYield('last')('templatesEquity');
}

function createDataTable(dataArray) {
  var dataTable = new google.visualization.DataTable();
  dataTable.addColumn('string');
  dataTable.addColumn('number');
  dataTable.addColumn({type: 'string', role: 'tooltip'});
  dataTable.addRows(mapExtractingPercentagesWithTooltipInfo(dataArray));
  return dataTable;
}
function drawChart(containerId, dataArray, options) {
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
function drawChartsWithData() {
  drawChart('linechart_material-wallet', dataArrays.wallet.max, options);

  drawChart('linechart_material-smart-conservative', dataArrays.smartConservative.max, options);
  drawChart('linechart_material-smart-moderate', dataArrays.smartModerate.max, options);
  drawChart('linechart_material-smart-risky', dataArrays.smartRisky.max, options);

  drawChart('linechart_material-smart-template-tech', dataArrays.templateTech.max, options);
  drawChart('linechart_material-smart-template-green', dataArrays.templateGreen.max, options);
  drawChart('linechart_material-smart-template-crypto', dataArrays.templateCrypto.max, options);
  drawChart('linechart_material-smart-template-bonds', dataArrays.templateBonds.max, options);
  drawChart('linechart_material-smart-template-equity', dataArrays.templatesEquity.max, options);

}
const amountByPeriodTime = {
'max': 10000000,
'1a': 12,
}
const getIndexOfDataArrayBy = (periodTime) => (dataArray) => ({
  'max': dataArray.length - amountByPeriodTime['max'],
  '1a': dataArray.length - amountByPeriodTime['1a']
})[periodTime];

const hasAnyEmptyDataArray = () => Object.values(Object.values(dataArrays)).some(dataArray => dataArray.length == 0);
async function drawCharts(selectedPeriod = 'max') {
  console.log(hasAnyEmptyDataArray());
  if ( refreshDataPending || hasAnyEmptyDataArray()){
  refreshDataPending = false
  Promise.all([
    getRentArrayWith({portfolio: 'wallet'}),
    getRentArrayWith({portfolio: 'recommendation', risk: 2}),
    getRentArrayWith({portfolio: 'recommendation', risk: 4}),
    getRentArrayWith({portfolio: 'recommendation', risk: 6}),
    getRentArrayWith({portfolio: 'recommendation', risk: 6, typeUniverse: 'techThematicUniverse'}),
    getRentArrayWith({portfolio: 'recommendation', risk: 6, typeUniverse: 'greenThematicUniverse'}),
    getRentArrayWith({portfolio: 'recommendation', risk: 6, typeUniverse: 'cryptoThematicUniverse'}),
    getRentArrayWith({portfolio: 'recommendation', risk: 1}),
    getRentArrayWith({portfolio: 'recommendation', risk: 6})
  ]
).then((results) => {
  dataArrays.wallet.max = results[0].length ? calculateAccumYieldsFor(results[0]) : walletAccumDefaultDataArray;
  dataArrays.wallet['1a'] = results[0].length ? calculateAccumYieldsFor(results[0], getIndexOfDataArrayBy('1a')(results[0])) : walletAccumDefaultDataArray;

  dataArrays.smartConservative.max = results[1].length ? calculateAccumYieldsFor(results[1]) : smartConservativeAccumDefaultDataArray;
  dataArrays.smartConservative['1a'] = results[1].length ? calculateAccumYieldsFor(results[1], getIndexOfDataArrayBy('1a')(results[1])) : smartConservativeAccumDefaultDataArray;
  dataArrays.smartModerate.max = results[2].length ? calculateAccumYieldsFor(results[2]) : smartModerateAccumDefaultDataArray;
  dataArrays.smartModerate['1a'] = results[2].length ? calculateAccumYieldsFor(results[2], getIndexOfDataArrayBy('1a')(results[2])) : smartModerateAccumDefaultDataArray;
  dataArrays.smartRisky.max = results[3].length ? calculateAccumYieldsFor(results[3]) : smartRiskyAccumDefaultDataArray;
  dataArrays.smartRisky['1a'] = results[3].length ? calculateAccumYieldsFor(results[3], getIndexOfDataArrayBy('1a')(results[3])) : smartRiskyAccumDefaultDataArray;

  dataArrays.templateTech.max = results[4].length ? calculateAccumYieldsFor(results[4]) : [1];
  dataArrays.templateTech['1a'] = results[4].length ? calculateAccumYieldsFor(results[4], getIndexOfDataArrayBy('1a')(results[4])) : [1];
  dataArrays.templateGreen.max = results[5].length ? calculateAccumYieldsFor(results[5]) : [1];
  dataArrays.templateGreen['1a'] = results[5].length ? calculateAccumYieldsFor(results[5], getIndexOfDataArrayBy('1a')(results[5])) : [1];
  dataArrays.templateCrypto.max = results[6].length ? calculateAccumYieldsFor(results[6]) : [1];
  dataArrays.templateCrypto['1a'] = results[6].length ? calculateAccumYieldsFor(results[6], getIndexOfDataArrayBy('1a')(results[6])) : [1];
  dataArrays.templateBonds.max = results[7].length ? calculateAccumYieldsFor(results[7]) : [1];
  dataArrays.templateBonds['1a'] = results[7].length ? calculateAccumYieldsFor(results[7], getIndexOfDataArrayBy('1a')(results[7])) : [1];
  dataArrays.templatesEquity.max = results[8].length ? calculateAccumYieldsFor(results[8]) : [1];
  dataArrays.templatesEquity['1a'] = results[8].length ? calculateAccumYieldsFor(results[8], getIndexOfDataArrayBy('1a')(results[8])) : [1];
}).then(() => {
  drawChartsWithData(selectedPeriod);
  updateBottomYieldDetails();
})
  drawChartsWithData(selectedPeriod)
  updateBottomYieldDetails()
}
await sleep(10);
  drawChartsWithData(selectedPeriod);
  updateBottomYieldDetails();
}
const tabs = document.getElementsByClassName("w-tab-link")
for(let i = 0; i < tabs.length; i++) {
  tabs[i].onclick = async () => {drawCharts()}
}
google.charts.setOnLoadCallback(drawCharts);