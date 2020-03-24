'use strict';

const datepicker = require('js-datepicker');
import { Trip } from './trip';

const loadedTrip = new Trip();
const saveTripButton = document.querySelector('#save-trip');
const removeTripButton = document.querySelector('#remove-trip');
const savedTrips = document.querySelector('#saved-trips');

document.addEventListener('DOMContentLoaded', () => {

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
            .then( () =>  { console.log('Service Worker Registed'); });
        });
    }

    saveTripButton.style.visibility = "hidden";
    removeTripButton.style.visibility = "hidden";

    TravelAPI.loadSavedTrips();

    const addTrip = document.querySelector('#add-trip');

    addTrip.addEventListener('click', () => {
        addTripModal();
    });

    saveTripButton.addEventListener('click', () => {
        TravelAPI.saveCurrentTrip(loadedTrip);
    })

    removeTripButton.addEventListener('click', () => {
        TravelAPI.removeCurrentTrip(loadedTrip);
    })

    savedTrips.addEventListener('change', () => {
        getSavedTrip(savedTrips.value);
    });
});
/*
* Used to get Saved Trips by calling a Rest API and loading Saved Trip from the SQL Database
*/
//-----------------------------------------------------------------------------------
function getSavedTrip(id) {

    loadedTrip.clear();

    let data = {
        id: id
    }
    
    TravelAPI.postData('http://localhost:8081/getTrip', data)
    .then(function(tripData) {
        loadedTrip.id = id;
        loadedTrip.city = tripData.city;
        loadedTrip.country = tripData.country;
        loadedTrip.state = tripData.state;
        loadedTrip.departDate = tripData.departDate;
        loadedTrip.highTemp = tripData.highTemp;
        loadedTrip.lowTemp = tripData.lowTemp;
        loadedTrip.cloudCover = tripData.cloudCover;
        loadedTrip.pixURL = tripData.pixURL;
        loadWebPage();
        removeTripButton.style.visibility = "visible";
    }, function(err) {
        alert('Error was found in getting trip data');
        console.log(err);
    });

}
/*
* This starts the Add Trip Modal when the Add Button is clicked.  
* It validates the inputs and gets the trip details
*/
//-----------------------------------------------------------------------------------
function addTripModal() {

    clearTripModal();

    const savedTrips = document.querySelector('#saved-trips');
    savedTrips.value = '';

    const divTripState = document.querySelector("#div-trip-state");
    const tripCountry = document.querySelector('#trip-country');

    const addTripModal = document.querySelector('#add-trip-modal');
    const closeBtn = document.getElementsByClassName('close')[0];
    const submitBtn = document.querySelector('#trip-submit');

    const departDate = datepicker('#trip-departure-date', {
        formatter: (input, date, instance) => {
            const value = date.toLocaleDateString();
            input.value = value;
        }
    });

    divTripState.setAttribute("class", "hide-state-input");

    tripCountry.addEventListener('blur', () => {
        let country = tripCountry.value;
        if (country.includes('United States') || country.includes('America')) {
            divTripState.setAttribute("class", "show-state-input");
        } else {
            divTripState.setAttribute("class", "hide-state-input");
        }
    });

    addTripModal.style.display = 'block';
    closeBtn.addEventListener('click', () => {
        departDate.remove();
        addTripModal.style.display = 'none';
    });

    submitBtn.addEventListener('click', () => {
        if(validateNewTrip()) {
            departDate.remove();
            removeTripButton.style.visibility = 'hidden';
            saveTripButton.style.visibility = "visible";
            addTripModal.style.display = 'none';
            getTripDetails();
        }
    });

}
/*
* This is used to validate the Add Trip Modal inputs and load the Trip Class
*/
//-------------------------------------------------------------------------
function validateNewTrip() {

    const country = document.querySelector('#trip-country');
    const state = document.querySelector('#trip-state');
    const city = document.querySelector('#trip-city');
    const depDate = document.querySelector('#trip-departure-date');

    if (country.value === null || country.value === '') {
        alert("You must enter in a Country");
        return false;
    } 
    if (city.value === null || city.value === '') {
        alert("You must enter in a City");
        return false;
    }
    if (depDate.value === null || depDate.value === '') {
        alert("You must enter in a Departure Date");
        return false;
    }
    
    if (country.value.includes('United States') || country.value.includes('America')) {
        if (state.value === null || state.value === '') {
            alert("You must enter a State in the United States");
            return false;
        }
    }

    loadedTrip.country = country.value;
    loadedTrip.state = state.value;
    loadedTrip.city = city.value;
    loadedTrip.departDate = depDate.value;

    return true;

}
//----------------------------------------------------------------
function clearTripModal() {

    document.querySelector('#trip-country').value = '';
    document.querySelector('#trip-state').value = '';
    document.querySelector('#trip-city').value = '';
    document.querySelector('#trip-departure-date').value = '';

}
/*
* This is used to get the Trip Details via a Rest API to the server
*/
//-----------------------------------------------------------------
function getTripDetails() {

    let data = {};

    if (loadedTrip.isUnitedStates()) {
        data = {
            country: loadedTrip.state,
            city: loadedTrip.city,
            time: loadedTrip.unixTime()
        }
    } else {
        data = {
            country: loadedTrip.country,
            city: loadedTrip.city,
            time: loadedTrip.unixTime()
        }
    }

    TravelAPI.postData('http://localhost:8081/tripDetails', data)
    .then(function(tripData) {
        loadedTrip.highTemp = tripData.highTemp;
        loadedTrip.lowTemp = tripData.lowTemp;
        loadedTrip.cloudCover = tripData.cloudCover;
        loadedTrip.pixURL = tripData.pixURL;
        loadWebPage();
    }, function(err) {
        alert('Error was found in getting trip data');
        console.log(err);
    });

}
//-----------------------------------------------------------------------------------
function loadWebPage() {

    if (loadedTrip.state != '') {
        document.querySelector('#trip-location').textContent = `My trip to : ${loadedTrip.city}, ${loadedTrip.state}`;
    } else {
        document.querySelector('#trip-location').textContent = `My trip to : ${loadedTrip.city}, ${loadedTrip.country}`;
    }
    document.querySelector('#trip-date').textContent = `Departing: ${loadedTrip.departDate}`;
    
    if (loadedTrip.getDaysTill() == 0) {
        document.querySelector('#days-away').textContent = `Your trip has already past.`;
    } else {
        document.querySelector('#days-away').textContent = `${loadedTrip.city}, ${loadedTrip.country} is ${loadedTrip.getDaysTill()} days away`;
    }

    if (loadedTrip.highTemp != '') {
        document.querySelector('#trip-temps').textContent = `High - ${loadedTrip.highTemp}, Low - ${loadedTrip.lowTemp}`;
        document.querySelector('#trip-type').textContent = `${loadedTrip.cloudCover} throughout the day`;
    } else {
        document.querySelector('#trip-temps').textContent = `Sorry could not find weather data for this location`;
        document.querySelector('#trip-type').textContent = ``;
    }
    if (loadedTrip.pixURL != '') {
        document.getElementById('location-pix').src = loadedTrip.pixURL;
    }

}

export { addTripModal};
