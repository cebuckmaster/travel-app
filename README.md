# This is a Trip planner app that uses 3 API to get information about a trip

## This is the Capstone project for the Front-end nanodegree at Udacity

This application uses API from the folowing:

- [ ] GEONAMES to get longatude and latitude for a location

- [ ] Darksky to get the forecasted weather at the location

- [ ] Pixabay to get an picture of the location

All APIs are requested through the backend Server to provide security and issues with CORs access.

## The backend of this is using a NODE Express web service to host the main web page and REST APIs

The backend loads and saves trips to an SQLite3 Database.

This database is located in the src/server/database directory