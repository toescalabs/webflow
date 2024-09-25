
var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const DEFAULT_URL = 'https://91o7sqo7s3.execute-api.us-east-1.amazonaws.com/prod/';

const defaultData = JSON.stringify({
  "year": "2023",
  "month": "01",
  "risk": 7,
});

const getYieldsFor = (
  { year,
    month,
    risk,
    portfolioType,
    typeUniverse,
}
) => {
  var routeParam = 'recommendationYields';
  if (portfolioType === 'wallet') routeParam = 'walletYields';
  const url = `${DEFAULT_URL}${routeParam}`;
  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: {...defaultData, year, month, risk, typeUniverse},
    redirect: 'follow'
  };
  return fetch(url, requestOptions)
    .then(response => response.json())
};

const getTotalYield = (yields) => yields.reduce((accYield, {rentabilidadMes}) => (1 + rentabilidadMes) * accYield , 1);

const updateSelectorWithYieldFrom = async (
  selectorId,
  {
  year = '2024',
  month = '01',
  risk = 7,
  typeUniverse,
  portfolio
}
) => {
  document.getElementById(selectorId).textContent = '...';
  const jsonResponse = await getYieldsFor({
    year,
    month,
    risk,
    portfolio,
    typeUniverse,
  });
  const yields = jsonResponse.yields;
  const lastTwelveYields = yields.slice(-12);
  const accumulatedYield = getTotalYield(lastTwelveYields);
  document.getElementById(selectorId).textContent = String(accumulatedYield);
};
