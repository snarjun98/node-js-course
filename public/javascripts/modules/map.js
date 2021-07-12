import axios from 'axios';
import { $ } from './bling';
const mapOptions={
    center:{lat:43.2,lng : -79.8},
    zoom:8
}

function loadPlaces(map,lat=43.2,lng=-79.8){
    axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`).then(res=>{
        const place =res.data;
        if(!place.length){
            alert('no places found!');
            return;
        }
    //create a bounds
    const bounds = new google.maps.LatLngBounds();
    const infoWindow = new google.maps.InfoWindow();

    const markers=place.map(place=>{
        const[placeLng,placeLat]=place.location.coordinates;
        const position = {
            lat:placeLat,
            lng:placeLng
        };
        bounds.extend(position);
        const marker = new google.maps.Marker({
            map,
            position
        })
        marker.place=place;
        return marker;

    })

    //when someone clicks on a marker , show the deatils of that place
    markers.forEach(marker=>marker.addListener('click',function(){
        const html=`<div class='popup'>
        <a href="/stores/${this.place.slug}">
        <img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}" />
        <p>${this.place.name}-${this.place.location.address}</p>
        </a>`
        infoWindow.close();
        infoWindow.setContent(html);
        infoWindow.open(map,marker);
    }))


    //then zoom the map to fit all marker
    map.setCenter(bounds.getCenter());
    map.fitBounds(bounds);
})
}
function makeMap(mapDiv){
    if (!mapDiv) return;
    const map = new google.maps.Map(mapDiv,mapOptions);
    loadPlaces(map);
    const input =($('[name="geolocate"]'));
    const autoComplete= new google.maps.places.Autocomplete(input);
    autoComplete.addListener('place_changed',()=>{
        const place = autoComplete.getPlace();
        loadPlaces(map,place.geometry.location.lat(),place.geometry.location.lng())
    })

}

export default makeMap;
