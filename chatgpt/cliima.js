
async function addCity() {
    // Obtener el valor ingresado por el usuario y eliminar espacios extra
    const city = document.getElementById("cityInput").value.trim();

    // Si el input está vacío, no hacemos nada
    if (!city) return;

    // Limpiar el campo de texto después de usarlo
    document.getElementById("cityInput").value = "";

    // Mostrar mensaje de carga al usuario
    showMessage("Cargando...", "info");

    try {
        // =========================
        // 1. Verificar datos en caché
        // =========================
        const cachedData = getFromCache(city);

        // Si existen datos guardados, se usan sin llamar a la API
        if (cachedData) {
            createCityCard(
                cachedData.name,
                cachedData.country,
                cachedData.daily,
                cachedData.currentTemp
            );
            showMessage("Datos cargados desde caché", "info");
            return;
        }

        // =========================
        // 2. Geocoding: obtener latitud y longitud
        // =========================
        const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=es&format=json`
        );

        // Validar respuesta HTTP
        if (!geoRes.ok) {
            throw new Error("Error en el servicio de geolocalización");
        }

        const geoData = await geoRes.json();

        // Verificar que la ciudad exista
        if (!geoData.results || geoData.results.length === 0) {
            showMessage("Ciudad no encontrada", "error");
            return;
        }

        // Extraer datos necesarios de la ciudad
        const { latitude, longitude, name, country } = geoData.results[0];

        // =========================
        // 3. Obtener clima (actual + pronóstico)
        // =========================
        const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
        );

        if (!weatherRes.ok) {
            throw new Error("Error en el servicio del clima");
        }

        const weatherData = await weatherRes.json();

        // Temperatura actual
        const currentTemp = weatherData.current_weather.temperature;

        // =========================
        // 4. Guardar datos en caché
        // =========================
        saveToCache(city, {
            name,
            country,
            daily: weatherData.daily,
            currentTemp
        });

        // =========================
        // 5. Crear tarjeta en la interfaz
        // =========================
        createCityCard(name, country, weatherData.daily, currentTemp);

        // Limpiar mensajes
        showMessage("", "");

    } catch (error) {
        // Mostrar error controlado al usuario
        showMessage(error.message, "error");

        // Mostrar error técnico en consola para debugging
        console.error(error);
    }
}



function createCityCard(name, country, daily, currentTemp) {
    const card = document.createElement("div");
    card.className = "city-card";

    card.innerHTML = `
        <div class="city-header">
            <h3>${name}, ${country}</h3>
            <button class="remove" onclick="this.parentElement.parentElement.remove()">X</button>
        </div>

        <p class="current-temp">
            La temperatura en ${name} es ${currentTemp}°C
        </p>

        ${daily.time.slice(0, 5).map((date, i) => `
            <div class="day">
                <span>${date}</span>
                <span>${daily.temperature_2m_min[i]}°C / ${daily.temperature_2m_max[i]}°C</span>
            </div>
        `).join("")}
    `;

    document.getElementById("cities").appendChild(card);
}


//Guardar en caché (localStorage) las búsquedas de ciudades
function getFromCache(city) {
    const data = localStorage.getItem(city.toLowerCase());
    return data ? JSON.parse(data) : null;
}

function saveToCache(city, data) {
    localStorage.setItem(city.toLowerCase(), JSON.stringify(data));
}

function showMessage(text, type) {
    const msg = document.getElementById("message");
    msg.textContent = text;
    msg.className = `message ${type}`;
}
