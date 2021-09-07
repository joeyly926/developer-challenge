import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import io from 'socket.io-client';

let reducer = (state = {}, { type, payload }) => {
    switch (type) {
        case 'LOGIN':
            return Object.assign({}, state, {
                attemptingToConnect: true,
            });
        case 'REGISTER':
            return Object.assign({}, state, {
                attemptingToRegister: true,
            });
        case 'ADD_VACCINATION':
            return Object.assign({}, state, {
                attemptingToSubmitVaccination: true,
            });
        case 'GET_PATIENT_VACCINATIONS':
            return Object.assign({}, state, {
                gettingPatientVaccinations: true,
            });
        case 'GET_VACCINATION_MANUFACTURERS':
            return Object.assign({}, state, {
                gettingManufacturers: true,
            });
        case 'ADD_PATIENT':
            return Object.assign({}, state, {
                attemptingToSubmitPatient: true,
            });
        case 'GET_PATIENTS':
            return Object.assign({}, state, {
                gettingPatents: true,
            });
        case 'GET_HEALTHCARE_PROVIDERS':
            return Object.assign({}, state, {
                gettingHealthcareProviders: true,
            });
        case 'SESSION_STATUS_UPDATE':
            return Object.assign({}, state, {
                sessionData: payload.sessionData,
                attemptingToConnect: false,
                attemptingToRegister: false,
                attemptingToSubmitPatient: false,
                attemptingToSubmitVaccination: false,
            });
        case 'CONTRACT_STATE_UPDATE':
            return Object.assign({}, state, {
                contractState: payload.contractState,
                lastEvent: payload.eventDescription
            });
        default: return state;
    }
}

const socketHandler = (socket) => (store) => (next) => (action) => {
    switch (action.type) {
        case 'PLACE_BET':
        case 'PLAYER_READY_TO_RACE':
        case 'LOGIN':
        case 'REGISTER':
        case 'ADD_VACCINATION':
        case 'GET_VACCINE_MANUFACTURERS':
        case 'ADD_PATIENT':
        case 'GET_PATIENTS':
        case 'GET_HEALTHCARE_PROVIDERS':
        case 'SET_SOUNDS':
        case 'LOGOUT':
            socket.emit('action', action); break;
        default: break;
    }
    next(action);
};

const socket = io.connect('/');

const middleWare = applyMiddleware(socketHandler(socket));

const store = createStore(reducer, middleWare);

socket.on('action', (data) => {
    store.dispatch(data);
});
ReactDOM.render(<Provider store={store}><App /></Provider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
