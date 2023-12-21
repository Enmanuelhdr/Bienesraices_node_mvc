(function () {


    const lat = document.querySelector('#lat').value || 18.4737868;
    const lng = document.querySelector('#lng').value || -69.9374393;
    const mapa = L.map('mapa').setView([lat, lng], 12);
    let marker;

    // Utilizar provider y deocoder
    const geocoderService = L.esri.Geocoding.geocodeService();


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // pin
    marker = new L.marker([lat, lng], {
        draggable: true,
        autoPan: true
    })
        .addTo(mapa)

    // Detectar el movimiento del pin
    marker.on('moveend', function (e) {
        marker = e.target;
        const posicion = marker.getLatLng();
        
        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng));

        // Obtener la informacion de las calles al soltar el pin
        geocoderService.reverse().latlng(posicion, 13).run(function(error, resultado){
            marker.bindPopup(resultado.address.LongLabel)

            // LLenar los campos
            document.querySelector('.calle').textContent = resultado?.address?.Address ?? '';
            document.querySelector('#calle').value = resultado?.address?.Address ?? '';
            document.querySelector('#lat').value = resultado?.latlng?.lat ?? '';
            document.querySelector('#lng').value = resultado?.latlng?.lng ?? '';
        })
    })


})()