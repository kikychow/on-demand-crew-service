# on-demand-crew-service
a RESTful service that provides on-demand crew scheduling information to other services

## Running the API server locally
1. Clone this repository
```
git clone https://github.com/kikychow/on-demand-crew-service.git
```
2. Move into the directory
```
cd on-demand-crew-service
```
3. Install dependecies:
```
npm install
```
4. Start the server:
```
npm start
```
The server wil be running on http://localhost:3000

## RESTful service
The service exposes 2 endpoints

### 1. Request an available pilot for a given datetime and location

`HTTP` `GET` /pilots/availability
```
http://localhost:3000/pilots/availability?location=Munich&depDateTime=2025-08-01T00:00:00Z&returnDateTime=2025-08-02T00:00:00Z
```

### 2. Schedule a Flight for a Pilot

`HTTP` `POST` /flights

with request body:
```
{
    "pilotId": 4,
    "depDateTime": "2025-08-01T09:00:00Z",
    "returnDateTime": "2025-08-01T10:00:00Z"
}
```
