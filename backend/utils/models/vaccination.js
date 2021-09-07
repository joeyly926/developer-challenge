const { db, list } = require('../mongo');
const coll = db.collection('vaccinations');
const { ObjectId } = require('mongodb');
const { addDose } = require('../contract');

async function getVaccinations() {
    return await list(coll);
}

async function getVaccination(_id) {
    return _id && await coll.findOne({ _id: ObjectId(_id) });
}

async function deleteVaccination(_id) {
    return _id && await coll.deleteOne({ _id: ObjectId(_id) });
}

async function getPatientVaccinations(_id) {
    console.log("Getting patient vaccinations: " + _id);
    return _id && await coll.find({ 'patient._id': ObjectId(_id) }).toArray();
}

async function addVaccination(vaccination) {
    const { getPatient } = require('./patient');
    const { getVaccineManufacturer } = require('./manufacturer');
    let {
        patient,
        lotNumber,
        vaccineManufacturer,
        date,
    } = vaccination ?? {};

    patient = await getPatient(new ObjectId(patient._id));
    vaccineManufacturer = await getVaccineManufacturer(new ObjectId(vaccineManufacturer._id));

    if (patient && vaccineManufacturer) {
        const result = await coll.insertOne({
            patient,
            lotNumber,
            vaccineManufacturer,
            date,
        });
    
        if (result?.acknowledged) {
            console.log('Vaccination successfully added. Adding to contract...');
            const contractRes = await addDose(patient.contractAddress, vaccineManufacturer.name, vaccineManufacturer.requiredDoses);

            if (contractRes) {
                return await getVaccination(result.insertedId);
            } else {
                console.log("Reverting vaccination entry...");
                await deleteVaccination(result.insertedId);
            }
        }
    } else {
        console.log("Patient or vaccine manufacturer not found");
    }
}

module.exports = {
    getVaccinations,
    getPatientVaccinations,
    getVaccination,
    addVaccination,
    deleteVaccination,
}