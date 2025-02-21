import { chileanSmartFundYields } from "https://cdn.jsdelivr.net/gh/toescalabs/webflow@refactor/avoid-versions/scripts/chilean-smart-fund-yields.js";

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
