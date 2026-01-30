/**
Busca y muestra el clima actual para una ciudad ingresada en el campo de texto de la página.
Flujo:
Lee el valor del input con id "city".
Valida la entrada (no vacía).
Consulta el servicio de geocodificación de Open-Meteo para obtener latitud y longitud.
Consulta el servicio de pronóstico de Open-Meteo para obtener el clima actual.
Escribe el resultado en el contenedor con id "resultado".
Dependencias del DOM:
Input de texto: document.getElementById("city")
Contenedor salida: document.getElementById("resultado")
Errores y mensajes:
Si el campo está vacío: muestra "Escribe una ciudad".
Si la ciudad no se encuentra: muestra "Ciudad no encontrada".
En respuesta exitosa: muestra "La temperatura en es °C".
Servicios externos:
Geocoding API (Open-Meteo): https://geocoding-api.open-meteo.com/v1/search?name=
Forecast API (Open-Meteo): https://api.open-meteo.com/v1/forecast?latitude=&longitude=&current_weather=true
Parámetros:
No recibe parámetros directamente. La función toma los valores desde el DOM.
Retorno:
void (no retorna valor). Efectos colaterales: modifica el contenido del elemento con id "resultado".
Ejemplo de uso (HTML):
Buscar
Ejemplo de uso (JS):
// Asumiendo que el HTML anterior existe en la página:
document.getElementById("city").value = "Santiago";
buscarClima(); // Actualiza el elemento #resultado con la temperatura actual
Notas:
Esta función realiza solicitudes de red (fetch) y depende de la disponibilidad de los servicios de Open-Meteo.
Para pruebas unitarias en Node/Jest, la función se exporta como module.exports.buscarClima cuando module está definido. */
function buscarClima() {
  var ciudad = document.getElementById("city").value;
  var resultado = document.getElementById("resultado");

  if (ciudad.trim() === "") {
    resultado.innerHTML = "Escribe una ciudad";
    return;
  }

  // 1. Obtener coordenadas de la ciudad
  fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + ciudad)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {

      if (!data.results) {
        resultado.innerHTML = "Ciudad no encontrada";
        return;
      }

      var lat = data.results[0].latitude;
      var lon = data.results[0].longitude;
      var nombre = data.results[0].name;

      // 2. Obtener clima
      fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=" +
        lat +
        "&longitude=" +
        lon +
        "&current_weather=true"
      )
        .then(function (response) {
          return response.json();
        })
        .then(function (clima) {
          var temperatura = clima.current_weather.temperature;
          resultado.innerHTML =
            "La temperatura en " + nombre + " es " + temperatura + "°C";
        });

    });
}


// xponer la función al objeto global para pruebas y para uso desde el HTML
if (typeof window !== 'undefined') {
  window.buscarClima = buscarClima;
}

// Para Jest / Node
if (typeof module !== 'undefined') {
  module.exports = { buscarClima };
}