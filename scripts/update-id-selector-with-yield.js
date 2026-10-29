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
  const startDate = year + '-' + month;
  const data = { year, month, risk, typeUniverse, 'start-yyyy-mm': startDate};
  if (portfolioType === 'harryIpsa') routeParam = 'nationalStocksYields';
  if (portfolioType === 'wallet') routeParam = 'walletYields';
  if (portfolioType === 'privateDebt') {
  	routeParam = "universeProfileYields"
    data.universe = 21
    data.profile = 1
    data.currency = "CLP"
		data.frequency = "months"
  }
  const url = `${DEFAULT_URL}${routeParam}`;
  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify(data),
    redirect: 'follow'
  };
  return fetch(url, requestOptions)
    .then(response => response.json())
};

const getTotalYield = (yields, key) => yields.reduce((accYield, { [key]: rentabilidadMes }) => (1 + rentabilidadMes) * accYield , 1);

const updateSelectorWithYields = async (
  selectorId,
  displayCurrency,
  {
    year = '2024',
    month = '01',
    risk = 7,
    typeUniverse,
    portfolioType
  }
) => {
  document.getElementById(selectorId).textContent = '...';

  const data = await getYieldsFor({
    year,
    month,
    risk,
    portfolioType,
    typeUniverse,
  });

  const yields = data.yields;
  const lastTwelveYields = yields.slice(-12);
  const key = displayCurrency === 'CLP' ? 'rentabilidadMesCLP' : 'rentabilidadMesUSD';
  const accumulatedYield = getTotalYield(lastTwelveYields, key);
  const yieldAsPercentage = ((accumulatedYield - 1) * 100).toFixed(2);

  document.getElementById(selectorId).textContent = String(yieldAsPercentage);
};
