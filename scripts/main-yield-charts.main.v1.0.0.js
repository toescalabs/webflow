const MOTNHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago','Sept', 'Oct', 'Nov', 'Dic']
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
const getYield = (dataArrays) => (yieldType) => (portfolioType) => ({
  annual: numberToPercent(dataArrays[portfolioType]['1a'].at(-1)[1]),
  accumulated: numberToPercent(dataArrays[portfolioType].max.at(-1)[1]),
  last: numberToPercent(dataArrays[portfolioType].max.at(-1)[1] / dataArrays[portfolioType].max.at(-2)[1])
  })[yieldType];

const sleep = m => new Promise(r => setTimeout(r, m))

const assignToElementIfPossible = (elementId, value) => {
  if (document.getElementById(elementId)?.textContent) {
    document.getElementById(elementId).textContent = value;
  }
}
function updateBottomYieldDetails(dataArrays) {
  assignToElementIfPossible('wallet-accum-yield', getYield(dataArrays)('accumulated')('wallet'));
  assignToElementIfPossible('wallet-last-yield', getYield(dataArrays)('last')('wallet'));
  assignToElementIfPossible('wallet-annual-yield', getYield(dataArrays)('annual')('wallet'));

  assignToElementIfPossible('smart-conservative-accum-yield', getYield(dataArrays)('accumulated')('smartConservative'));
  assignToElementIfPossible('smart-conservative-last-yield', getYield(dataArrays)('last')('smartConservative'));
  assignToElementIfPossible('smart-conservative-annual-yield', getYield(dataArrays)('annual')('smartConservative'));
  assignToElementIfPossible('smart-moderate-accum-yield', getYield(dataArrays)('accumulated')('smartModerate'));
  assignToElementIfPossible('smart-moderate-last-yield', getYield(dataArrays)('last')('smartModerate'));
  assignToElementIfPossible('smart-moderate-annual-yield', getYield(dataArrays)('annual')('smartModerate'));
  assignToElementIfPossible('smart-risky-accum-yield', getYield(dataArrays)('accumulated')('smartRisky'));
  assignToElementIfPossible('smart-risky-annual-yield', getYield(dataArrays)('annual')('smartRisky'));
  assignToElementIfPossible('smart-risky-last-yield', getYield(dataArrays)('last')('smartRisky'));

  assignToElementIfPossible('template-tech-accum-yield', getYield(dataArrays)('accumulated')('templateTech'));
  assignToElementIfPossible('template-tech-annual-yield', getYield(dataArrays)('annual')('templateTech'));
  assignToElementIfPossible('template-tech-last-yield', getYield(dataArrays)('last')('templateTech'));
  assignToElementIfPossible('template-green-accum-yield', getYield(dataArrays)('accumulated')('templateGreen'));
  assignToElementIfPossible('template-green-annual-yield', getYield(dataArrays)('annual')('templateGreen'));
  assignToElementIfPossible('template-green-last-yield', getYield(dataArrays)('last')('templateGreen'));
  assignToElementIfPossible('template-crypto-accum-yield', getYield(dataArrays)('accumulated')('templateCrypto'));
  assignToElementIfPossible('template-crypto-annual-yield', getYield(dataArrays)('annual')('templateCrypto'));
  assignToElementIfPossible('template-crypto-last-yield', getYield(dataArrays)('last')('templateCrypto'));
  assignToElementIfPossible('template-bonds-accum-yield', getYield(dataArrays)('accumulated')('templateBonds'));
  assignToElementIfPossible('template-bonds-annual-yield', getYield(dataArrays)('annual')('templateBonds'));
  assignToElementIfPossible('template-bonds-last-yield', getYield(dataArrays)('last')('templateBonds'));
  assignToElementIfPossible('template-equity-accum-yield', getYield(dataArrays)('accumulated')('templateEquity'));
  assignToElementIfPossible('template-equity-annual-yield', getYield(dataArrays)('annual')('templateEquity'));
  assignToElementIfPossible('template-equity-last-yield', getYield(dataArrays)('last')('templateEquity'));
}

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
  templateTech: { max: [], '1a': []},
  templateGreen: { max: [], '1a': []},
  templateCrypto: { max: [], '1a': []},
  templateBonds: { max: [], '1a': []},
  templateEquity: { max: [], '1a': []},
};

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
  drawChart('linechart_material-smart-template-equity', dataArrays.templateEquity.max, options);

}
const amountByPeriodTime = {
'max': 10000000,
'1a': 12,
}
getIndexOfDataArrayBy = (periodTime) => (dataArray) => ({
'max': dataArray.length - amountByPeriodTime['max'],
'1a': dataArray.length - amountByPeriodTime['1a']
})[periodTime];

const hasAnyEmptyDataArray = () => Object.values(Object.values(dataArrays)).some(dataArray => dataArray.length == 0);

var refreshDataPending = true;

async function drawCharts(selectedPeriod = 'max') {
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
      ]).then((results) => {
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
        dataArrays.templateEquity.max = results[8].length ? calculateAccumYieldsFor(results[8]) : [1];
        dataArrays.templateEquity['1a'] = results[8].length ? calculateAccumYieldsFor(results[8], getIndexOfDataArrayBy('1a')(results[8])) : [1];

      }).then(() => {
        drawChartsWithData(selectedPeriod);
        updateBottomYieldDetails(dataArrays);
      })
      drawChartsWithData(selectedPeriod)
      updateBottomYieldDetails(dataArrays)
    }
  await sleep(10);
  drawChartsWithData(selectedPeriod);
  updateBottomYieldDetails(dataArrays);
}