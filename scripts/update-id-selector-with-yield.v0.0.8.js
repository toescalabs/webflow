const fetchDataApi = require('./helpers/fetch-data-api');

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
