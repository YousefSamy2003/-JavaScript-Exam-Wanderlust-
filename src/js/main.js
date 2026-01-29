////// main
displayAllCountry();

const allLink = document.querySelectorAll(".nav-section .nav-item");
const allSection = document.querySelectorAll("section");
const globalCountry = document.getElementById("global-country");
const globalCity = document.getElementById("global-city");
const globalYear = document.getElementById("global-year");

const selectedDestination = document.getElementById("selected-destination");
const dashboardCountry = document.getElementById("dashboard-country-info");
const globalSearchBtn = document.getElementById("global-search-btn");
const holidaysContainer = document.getElementById("holidays-content");
const statHolidays = document.getElementById("stat-holidays");
const Loading = document.getElementById("loading-overlay");
const weekendsContent = document.getElementById("lw-content");

let globalListHolidayes = [];
let globalListEvents = [];
let globalWeekends = [];

let myPlans = {
  holiday: [],
  events: [],
  Weekends: [],
};

allLink.forEach((link) => {
  link.addEventListener("click", () => {
    allLink.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    const viewName = link.getAttribute("data-view");

    allSection.forEach((section) => {
      if (section.getAttribute("data-section") === viewName) {
        section.classList.remove("view");
      } else {
        section.classList.add("view");
        section.classList.remove("active");
      }
    });
  });
});

/////// main logic
globalCountry.addEventListener("change", async (e) => {
  let selectedValue = e.target.value.toLowerCase();
  console.log(selectedValue);
  let city = await getCountryDetails(selectedValue);
  console.log(city);
  globalCity.innerHTML = ` 
     <option value="" selected>Select City</option>
  <option value=${city.capital[0]} >${city.capital[0]}</option>`;
  selectedDestination.classList.remove("hidden");
  displayDestination(city);
  document
    .getElementById("clear-selection-btn")
    .addEventListener("click", () => {
      selectedDestination.classList.add("hidden");
      globalCountry.value = "";
      globalCity.value = "";
    });
  let year = globalYear.value;
  let countryCode = selectedValue;

  getHolidays(year, countryCode);
  document.getElementById("pragraph-country").innerHTML =
    ` Browse public holidays for ${globalCountry.value} and plan your trips around
                  them`;
  getEvents(e.target.value);
  document.getElementById("pragraph-event").innerHTML =
    `Discover concerts, sports, theatre and more in ${globalCountry.value}`;

  //////  getWeekends
  globalYear.addEventListener("change", async (e) => {
    let year = e.target.value;
    let countryCode = selectedValue;
    getWeekends(countryCode, year);
  });
});

///////// handle btn
globalSearchBtn.addEventListener("click", async () => {
  let selectedValue = globalCountry.value.toLowerCase();
  let city = await getCountryDetails(selectedValue);
  displayCountryInfo(city);
});

///// get data

async function getAllCountry() {
  let data;
  let response = await fetch(`https://date.nager.at/api/v3/AvailableCountries`);
  data = await response.json();
  return data;
}

////// getCountryDetails by country code
async function getCountryDetails(countryCode) {
  let response = await fetch(
    `https://restcountries.com/v3.1/alpha/${countryCode}`,
  );
  let data = await response.json();
  return data[0];
}
///////// getHolidays
async function getHolidays(year, countryCode) {
  Loading.classList.remove("hidden");
  let data = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`,
  );
  data = await data.json();

  dispalyHolidayes(data);
  Loading.classList.add("hidden");
  globalListHolidayes = data;
  statHolidays.innerHTML = globalListHolidayes.length;
  console.log(globalListHolidayes);
}

////// display   ////////////////
async function displayAllCountry() {
  let data = await getAllCountry();

  let box = ``;
  for (let i = 0; i < data.length; i++) {
    box += `
      <option value="${data[i].countryCode}" >
        ${data[i].name}
      </option>
    `;
  }
  globalCountry.innerHTML += box;
}

function displayDestination(country) {
  selectedDestination.innerHTML = `
  
    <div class="selected-flag">
                    <img
                      id="selected-country-flag"
                      src=${country.flags.png}
                      alt="Egypt"
                    />
                  </div>
                  <div class="selected-info">
                    <span
                      class="selected-country-name"
                      id="selected-country-name"
                      >${country.name.common}</span
                    >
                    <span class="selected-city-name" id="selected-city-name"
                      >${country.capital[0]}</span
                    >
                  </div>
                  <button class="clear-selection-btn" id="clear-selection-btn">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
  
  `;
}

function displayCountryInfo(country) {
  const flag = country.flags?.png || "";
  const commonName = country.name?.common || "";
  const officialName = country.name?.official || "";
  const region = country.region || "";
  const subregion = country.subregion || "";
  const timezone = country.timezones?.[0] || "UTC+00:00";
  const capital = country.capital?.[0] || "-";
  const population = country.population?.toLocaleString() || "-";
  const area = country.area?.toLocaleString() + " km²" || "-";
  const continent = country.continents?.[0] || "-";
  const callingCode =
    country.idd?.root + (country.idd?.suffixes?.[0] || "") || "-";
  const drivingSide = country.car?.side || "-";
  const weekStart = country.startOfWeek || "-";

  const currencies = country.currencies
    ? Object.values(country.currencies)
        .map((c) => `${c.name} (${c.symbol})`)
        .join(", ")
    : "-";

  const languages = country.languages
    ? Object.values(country.languages).join(", ")
    : "-";

  const neighbors = country.borders
    ? country.borders
        .map(
          (code) =>
            `<span class="extra-tag border-tag" onclick="neighborsCountryDetails('${code}')">${code}</span>`,
        )
        .join(" ")
    : "<span class='extra-tag'>No neighbors</span>";

  const localTime = getLocalTimeFromOffset(timezone);

  const mapsLink = country.maps?.googleMaps || "#";

  dashboardCountry.innerHTML = `
  <div class="dashboard-country-header">
    <img src="${flag}" alt="${commonName}" class="dashboard-country-flag" />
    <div class="dashboard-country-title">
      <h3>${commonName}</h3>
      <p class="official-name">${officialName}</p>
      <span class="region"><i class="fa-solid fa-location-dot"></i> ${region} • ${subregion}</span>
    </div>
  </div>

  <div class="dashboard-local-time">
    <div class="local-time-display">
      <i class="fa-solid fa-clock"></i>
      <span class="local-time-value" id="country-local-time">${localTime}</span>
      <span class="local-time-zone">${timezone}</span>
    </div>
  </div>

  <div class="dashboard-country-grid">
    <div class="dashboard-country-detail">
      <i class="fa-solid fa-building-columns"></i>
      <span class="label">Capital</span>
      <span class="value">${capital}</span>
    </div>
    <div class="dashboard-country-detail">
      <i class="fa-solid fa-users"></i>
      <span class="label">Population</span>
      <span class="value">${population}</span>
    </div>
    <div class="dashboard-country-detail">
      <i class="fa-solid fa-ruler-combined"></i>
      <span class="label">Area</span>
      <span class="value">${area}</span>
    </div>
    <div class="dashboard-country-detail">
      <i class="fa-solid fa-globe"></i>
      <span class="label">Continent</span>
      <span class="value">${continent}</span>
    </div>
    <div class="dashboard-country-detail">
      <i class="fa-solid fa-phone"></i>
      <span class="label">Calling Code</span>
      <span class="value">${callingCode}</span>
    </div>
    <div class="dashboard-country-detail">
      <i class="fa-solid fa-car"></i>
      <span class="label">Driving Side</span>
      <span class="value">${drivingSide}</span>
    </div>
    <div class="dashboard-country-detail">
      <i class="fa-solid fa-calendar-week"></i>
      <span class="label">Week Starts</span>
      <span class="value">${weekStart}</span>
    </div>
  </div>

  <div class="dashboard-country-extras">
    <div class="dashboard-country-extra">
      <h4><i class="fa-solid fa-coins"></i> Currency</h4>
      <div class="extra-tags">${currencies}</div>
    </div>
    <div class="dashboard-country-extra">
      <h4><i class="fa-solid fa-language"></i> Languages</h4>
      <div class="extra-tags">${languages}</div>
    </div>
    <div class="dashboard-country-extra">
      <h4><i class="fa-solid fa-map-location-dot"></i> Neighbors</h4>
      <div class="extra-tags">${neighbors}</div>
    </div>
  </div>

  <div class="dashboard-country-actions">
    <a href="${mapsLink}" target="_blank" class="btn-map-link">
      <i class="fa-solid fa-map"></i> View on Google Maps
    </a>
  </div>
  `;
}

function getLocalTimeFromOffset(offset) {
  const now = new Date();
  const match = offset.match(/UTC([+-]\d{2}):?(\d{2})?/);

  if (!match) return now.toLocaleTimeString();

  const hours = parseInt(match[1]);
  const minutes = match[2] ? parseInt(match[2]) : 0;

  // الوقت الحالي UTC
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;

  // الوقت المحلي حسب الـ offset
  const local = new Date(utc + hours * 3600000 + minutes * 60000);

  return local.toLocaleTimeString("en-US", { hour12: false });
}
function dispalyHolidayes(data) {
  let box = "";

  data.map((holiday, index) => {
    let x = holiday.date;
    let date = new Date(x);

    let day = date.getDate();
    let month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();

    let dayName = date.toLocaleString("en-US", { weekday: "short" });

    box += `
      <div class="holiday-card"  id=${index}  >
        <div class="holiday-card-header">
          <div class="holiday-date-box">
            <span class="day">${day}</span>
            <span class="month">${month}</span>
          </div>
          <button class="holiday-action-btn" id=holidey${index} onclick="addHolidayToPlan(${index})" >
            <i class="fa-regular fa-heart"></i>
          </button>
        </div>

        <h3>${holiday.name}</h3>
        <p class="holiday-name">${holiday.name}</p>

        <div class="holiday-card-footer">
          <span class="holiday-day-badge">
            <i class="fa-regular fa-calendar"></i> ${dayName}
          </span>
          <span class="holiday-type-badge">${holiday.types[0]}</span>
        </div>
      </div>
    `;
  });

  holidaysContainer.innerHTML = box;
}

window.neighborsCountryDetails = async function (countryCode) {
  let selectedValue = countryCode.toLowerCase();
  let city = await getCountryDetails(selectedValue);
  displayCountryInfo(city);
};

window.addHolidayToPlan = function (index) {
  myPlans.holiday ??= [];

  let item = globalListHolidayes[index];

  if (myPlans.holiday.some((h) => h.date === item.date)) return;

  myPlans.holiday.push(item);
  localStorage.setItem("myPlans", JSON.stringify(myPlans));

  document.getElementById(`holiday${index}`)?.classList.add("saved");

  console.log(myPlans);
};

async function getEvents(countryCode) {
  let data = await fetch(
    `https://app.ticketmaster.com/discovery/v2/events.json?apikey=Ar0BKObNjnNpAG0NwbDdPb8LYI0HaHp3&countryCode=${countryCode}&size=20`,
  );
  data = await data.json();
  if (data.page.totalElements === 0) {
    data = 0;
    console.log(data);
  } else {
    data = data._embedded.events;
    console.log(data);
    globalListEvents = data;
    displayEvents(data);
  }
}



function displayEvents(data) {
  let box = "";

  if (!data || data.length == 0) {
    // Empty State (زي ما هو)
    box += `<div class="empty-state">
        <div class="empty-icon"><i class="fa-solid fa-ticket"></i></div>
        <h3>No Events Found</h3>
        <p>No events found for this location</p>
      </div>`;
  } else {
    // Loop through data
    box = data
      .map((event, index) => {
        const eventImage =
          event.images && event.images.length > 0
            ? event.images[0].url
            : "https://via.placeholder.com/400x200?text=No+Image";

        const category = event.classifications?.[0]?.segment?.name || "Event";

        const venueName = event._embedded?.venues?.[0]?.name || "Unknown Venue";
        const cityName = event._embedded?.venues?.[0]?.city?.name || "";

        const eventDate = event.dates?.start?.localDate || "TBA";
        const eventTime = event.dates?.start?.localTime
          ? event.dates.start.localTime.slice(0, 5)
          : "";

        return `
       <div class="event-card"> <div class="event-card-image">
            <img src="${eventImage}" alt="${event.name}" />
            <span class="event-card-category">${category}</span>
            <button class="event-card-save" id=event${index} onclick="addEventToPlan('${index}')">
              <i class="fa-regular fa-heart"></i>
            </button>
          </div>
          
          <div class="event-card-body">
            <h3>${event.name}</h3> <div class="event-card-info">
              <div>
                <i class="fa-regular fa-calendar"></i> ${eventDate} ${eventTime ? "at " + eventTime : ""}
              </div>
              <div>
                <i class="fa-solid fa-location-dot"></i> ${venueName}, ${cityName}
              </div>
            </div>

            <div class="event-card-footer">
              <button class="btn-event" onclick="addEventToPlan('${index}')">
                 <i class="fa-regular fa-heart"></i> Save
              </button>
              
              <a href="${event.url}" target="_blank" class="btn-buy-ticket">
                <i class="fa-solid fa-ticket"></i> Buy Tickets
              </a>
            </div>
          </div>
       </div>
      `;
      })
      .join("");
  }

  document.getElementById("events-content").innerHTML = box;
}

window.addEventToPlan = function (index) {
  myPlans.events ??= [];
  let rawItem = globalListEvents[index];
  let itemToSave = {
    id: rawItem.id,
    name: rawItem.name,
    date: rawItem.dates?.start?.localDate || "No Date",
    image: rawItem.images?.[0]?.url || "",
    type: "event",
  };
  if (myPlans.events.some((savedItem) => savedItem.id === itemToSave.id)) {
    console.log("Event already saved!");
    return;
  }
  myPlans.events.push(itemToSave);
  localStorage.setItem("myPlans", JSON.stringify(myPlans));
  let btn = document.getElementById(`event${index}`);
  if (btn) {
    btn.classList.add("saved");
    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
  }
  console.log("Current Plan:", myPlans.events);
};

async function getWeekends(countryCode, year) {
  let data = await fetch(
    `https://date.nager.at/api/v3/LongWeekend/${year}/${countryCode}`,
  );
  let response = await data.json();
  console.log(response);
  displayWeekends(response);
}

function displayWeekends(data) {
  globalWeekends = data;
  let box = ``;

  data.forEach((item, index) => {
    const startDateObj = new Date(item.startDate);
    const endDateObj = new Date(item.endDate);

    const dateRange = `${startDateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${endDateObj.getFullYear()}`;

    let infoBox = "";
    if (item.needBridgeDay) {
      infoBox = `
        <div class="lw-info-box warning">
          <i class="fa-solid fa-info-circle"></i> Requires taking a bridge day off
        </div>`;
    } else {
      infoBox = `
        <div class="lw-info-box success" style="background: #f0fff4; color: #2f855a; border-color: #9ae6b4;">
           <i class="fa-solid fa-check"></i> Perfect continuous break!
        </div>`;
    }

    let visualDaysHTML = "";
    let loopDate = new Date(startDateObj);

    while (loopDate <= endDateObj) {
      const dayName = loopDate.toLocaleDateString("en-US", {
        weekday: "short",
      }); // Wed
      const dayNum = loopDate.getDate(); // 7

      const isWeekend = loopDate.getDay() === 5 || loopDate.getDay() === 6;

      visualDaysHTML += `
        <div class="lw-day ${isWeekend ? "weekend" : ""}">
          <span class="name">${dayName}</span><span class="num">${dayNum}</span>
        </div>
      `;

      loopDate.setDate(loopDate.getDate() + 1);
    }

    box += `
      <div class="lw-card">
        <div class="lw-card-header">
          <span class="lw-badge">
            <i class="fa-solid fa-calendar-days"></i> ${item.dayCount} Days
          </span>
          <button class="holiday-action-btn" id="weekend-btn-${index}" onclick="addWeekendToPlan(${index})">
            <i class="fa-regular fa-heart"></i>
          </button>
        </div>
        
        <h3>Long Weekend #${index + 1}</h3>
        
        <div class="lw-dates">
          <i class="fa-regular fa-calendar"></i> ${dateRange}
        </div>
        
        ${infoBox} <div class="lw-days-visual">
          ${visualDaysHTML} </div>
      </div>
    `;
  });

  weekendsContent.innerHTML = box;
}

// window.addWeekendToPlan = function (index) {
//   myPlans.Weekends.push(globalWeekends[index]);
//   localStorage.setItem("myPlans", JSON.stringify(myPlans));

//   console.log(myPlans.Weekends);

// };

window.addWeekendToPlan = function (index) {
  myPlans.Weekends ??= [];

  let rawItem = globalWeekends[index];

  if (!rawItem) {
    console.error("Error: No data found at index", index);
    return;
  }

  const uniqueId = `lw-${rawItem.startDate}`;

  let itemToSave = {
    id: uniqueId,
    title: `Long Weekend (${rawItem.dayCount} Days)`,
    startDate: rawItem.startDate,
    endDate: rawItem.endDate,
    dayCount: rawItem.dayCount,
    type: "weekend",
  };

  const isDuplicate = myPlans.Weekends.some(
    (item) => item.id === itemToSave.id,
  );

  if (isDuplicate) {
    console.log("This weekend is already in your plans!");
    return;
  }

  myPlans.Weekends.push(itemToSave);
  localStorage.setItem("myPlans", JSON.stringify(myPlans));

  let btn = document.getElementById(`weekend-btn-${index}`);
  if (btn) {
    btn.classList.add("saved");
    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
  }
};
