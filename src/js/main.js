const allLink = document.querySelectorAll(".nav-section .nav-item");
const allSection = document.querySelectorAll("section");
const globalCountry = document.getElementById("global-country");
const globalCity = document.getElementById("global-city");
const selectedDestination = document.getElementById("selected-destination");
const dashboardCountry = document.getElementById("dashboard-country-info");
const globalSearchBtn = document.getElementById("global-search-btn");

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
async function getCountryDetails(countryCode) {
  let response = await fetch(
    `https://restcountries.com/v3.1/alpha/${countryCode}`,
  );
  let data = await response.json();
  return data[0];
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

displayAllCountry();

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
  // بيانات الدولة الأساسية
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

  // العملات
  const currencies = country.currencies
    ? Object.values(country.currencies)
        .map((c) => `${c.name} (${c.symbol})`)
        .join(", ")
    : "-";

  // اللغات
  const languages = country.languages
    ? Object.values(country.languages).join(", ")
    : "-";

  // الدول المجاورة
  const neighbors = country.borders
    ? country.borders
        .map(
          (code) =>
            `<span class="extra-tag border-tag" onclick="neighborsCountryDetails('${code}')">${code}</span>`,
        )
        .join(" ")
    : "<span class='extra-tag'>No neighbors</span>";

  // الوقت المحلي
  const localTime = getLocalTimeFromOffset(timezone);

  // رابط Google Maps
  const mapsLink = country.maps?.googleMaps || "#";

  // بناء الـ HTML
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

// دالة لحساب الوقت المحلي من offset بصيغة UTC±hh:mm
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


window.neighborsCountryDetails = async function (countryCode) {
  let selectedValue = countryCode.toLowerCase();
  let city = await getCountryDetails(selectedValue);
  displayCountryInfo(city);
};
