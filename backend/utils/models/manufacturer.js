const { db } = require('../mongo');
const coll = db.collection('manufacturers');

async function getVaccineManufacturers() {
    return await coll.find({}).toArray();
}

async function getVaccineManufacturer(_id) {
    return _id && await coll.findOne({ _id });
}

module.exports = {
    getVaccineManufacturers,
    getVaccineManufacturer
}