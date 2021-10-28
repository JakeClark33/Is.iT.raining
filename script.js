const DS_KEY = 'weatherDashboardHistory';
const GOOGLE_API_KEY = 'AIzaSyCdkdxKTGjL9lnxLZFigbcD5sunrmWW2KU';
const WEATHER_API_KEY = '2ae2d1a95580831d1a8ed63b446fcf06';
const MAX_HISTORY_LEN = 25;

const dataStore = window.localStorage;
const searchInputWrapperEl = document.getElementById('search-input-wrapper');
const searchInputEl = document.getElementById('search-input');
const searchHistoryEL = document.getElementById('search-history');
const loadingIndicatorEL = document.getElementById('loading-indicator');
const forecastEl = document.getElementById('forecast-wrapper');

// Event Handlers
const handleSearchFormSubmit = (e) => {
  e.preventDefault();
  const city = searchInputEl.value.trim();
  searchInputEl.value = city;
  getAndRenderForecast(city);
}

const handleSearchHistoryBtnClick = (city) => {
  searchInputEl.value = city;
  searchInputWrapperEl.classList.add('is-dirty');
  getAndRenderForecast(city);
}

// HTTP Requests
const getCityGeoData = async (city) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results[0];
  } catch (error) {
    throw(error);
  }
}

const getForecast = async (lat, lng) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&units=imperial&appid=${WEATHER_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    throw(error);
  }
};

// History Functionality
const loadSearchHistory = () => {
  searchHistoryEL.innerHTML = "";
  const history = getData();
  history.forEach(city => searchHistoryEL.append(generateHistoryItemBtn(city)))
}

const generateHistoryItemBtn = (city) => {
  const historyItem = document.createElement('button');
  const historyItemSpan = document.createElement('span');
  historyItem.classList.add("mdl-chip");
  historyItem.classList.add("search-chip");
  historyItemSpan.classList.add("mdl-chip__text");
  historyItemSpan.textContent = city;
  historyItem.append(historyItemSpan);
  historyItem.addEventListener('click', () => handleSearchHistoryBtnClick(city));
  return historyItem;
}

const updateSearchHistory = (city) => {
  const history = getData();
  let newHistory = history.filter(item => item !== city);
  newHistory.unshift(city);
  if (newHistory.length > MAX_HISTORY_LEN) {
    console.log(newHistory.length)
    newHistory = newHistory.slice(0, MAX_HISTORY_LEN)
  };
  setData(newHistory)
  loadSearchHistory();
}

// Forecast functionality
const getAndRenderForecast = async (city) => {
  setLoadingIndicator(true);
  try {
    const geoData = await getCityGeoData(city);
    const {lat, lng} = geoData.geometry.location;
    const weatherData = await getForecast(lat, lng);
    updateSearchHistory(city);
    renderForecast(geoData, weatherData);
    forecastEl.classList.remove('hidden');
  } catch (error) {
    showErrorMsg('Something went wrong, please try again.')
  }
  setLoadingIndicator(false);
}

const renderForecast = (geoData, weatherData) => {
  renderTodaysForecast(geoData, weatherData);
  renderFiveDayForecast(weatherData);
}

const renderTodaysForecast = (geoData, weatherData) => {
  const date = moment().format('dddd, MM/DD/YYYY');
  document.getElementById('city').textContent = `${geoData.formatted_address}`;
  document.getElementById('info-current').textContent = `Today - ${date}`;
  document.getElementById('icon-current').src = getIconURL(weatherData.current.weather[0].icon, 4);
  document.getElementById('temp-current').textContent = weatherData.current.temp;
  document.getElementById('wind-current').textContent = weatherData.current.wind_speed;
  document.getElementById('humidity-current').textContent = weatherData.current.humidity;
  document.getElementById('uv-index-current').textContent = weatherData.current.uvi;
}

const renderFiveDayForecast = (weatherData) => {
  for (let i = 0; i < 5; i++) {
    renderFiveDayForecastItem(i, weatherData.daily[i]);
  }
}

const renderFiveDayForecastItem = (i, forecast) => {
  const date = moment().add(i + 1, 'day');
  const formattedDate = date.format('MM/DD/YYYY');
  const formattedDay = date.format('dddd');
  document.getElementById(`day-${i}`).textContent = formattedDay;
  document.getElementById(`date-day-${i}`).textContent = formattedDate;
  document.getElementById(`icon-day-${i}`).src = getIconURL(forecast.weather[0].icon, 1);
  document.getElementById(`temp-day-${i}`).textContent = forecast.temp.day;
  document.getElementById(`wind-day-${i}`).textContent = forecast.wind_speed;
  document.getElementById(`humidity-day-${i}`).textContent = forecast.humidity;
}

const getIconURL = (icon, size) => {
  const modifier = size > 1 ? `@${size}x` : '';
  return `http://openweathermap.org/img/wn/${icon}${modifier}.png`;
}

// Data Store
const initDataStore = () => {
  try {
    getData();
  } catch (error) {
    setData([]);
  }
}

const getData = () => {
  const data = dataStore.getItem(DS_KEY);
  if (!data) throw new Error('Data store not initialized')
  return JSON.parse(data);
}

const setData = (data) => {
  dataStore.setItem(DS_KEY, JSON.stringify(data));
}

// Misc
const showErrorMsg = (message) => {
  var snackbarEl = document.getElementById('snackbar');
  snackbarEl.MaterialSnackbar.showSnackbar({ message });
}

const setLoadingIndicator = (isLoading) => {
  if(isLoading) {
    loadingIndicatorEL.classList.remove('hidden');
  } else {
    loadingIndicatorEL.classList.add('hidden');
  }
}

// Initialize Application
const main = () => {
  initDataStore();
  loadSearchHistory();
  document.getElementById('search-form').addEventListener('submit', handleSearchFormSubmit)
}

main();
