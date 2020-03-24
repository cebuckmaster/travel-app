var path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const GeoNames = require('geonames.js');
const sqlite3 = require('sqlite3').verbose();


let savedTrips = [];

dotenv.config();

const darkSkyUrl = 'https://api.darksky.net/forecast/'+process.env.DARK_SKY_KEY+'/';
const pixabayUrl = 'https://pixabay.com/api/?key='+process.env.PIXABAY_KEY+'&image_type=photo&q=';

const geonames = new GeoNames({
    username: process.env.GEONAMES_USERNAME,
    lan: 'en',
    encoding: 'JSON'
});

const app = express();

app.use(bodyParser.urlencoded({ extended:false }));
app.use(bodyParser.json());

app.use(cors());

app.use(express.static('dist'));

console.log(__dirname);

app.get('/', function (req, res) {
    res.sendFile('dist/index.html');
});

app.listen(8081, function () {
    console.log('Server listening on port 8081');
});

app.post('/tripDetails', getTripDetails);
app.get('/getSavedTrips', getSavedTrips);
app.post('/saveTrip', saveTrip);
app.post('/removeTrip', removeTrip);
app.post('/getTrip', getTrip);
/*
*   getTrip - API Get to that gets data for a specific Trip that was save in the Sqlite Database
**/
//----------------------------------------------------------------
function getTrip(req, res) {

    const id = req.body.id;

    let trip = {
        id: id,
        country: '',
        city: '',
        state: '',
        departDate: '',
        unixTime: '',
        highTemp: '',
        lowTemp: '',
        cloudCover: '',
        pixURL: ''
    };

    let db = connectDb();
    let sqlStr = `SELECT * from trips WHERE id = ?;`;

    db.all(sqlStr, [id], (err, rows) => {
        if (err) {
            throw err;
        }

        rows.forEach((row) => {
            trip.city = row.city;
            trip.country = row.country;
            trip.state = row.state;
            trip.departDate = row.departDate;
            trip.unixTime = row.unixTime;
        });
        
        let location = '';
        if (trip.state === '') {
            location = trip.country;
        } else {
            location = trip.state;
        }

        geonames.search({name: trip.city+','+location})
        .then(resp => {
            if (resp.totalResultsCount >= 1) {
                const lng = resp.geonames[0].lng;
                const lat = resp.geonames[0].lat;
                getURLData(darkSkyUrl+lat+','+lng+','+trip.unixTime+'?exclude=currently,minutely,hourly')
                .then(function(weatherData) {
                    if (weatherData.daily != undefined) {
                        trip.highTemp = weatherData.daily.data[0].temperatureHigh;
                        trip.lowTemp = weatherData.daily.data[0].temperatureLow;
                        trip.cloudCover = weatherData.daily.data[0].cloudCover;
                    }
                    getURLData(pixabayUrl+encodeURIComponent(trip.city+'+'+location))
                    .then(function(pixabayData) {
                        if (parseInt(pixabayData.totalHits) > 0) {
                            trip.pixURL = pixabayData.hits[0].webformatURL;
                        } 
                        res.send(trip);
                    })
                    .catch(postError =>  {
                        console.log(postError);
                        res.send(trip);
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.send(trip);
                });
            } else {
                res.send(trip);
            }
        })
        .catch(err => {
            console.error(err);
            res.send(trip);
        });
    });

    db.close();
}
/*
*   removeTrip - API POST to remove a trip from the Sqlite Database
**/
//----------------------------------------------------------------
function removeTrip(req, res) {
    const id = req.body.id;

    if (id == '') {
        return false;
    }

    let db = connectDb();

    let sqlStr = `DELETE FROM trips WHERE id = ?;`;

    db.all(sqlStr, [id], (err, rows) => {
        if (err) {
            throw err;
        }
        res.send({ result: 'Trip Removed' });
    });

    db.close();
}
/*
*   saveTrip - API POST to save a trip from the Sqlite Database
**/
//-----------------------------------------------------------------
function saveTrip(req, res) {
    const data = req.body;
 
    let db = connectDb();

    let strSQL = `INSERT INTO trips (country, city, state, departDate, unixTime) VALUES 
                 ('${data._country}', '${data._city}', '${data._state}', '${data._date}', '${data._unixTime}');`;

    db.run(strSQL);

    db.close();

    res.send({ result: 'Trip Saved'});

}
/*
*   getSavedTrips - API GET to get all trips saved in the Sqlite Database
**/
//-----------------------------------------------------------------
function getSavedTrips (req, res) {

    let db = connectDb();

    savedTrips = [];

    db.all("SELECT * from trips", [], (err, rows) => {
        if (err) {
            throw err;
        }
        savedTrips.push(...rows);
        res.send({ result: savedTrips });
    });

    db.close();

}
/*
*   getTripDetails - API GET get the details of a trip that was added from the website
**/
//-----------------------------------------------------------------
function getTripDetails(req, res) {

    const data = req.body;

    let response = {
        highTemp: '',
        lowTemp: '',
        cloudCover: '',
        pixURL: ''
    };

    geonames.search({name: data.city+','+data.country})
    .then(resp => {
        if (resp.totalResultsCount >= 1) {
            const lng = resp.geonames[0].lng;
            const lat = resp.geonames[0].lat;
            getURLData(darkSkyUrl+lat+','+lng+','+data.time+'?exclude=currently,minutely,hourly')
            .then(function(weatherData) {
                response.highTemp = weatherData.daily.data[0].temperatureHigh;
                response.lowTemp = weatherData.daily.data[0].temperatureLow;
                response.cloudCover = weatherData.daily.data[0].cloudCover;
                getURLData(pixabayUrl+encodeURIComponent(data.city+'+'+data.country))
                .then(function(pixabayData) {
                    if (parseInt(pixabayData.totalHits) > 0) {
                        response.pixURL = pixabayData.hits[0].webformatURL;
                    } 
                    res.send(response);
                })
                .catch(postError => {
                    console.log(postError);
                    res.send(response);
                });
            })
            .catch(err => {
                console.log(err);
                res.send(response);
            });
        } else {
            res.send(response);
        }

    })
    .catch(err => {
        console.error(err);
        res.send(response);
    });

}
//----------------------------------------------------------------------
async function getURLData(url = '') {

    const respone = await fetch(url);

    try {
        if (respone.status === 200) {
            const resp = await respone.json();
            return resp;
        }
    } catch(error) {
        console.log('Error in getURLData', error);
        return '{ status: Error }'
    }

}
/*
*   used to open a connection to the Sqlite Database
**/
//----------------------------------------------------------------------
function connectDb() {
    return new sqlite3.Database(__dirname+'/database/trips.db', (err) => {
        if (err) {
            return console.error(err);
        }
        console.log('Connected to trips sqlite database');
    });
    
}


module.exports = removeTrip;