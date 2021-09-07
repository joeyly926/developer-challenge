const { db, list } = require('../mongo');
const coll = db.collection('healthcareProviders');

async function getHealthcareProviders(options) {
    return await coll.find({}).toArray();
}

module.exports = {
    getHealthcareProviders,
}