const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const session = require("express-session")({
  secret: "my-secret",
  resave: true,
  saveUninitialized: true
});
const sharedsession = require("express-socket.io-session");
const mongo = require('./utils/mongo');
const { PORT } = require('./config');
const { contractInit, contractClient } = require('./utils/contract');

// TODO: Add parameter validation
// TODO: Documentation

// Connect to mongo first to establish singleton
mongo.connect().then(() => {
  contractInit();
  const { registerUser, loginUser } = require('./utils/models/user');
  const { getPatients, addPatient } = require('./utils/models/patient');
  const { getHealthcareProviders } = require('./utils/models/healthcareProvider');
  const { addVaccination, getPatientVaccinations } = require('./utils/models/vaccination');
  const { getVaccineManufacturers } = require('./utils/models/manufacturer');

  app.use(session);

  io.use(sharedsession(session));

  app.use(express.static(path.resolve(__dirname + '/../client/build')));

  io.on('connection', (socket) => {
    let eventListener = (eventLabel) => {
      console.log('Event: ' + eventLabel + ' (client ' + socket.handshake.session.id + ')');
      dispatchContratStateUpdate(socket, 'Contract status changed');
    };

    dispatchSessionInformation(socket);

    socket.handshake.session.data = { };

    socket.on('action', ({ type, payload }) => {
      switch (type) {
        case 'LOGIN':
          handleLogin(socket, payload, eventListener);
          break;
        case 'REGISTER':
          handleRegister(socket, payload, eventListener);
          break;
        case 'LOGOUT':
          handleLogout(socket);
          break;
        case 'GET_PATIENTS':
          handleGetPatients(socket, payload);
          break;
        case 'GET_PATIENT_VACCINATIONS':
          handleGetPatientVaccinations(socket, payload);
          break;
        case 'ADD_VACCINATION':
          handleAddVaccination(socket, payload);
          break;
        case 'ADD_PATIENT':
          handleAddPatient(socket, payload);
          break;
        case 'GET_HEALTHCARE_PROVIDERS':
          handleGetHealthcareProviders(socket, payload);
          break;
        case 'GET_VACCINE_MANUFACTURERS':
          handleGetVaccineManufacturers(socket, payload);
          break;
      }
    });

  });

  let handleGetVaccineManufacturers = async (socket, payload) => {
    console.log('Getting vaccine manufacturers (client ' + socket.handshake.session.id + ')');
    const vaccineManufacturers = await getVaccineManufacturers(payload);
    socket.handshake.session.data.vaccineManufacturers = vaccineManufacturers;
    dispatchSessionInformation(socket);
  }

  let handleGetHealthcareProviders = async (socket, payload) => {
    console.log('Getting healthcare providers (client ' + socket.handshake.session.id + ')');
    const healthcareProviders = await getHealthcareProviders(payload);
    socket.handshake.session.data.healthcareProviders = healthcareProviders;
    dispatchSessionInformation(socket);
  }

  let handleGetPatientVaccinations = async (socket, payload) => {
    console.log('Getting patients (client ' + socket.handshake.session.id + ')');
    const patients = await getPatientVaccinations(payload?._id);
    socket.handshake.session.data.patients = patients;
    dispatchSessionInformation(socket);
  }

  let handleAddVaccination = async (socket, payload) => {
    console.log('Getting patients (client ' + socket.handshake.session.id + ')');
    const patients = await addVaccination(payload);
    socket.handshake.session.data.patients = patients;
    dispatchSessionInformation(socket);
  }

  let handleGetPatients = async (socket, payload) => {
    console.log('Getting patients (client ' + socket.handshake.session.id + ')');
    const patients = await getPatients(payload);
    socket.handshake.session.data.patients = patients;
    dispatchSessionInformation(socket);
  }

  let handleAddPatient = async (socket, payload) => {
    console.log('Adding patient (client ' + socket.handshake.session.id + ')');
    const patient = await addPatient(payload);
    socket.handshake.session.data.patientAdded = patient;
    dispatchSessionInformation(socket);
  }

  let handleRegister = async (socket, payload, eventListener) => {
    console.log('Attempting to register user ' + (payload.username || '') + '" (client ' + socket.handshake.session.id + ')');
    const user = await registerUser(payload);
    console.log('User registered:', !!user)

    socket.handshake.session.data = {
      registered: !!user,
      user,
    };

    dispatchSessionInformation(socket);
  };

  let handleLogin = async (socket, payload, eventListener) => {
    console.log('Attempting to connect with user "' + (payload.username || '') + '" (client ' + socket.handshake.session.id + ')');
    const {
      username,
      password,
    } = payload;
    const user = await loginUser(username, password);
    console.log('User logged in:', !!user)

    socket.handshake.session.data = {
      loggedIn: !!user,
      user,
    };

    dispatchSessionInformation(socket);
  };

  let handleLogout = (socket) => {
    console.log('Disconnected from ' + socket.handshake.session.data.url + ' with user "' + (socket.handshake.session.data.user || '') + '" (client ' + socket.handshake.session.id + ')');

    delete socket.handshake.session.data;
    socket.handshake.session.save();
    dispatchSessionInformation(socket);
  };

  let dispatchSessionInformation = (socket) => {
    socket.emit('action', {
      type: 'SESSION_STATUS_UPDATE', payload: {
        sessionData: socket.handshake.session.data || {}
      }
    });
  };

  async function init() {

    console.log(`Kaleido DApp backend listening on port ${PORT}!`);
    server.listen(PORT);
  }

  init().catch(err => {
    console.error(err.stack);
    process.exit(1);
  });
});
