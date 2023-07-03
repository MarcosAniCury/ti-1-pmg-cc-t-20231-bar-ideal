'use strict';
/** Função auxiliar para gerar um URL de rotas do Google Maps

 */
function generateDirectionsURL(origin, destination) {
  const googleMapsUrlBase = 'https://www.google.com/maps/dir/?';
  const searchParams = new URLSearchParams('api=1');
  searchParams.append('origin', origin);
  const destinationParam = [];
  // Adicione o título ao destinationParam, exceto nos casos em que o Quick Builder é definido
  // o título para a primeira linha do endereço
  if (destination.title !== destination.address1) {
    destinationParam.push(destination.title);
  }
  destinationParam.push(destination.address1, destination.address2);
  searchParams.append('destination', destinationParam.join(','));
  return googleMapsUrlBase + searchParams.toString();
}

/**
 * Define uma instância da solução Locator+, a ser instanciada
 * quando a biblioteca de mapas é carregada.
 */
function LocatorPlus(configuration) {
  const locator = this;

  locator.locations = configuration.locations || [];
  locator.capabilities = configuration.capabilities || {};

  const mapEl = document.getElementById('gmp-map');
  const panelEl = document.getElementById('locations-panel');
  locator.panelListEl = document.getElementById('locations-panel-list');
  const sectionNameEl =
    document.getElementById('location-results-section-name');
  const resultsContainerEl = document.getElementById('location-results-list');

  const itemsTemplate = Handlebars.compile(
    document.getElementById('locator-result-items-tmpl').innerHTML);

  locator.searchLocation = null;
  locator.searchLocationMarker = null;
  locator.selectedLocationIdx = null;
  locator.userCountry = null;

  // Inicializar o mapa -------------------------------------------------------
  locator.map = new google.maps.Map(mapEl, configuration.mapOptions);

  // Seleção da loja.
  const selectResultItem = function (locationIdx, panToMarker, scrollToResult) {
    locator.selectedLocationIdx = locationIdx;
    for (let locationElem of resultsContainerEl.children) {
      locationElem.classList.remove('selected');
      if (getResultIndex(locationElem) === locator.selectedLocationIdx) {
        locationElem.classList.add('selected');
        if (scrollToResult) {
          panelEl.scrollTop = locationElem.offsetTop;
        }
      }
    }
    if (panToMarker && (locationIdx != null)) {
      locator.map.panTo(locator.locations[locationIdx].coords);
    }
  };

  // Crie um marcador para cada local.
  const markers = locator.locations.map(function (location, index) {
    const marker = new google.maps.Marker({
      position: location.coords,
      map: locator.map,
      title: location.title,
    });
    marker.addListener('click', function () {
      selectResultItem(index, false, true);
    });
    return marker;
  });

  // Ajustar o mapa aos limites do marcador.
  locator.updateBounds = function () {
    const bounds = new google.maps.LatLngBounds();
    if (locator.searchLocationMarker) {
      bounds.extend(locator.searchLocationMarker.getPosition());
    }
    for (let i = 0; i < markers.length; i++) {
      bounds.extend(markers[i].getPosition());
    }
    locator.map.fitBounds(bounds);
  };
  if (locator.locations.length) {
    locator.updateBounds();
  }

  // obter a distância de um local de loja para a localização do usuário,
  // usado na classificação da lista.
  const getLocationDistance = function (location) {
    if (!locator.searchLocation) return null;

    // Fall back to straight-line distance.
    return google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(location.coords),
      locator.searchLocation.location);
  };

  // Renderizar a lista de resultados --------------------------------------------------
  const getResultIndex = function (elem) {
    return parseInt(elem.getAttribute('data-location-index'));
  };

  locator.renderResultsList = function () {
    let locations = locator.locations.slice();
    for (let i = 0; i < locations.length; i++) {
      locations[i].index = i;
    }
    if (locator.searchLocation) {
      sectionNameEl.textContent =
        'Nearest locations (' + locations.length + ')';
      locations.sort(function (a, b) {
        return getLocationDistance(a) - getLocationDistance(b);
      });
    } else {
      sectionNameEl.textContent = `All locations (${locations.length})`;
    }
    const resultItemContext = { locations: locations };
    resultsContainerEl.innerHTML = itemsTemplate(resultItemContext);
    for (let item of resultsContainerEl.children) {
      const resultIndex = getResultIndex(item);
      if (resultIndex === locator.selectedLocationIdx) {
        item.classList.add('selected');
      }

      const resultSelectionHandler = function () {
        if (resultIndex !== locator.selectedLocationIdx) {
          selectResultItem(resultIndex, true, false);
        }
      };

      // Clicar em qualquer lugar no item seleciona este local.
      // Além disso, crie um elemento de botão para tornar esse comportamento
      // acessível na guia de navegação.
      item.addEventListener('click', resultSelectionHandler);
      item.querySelector('.select-location')
        .addEventListener('click', function (e) {
          resultSelectionHandler();
          e.stopPropagation();
        });

      // Clicar no botão de direções abrirá as direções do Google Maps em um
      // Nova aba
      const origin = (locator.searchLocation != null) ?
        locator.searchLocation.location :
        '';
      const destination = locator.locations[resultIndex];
      const googleMapsUrl = generateDirectionsURL(origin, destination);
      item.querySelector('.directions-button')
        .setAttribute('href', googleMapsUrl);
    }
  };

  // Inicialização de capacidade opcional --------------------------------------
  initializeSearchInput(locator);

  // Renderização inicial dos resultados -----------------------------------------------
  locator.renderResultsList();
}

/** Quando o recurso de entrada de pesquisa estiver ativado, inicialize-o.

 */
function initializeSearchInput(locator) {
  const geocodeCache = new Map();
  const geocoder = new google.maps.Geocoder();

  const searchInputEl = document.getElementById('location-search-input');
  const searchButtonEl = document.getElementById('location-search-button');

  const updateSearchLocation = function (address, location) {
    if (locator.searchLocationMarker) {
      locator.searchLocationMarker.setMap(null);
    }
    if (!location) {
      locator.searchLocation = null;
      return;
    }
    locator.searchLocation = { 'address': address, 'location': location };
    locator.searchLocationMarker = new google.maps.Marker({
      position: location,
      map: locator.map,
      title: 'My location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#3367D6',
        fillOpacity: 0.5,
        strokeOpacity: 0,
      }
    });

    // Atualize a ideia do localizador do país do usuário, usada para unidades. Usar
    // `formatted_address` em vez dos `address_components` mais estruturados
    // para evitar uma chamada cobrada adicional.
    const addressParts = address.split(' ');
    locator.userCountry = addressParts[addressParts.length - 1];

    // Atualize os limites do mapa para incluir o novo marcador de localização.


    locator.updateBounds();

    // Atualize a lista de resultados para que possamos classificá-la por proximidade.
    locator.renderResultsList();
  };

  const geocodeSearch = function (query) {
    if (!query) {
      return;
    }

    const handleResult = function (geocodeResult) {
      searchInputEl.value = geocodeResult.formatted_address;
      updateSearchLocation(
        geocodeResult.formatted_address, geocodeResult.geometry.location);
    };

    if (geocodeCache.has(query)) {
      handleResult(geocodeCache.get(query));
      return;
    }
    const request = { address: query, bounds: locator.map.getBounds() };
    geocoder.geocode(request, function (results, status) {
      if (status === 'OK') {
        if (results.length > 0) {
          const result = results[0];
          geocodeCache.set(query, result);
          handleResult(result);
        }
      }
    });
  };

  // Configure a geocodificação na entrada de pesquisa
  searchButtonEl.addEventListener('click', function () {
    geocodeSearch(searchInputEl.value.trim());
  });

  // Adicione um ouvinte de evento para a tecla Enter.
  searchInputEl.addEventListener('keypress', function (evt) {
    if (evt.key === 'Enter') {
      geocodeSearch(searchInputEl.value);
    }
  });
}

function prioritizeItem(list, itemId) {
  const sortedList = [...list];

  sortedList.sort((a, b) => {
    if (a.id === itemId) {
      return -1; // Coloca o item 'a' em primeiro lugar
    } else if (b.id === itemId) {
      return 1; // Coloca o item 'b' em primeiro lugar
    } else {
      return 0; // Mantém a ordem original
    }
  });

  return sortedList;
}

async function getAllItems() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const firstId = urlParams.get('id');
  const response = await fetch('http://177.136.202.132:9598/pubs/');
  const items = await response.json();
  const prioritizedItems = prioritizeItem(items, firstId);
  return prioritizedItems;
}

async function addLatLonItems(items) {
  const updatedItems = await Promise.all(items.map(async (item) => {
    const endereco = item.address.fully; // Substitua pelo endereço desejado
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(endereco)}&format=json&limit=1`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.length > 0) {
      item.address.lat = Number(data[0].lat);
      item.address.lng = Number(data[0].lon);
    } else {
      console.log("Nenhum resultado encontrado.");
    }
    return item;
  }));
  return updatedItems;
}

async function setConfiguration() {
  const items = await getAllItems();
  const updatedItems = await addLatLonItems(items);
  const locations = updatedItems.map(item => ({
    title: item.address.fully.trim().split(" -")[0],
    address1: item.address.fully.trim().split(",")[0],
    address2: item.address.fully.trim() + " - MG, Brasil",
    coords: { lat: item.address.lat, lng: item.address.lng },
    placeId: item.id
  }));

  const chave = "mapConfiguration";
  const valor = JSON.stringify(locations);
  localStorage.setItem(chave, valor);
}

function initMap() {
  const myLatLng = { lat: -25.363, lng: 131.044 };
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 4,
    center: myLatLng,
  });

  new google.maps.Marker({
    position: myLatLng,
    map,
    title: "Hello World!",
  });
  new google.maps.Marker({
    position: { lat: -19.9362084, lng: -44.0268516 },
    map,
    title: "Barzinho",
  });
}

setConfiguration()
  .then(() => {
    window.initMap = initMap;
  })
  .catch(error => {
    console.log(error);
  });
