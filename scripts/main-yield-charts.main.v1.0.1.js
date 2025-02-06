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

const MOTNHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago','Sept', 'Oct', 'Nov', 'Dic']

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

const numberToPercent = (number) => ((number - 1) * 100).toFixed(2) + '%';

const mapAsDataArray = ({yields}) => yields.reduce((accData, yieldData) => {
  const [year, month] = yieldData.mes.split('-');
  const monthString = MOTNHS[Number(month) - 1];
  return accData.concat([[`${monthString} ${year}`, yieldData.rentabilidadMes]])
}, []);

const getYieldsArrayFor = async ({
  year= '2023',
  month='01',
  risk=1,
  portfolio,
  typeUniverse,
}) => fetchDataApi({
  year,
  month,
  risk,
  portfolio,
  typeUniverse
}).then(mapAsDataArray);

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

const toCamelCase = (str) => str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

const updateYieldsFor = type => {
  assignToElementIfPossible(`${type}-accum-yield`, getYield(dataArrays)('accumulated')(toCamelCase(type)));
  assignToElementIfPossible(`${type}-last-yield`, getYield(dataArrays)('last')(toCamelCase(type)));
  assignToElementIfPossible(`${type}-annual-yield`, getYield(dataArrays)('annual')(toCamelCase(type)));
}

const updateBottomYieldDetails = (dataArrays) => {
  updateYieldsFor('wallet');
  updateYieldsFor('smart-conservative');
  updateYieldsFor('smart-moderate');
  updateYieldsFor('smart-risky');
  updateYieldsFor('template-tech');
  updateYieldsFor('template-green');
  updateYieldsFor('template-crypto');
  updateYieldsFor('template-bonds');
  updateYieldsFor('template-equity');
}

const calculateAccumYieldsFor = (dataArray, initialMonth = 0) => {
  const selectedYields = dataArray.slice(initialMonth);
  const newYields = selectedYields.reduce((acc, currentYield) => {
    const previousYield = acc.length ? acc.at(-1)[1] : 1;
    return acc.concat([[currentYield[0], previousYield * (currentYield[1] + 1)]]);
  }, []);
  return newYields;
}

const walletDefaultDataArray = [
["Ene 2023", 0.011152 ],
["Feb 2023", 0.009857 ],
["Mar 2023", 0.009968 ],
["Abr 2023", 0.011129 ],
["May 2023", 0.010774 ],
["Jun 2023", 0.009742 ],
["Jul 2023", 0.009549 ]
];
const walletAccumDefaultDataArray = calculateAccumYieldsFor(walletDefaultDataArray);
const smartConservativeDefaultDataArray = [
["Ene 2023", 0.027969],
["Feb 2023", -0.019099],
["Mar 2023", 0.029225],
["Abr 2023", 0.001307],
["May 2023", 0.006822],
["Jun 2023", 0.004745],
["Jul 2023", 0.008431]
];
const smartConservativeAccumDefaultDataArray = calculateAccumYieldsFor(smartConservativeDefaultDataArray);
const smartModerateDefaultDataArray = [
["Ene 2023", 0.054134],
["Feb 2023", -0.030147],
["Mar 2023", 0.048235],
["Abr 2023", -0.000339],
["May 2023", 0.020395],
["Jun 2023", 0.010402],
["Jul 2023", 0.011141]
];
const smartModerateAccumDefaultDataArray = calculateAccumYieldsFor(smartModerateDefaultDataArray);
const smartRiskyDefaultDataArray = [
["Ene 2023", 0.096563],
["Feb 2023", -0.042248],
["Mar 2023", 0.0677],
["Abr 2023", 0.00321],
["May 2023", 0.04007],
["Jun 2023", 0.038507],
["Jul 2023", 0.019701]
];
const smartRiskyAccumDefaultDataArray = calculateAccumYieldsFor(smartRiskyDefaultDataArray);
const dataArrays = {
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

const createDataTable = (dataArray) => {
  const dataTable = new google.visualization.DataTable();
  dataTable.addColumn('string');
  dataTable.addColumn('number');
  dataTable.addColumn({type: 'string', role: 'tooltip'});
  dataTable.addRows(mapExtractingPercentagesWithTooltipInfo(dataArray));
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

const drawChartsWithData = () => {
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

const refreshDataPending = true;

const drawCharts = async (selectedPeriod = 'max') => {
  if (refreshDataPending || hasAnyEmptyDataArray()){
    refreshDataPending = false
    Promise.all([
      getYieldsArrayFor({ portfolio: 'wallet' }),
      getYieldsArrayFor({ portfolio: 'recommendation', risk: 2 }),
      getYieldsArrayFor({ portfolio: 'recommendation', risk: 4 }),
      getYieldsArrayFor({ portfolio: 'recommendation', risk: 6 }),
      getYieldsArrayFor({ portfolio: 'recommendation', risk: 6, typeUniverse: 'techThematicUniverse' }),
      getYieldsArrayFor({ portfolio: 'recommendation', risk: 6, typeUniverse: 'greenThematicUniverse' }),
      getYieldsArrayFor({ portfolio: 'recommendation', risk: 6, typeUniverse: 'cryptoThematicUniverse' }),
      getYieldsArrayFor({ portfolio: 'recommendation', risk: 1 }),
      getYieldsArrayFor({ portfolio: 'recommendation', risk:  6})
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