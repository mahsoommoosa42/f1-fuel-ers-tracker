const { F1TelemetryClient, constants } = require('f1-2020-client');
const { PACKETS, EVENT_CODES } = constants;

var fs = require('fs');

const client = new F1TelemetryClient();
client.start();

var currentLap = 0;
var init_fuel_load = 0;
var init_ers_joule = 0;
var fuel_load = 0;
var ers_joule = 0;

client.on(PACKETS.carStatus, (packet) => {
    var statusData = packet.m_carStatusData;
    var playerIndex = packet.m_header.m_playerCarIndex;
    fuel_load = statusData[playerIndex].m_fuelRemainingLaps;
    ers_joule = statusData[playerIndex].m_ersStoreEnergy;
});

client.on(PACKETS.lapData, (packet) => {
    var sessionUID = packet.m_header.m_sessionUID;
    var lapData = packet.m_lapData;
    var playerIndex = packet.m_header.m_playerCarIndex;
    var fileName = 'data_' + sessionUID;
    if (currentLap < lapData[playerIndex].m_currentLapNum) {
        if (init_fuel_load != 0) {
            var fuel_diff = fuel_load - init_fuel_load;
            var ers_diff = ers_joule - init_ers_joule;
            var lastLapTime = lapData[playerIndex].m_lastLapTime;
            fs.appendFile(fileName, lastLapTime + " Fuel Diff" + fuel_diff + " Laps " + " ERS " + ers_diff + " Joules\n", (err) => {
                throw(err);
            })
        } else {
            fs.appendFile(fileName, "Initial Fuel Load =  " + fuel_load + "\n", (err) => {
                throw(err);
            })
            fs.appendFile(fileName, "Initial ERS Load =  " + ers_joule + "\n", (err) => {
                throw(err);
            })
        }
        init_fuel_load = fuel_load;
        init_ers_joule = ers_joule;
    }
});