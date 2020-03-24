/*
*   This is used to remove the current loaded trip from the database and clear the HTML Page
*/
//----------------------------------------------------------------------------------
function removeCurrentTrip(loadedTrip) {

    const removeTripButton = document.querySelector('#remove-trip');

    if (loadedTrip.id === '') {
        return false;
    }

    let data = {
        id: loadedTrip.id
    }

    TravelAPI.postData('http://localhost:8081/removeTrip', data)
    .then(function(resp) {
        loadedTrip.clear();
        alert('Trip was removed');
        document.querySelector('#trip-location').textContent = 'My trip to : ';
        document.querySelector('#trip-date').textContent = 'Departing: ';
        document.querySelector('#days-away').textContent = '';
        document.querySelector('#trip-temps').textContent = '';
        document.querySelector('#trip-type').textContent = '';
        document.getElementById('location-pix').src = "/src/client//media/take-off-pic.jpg";
        loadSavedTrips();
        removeTripButton.style.visibility = 'hidden';
    })
    .catch(err => console.log(err));        

}
/*
* This is used to save the current Trip via a Rest API to the Server and the SQLLite Database
*/
//----------------------------------------------------------------------------------
function saveCurrentTrip(loadedTrip) {

    const removeTripButton = document.querySelector('#remove-trip');
    const saveTripButton = document.querySelector('#save-trip');

    if (loadedTrip.isTripLoaded()) {
        TravelAPI.postData('http://localhost:8081/saveTrip', loadedTrip)
        .then(function(resp) {
            alert(resp.result);
        }, function(err) {
            alert('Error was found saving trip data');
            console.log(err);            
        });
        removeTripButton.style.visibility = 'hidden';
        saveTripButton.style.visibility = 'hidden';
        loadSavedTrips();
    } else {
        alert('You must first load a trip before it can be saved');
    }

}
/*
* This is used to load all the saved trips from the Server. 
*/
//-----------------------------------------------------------------------------------
function loadSavedTrips() {


    const savedTrips = document.querySelector('#saved-trips');
    const divSavedTripsSelection = document.querySelector('.saved-trips-selection');
    
    divSavedTripsSelection.style.visibility = "hidden";

    let option = document.createElement('option');
    let defaultOption = document.createElement('option');

    removeOptions(savedTrips);

    defaultOption.text = 'Select a Saved Trip';
    defaultOption.value = '';
    savedTrips.add(defaultOption);
    
    getData('http://localhost:8081/getSavedTrips')
    .then(resp => {
        if (Array.isArray(resp.result)) {
            if (resp.result.length > 0) {
                for (let i = 0; i < resp.result.length; i++) {
                    option = document.createElement('option');
                    if (resp.result[i].state === '') {
                        option.text = resp.result[i].city+', '+resp.result[i].country;
                    } else {
                        option.text = resp.result[i].city+', '+resp.result[i].state;
                    }
                    option.value = resp.result[i].id;
                    savedTrips.add(option);
                }
                divSavedTripsSelection.style.visibility = "visible";
            }
        } 
    })
    .catch(err => console.log(err));

}
//------------------------------------------------------------------------
function removeOptions(selectElement) {
    let len = selectElement.options.length - 1;
    for (let i = len; i >= 0; i--) {
        selectElement.remove(i);
    }
}
//--------------------------------------------------------------------------------
async function getData(url = '') {

    const response = await fetch(url);
    try {
        const resp = await response.json();
        return resp;
    } catch(error) {
        console.log('Error in getData', error);
        return Promise.reject('Error in getData' + error);
    }

}

export {removeCurrentTrip}
export {saveCurrentTrip}
export {loadSavedTrips}

module.exports = removeCurrentTrip;