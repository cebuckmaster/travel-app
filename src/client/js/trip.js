class Trip {

    set id(id) {
        this._id = id;
    }

    get id() {
        return this._id;
    }

    set country(country) {
        this._country = country;
    }

    get country() {
        return this._country;
    }

    set state(state) {
        this._state = state;
    }

    get state() {
        return this._state;
    }

    set city(city) {
        this._city = city;
    }

    get city() {
        return this._city;
    }

    set departDate(date) {
        this._date = date;
    }

    get departDate() {
        return this._date;
    }

    set highTemp(temp) {
        this._highTemp = temp;
    }

    get highTemp() {
        return this._highTemp;
    }

    set lowTemp(temp) {
        this._lowTemp = temp;
    }

    get lowTemp() {
        return this._lowTemp;
    }

    set cloudCover(cover) {
        this._cloudCover = cover;
    }

    get cloudCover() {

        if (this._cloudCover < 0.25) {
            return "Sunny";
        }

        if (this._cloudCover < 0.35) {
            return "Mostly Sunny";
        }

        if (this._cloudCover < 0.50) {
            return "Partly Cloudy";
        }

        if (this._cloudCover < 0.75) {
            return "Mostly Cloudy";
        }

        return "Cloudy";
    }

    set pixURL(img) {
        this._pixURL = img;
    }

    get pixURL() {
        return this._pixURL;
    }

    isTripLoaded() {

        if (this._country != undefined && this._country != '') {
            return true;
        }

        return false;

    }
    clear() {
        this._id = '';
        this._country = '';
        this._state = '';
        this._city = '';
        this._date = '';
        this._cloudCover = 0;
        this._highTemp = '';
        this._lowTemp = '';
        this._pixURL = '';
        this._unixTime = '';
    }

    getDaysTill() {

        let depDate = new Date(this._date);
        let mTodaysDate = new Date();

        if (depDate > mTodaysDate) {
            let diffTime = depDate.getTime() - mTodaysDate.getTime(); 
            return Math.round(diffTime / (1000 * 3600 * 24));
        } else {
            return 0;
        }
    }

    isUnitedStates() {
        if (this._country.includes('United States') || this._country.includes('America')) {
            return true;
        } 
        return false;
    }

    unixTime() {
        let depDate = new Date(this._date);

        this._unixTime = `${depDate.getFullYear()}-${('0' + depDate.getMonth()).slice(-2)}-${('0' + depDate.getDate()).slice(-2)}T13:00:00`;

        return this._unixTime;
    }

}

export { Trip };

