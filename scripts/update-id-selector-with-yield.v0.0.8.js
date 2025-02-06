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

  const data = await fetchDataApi({
    portfolioType,
    year,
    month,
    risk,
    typeUniverse
  });

  const yields = data.yields;
  const lastTwelveYields = yields.slice(-12);
  const key = displayCurrency === 'CLP' ? 'rentabilidadMesCLP' : 'rentabilidadMesUSD';
  const accumulatedYield = getTotalYield(lastTwelveYields, key);
  const yieldAsPercentage = ((accumulatedYield - 1) * 100).toFixed(2);

  document.getElementById(selectorId).textContent = String(yieldAsPercentage);
};
