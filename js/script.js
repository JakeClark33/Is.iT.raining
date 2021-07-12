const city = document.getElementById("city");
const weatherIcon = document.getElementById("weather_icon");
const temp = document.getElementById("temp");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const days = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat"
];

fetch(
    "https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid=aadfa969f4684780a6a00acf73f015ca"
  )
  .then(response => {
    return response.json();
  })

  .then(json => {
    console.log(json);
    let sunRise = new Date(json.city.sunrise * 1000);
    let sunSet = new Date(json.city.sunset * 1000);

    city.innerHTML = json.city.name;

    const options = {
      weekday: "short",
      month: "short",
      day: "numeric"
    }
    const newDate = new Date(json.list[0].dt_txt)
    const todayDate = newDate.toLocaleDateString("en-US", options)

    document.getElementById("date").innerHTML = `${todayDate}`

    weather_icon.src = `https://openweathermap.org/img/wn/${json.list[0].weather[0].icon}@2x.png`
    temp.innerHTML = `${getNumber(Math.round(json.list[0].main.temp))}&deg;C`;

    sunrise.innerHTML = `${("0" + sunRise.getHours()).slice(-2)}:${("0" + sunRise.getMinutes()).slice(-2)}`;
    sunset.innerHTML = `${("0" + sunSet.getHours()).slice(-2)}:${("0" + sunSet.getMinutes()).slice(-2)}`;

    // Creates an array with the days (at 12:00) which should be displayed
    let dayArray = []
    json.list.forEach(day => {
      let date = new Date(day.dt_txt);
      if (date.getHours() == "12") {
        dayArray.push(day)
      }
    })

    displayDays(dayArray)
  })

// Function that creates the 
const displayDays = (dayArray) => {
  const daysDiv = document.getElementById("days");
  for (i = 0; i < dayArray.length; i++) {
    console.log(dayArray[i])
    let currentDate = new Date(dayArray[i].dt_txt)
    let currentDay = currentDate.getDay()
    daysDiv.innerHTML += `<div class="week_days"> 
                                <div>${days[currentDay]}</div>
                                  <img src="https://openweathermap.org/img/wn/${dayArray[i].weather[0].icon}.png">
                                <div>${getNumber(Math.round(dayArray[i].main.temp))}&deg;C </div>
                              </div>`
  }
}
//  Function to add a '+' in front of positive numbers
const getNumber = (theNumber) => {
  if (theNumber > 0) {
    return "+" + theNumber;
  } else {
    return theNumber.toString();
  }
}
document.getElementById("text").on('click', (fetch));
event.preventDefault();
