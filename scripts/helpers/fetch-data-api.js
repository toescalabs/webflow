const nationalStocksYields = require('./national-stocks-yields');

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

export default fetchDataApi;
