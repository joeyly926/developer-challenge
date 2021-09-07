const { db, list } = require('../mongo');
const coll = db.collection('patients');
const { ObjectId } = require('mongodb');
const { generateKeyPair } = require('../auth');
const { postPassport, getPatientVaccinationStatus } = require('../contract');
const { getPatientVaccinations } = require('./vaccination');

async function getPatients(options) {
    const { filter: { healthcareProviderId } = {} } = options;
    if (healthcareProviderId) {
        options = {
            ...options,
            filter: {
                'healthcareProvider._id': new ObjectId(healthcareProviderId)
            }
        }
    }

    const patients = await list(coll, options);

    await Promise.all(patients.items.map(patient => Promise.all([
        getPatientVaccinations(patient._id).then(vaccinations => patient.vaccinations = vaccinations),
        getPatientVaccinationStatus(patient.contractAddress).then(fullyVaccinated => patient.fullyVaccinated = fullyVaccinated),
    ])));

    return patients;
}

async function getPatient(_id) {
    return _id && await coll.findOne({ _id: ObjectId(_id) });
}

async function addPatient(patient) {
    const {
        name,
        healthcareProvider,
        ssn,
    } = patient ?? {};
    if (ssn && healthcareProvider?._id && name) {
        // find user by username
        const found = await coll.findOne({ ssn });

        // Storing *both* keys in MongoDB for sake of easy in development :)
        const { publicKey, privateKey } = generateKeyPair();

        // register user only if no other user has username
        if (!found) {
            console.log('Creating Passport');
            const contractResult = await postPassport({ publicKey });
            console.log('Adding patient to mongo')
            healthcareProvider._id = new ObjectId(healthcareProvider._id);
            const result = await coll.insertOne({
                name,
                healthcareProvider,
                publicKey,
                privateKey,
                ssn,
                contractAddress: contractResult.contractAddress,
            });

            if (result?.acknowledged && contractResult) {
                console.log('Patient successfully added');
                return await getPatient(result.insertedId);
            }
        } else {
            console.log(`Patient with ${ssn} already exists.`);
        }
    }
}

module.exports = {
    getPatients,
    getPatient,
    addPatient,
}