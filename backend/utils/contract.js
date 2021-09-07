const {
    KALEIDO_REST_GATEWAY_URL,
    KALEIDO_AUTH_USERNAME,
    KALEIDO_AUTH_PASSWORD,
    CONTRACT_MAIN_SOURCE_FILE,
    CONTRACT_CLASS_NAME,
    FROM_ADDRESS,
} = require('../config');
const archiver = require('archiver');
const request = require('request-promise-native');
const Swagger = require('swagger-client');
const { URL } = require('url');

let client;

async function contractInit() {
    // Kaleido example for compilation of your Smart Contract and generating a REST API
    // --------------------------------------------------------------------------------
    // Sends the contents of your contracts directory up to Kaleido on each startup.
    // Kaleido compiles you code and turns into a REST API (with OpenAPI/Swagger).
    // Instances can then be deployed and queried using this REST API
    // Note: we really only needed when the contract actually changes.
    const url = new URL(KALEIDO_REST_GATEWAY_URL);
    url.username = KALEIDO_AUTH_USERNAME;
    url.password = KALEIDO_AUTH_PASSWORD;
    url.pathname = "/abis";
    var archive = archiver('zip');
    archive.directory("contracts", "");
    await archive.finalize();
    let res = await request.post({
        url: url.href,
        qs: {
            compiler: "0.5", // Compiler version
            source: CONTRACT_MAIN_SOURCE_FILE, // Name of the file in the directory
            contract: `${CONTRACT_MAIN_SOURCE_FILE}:${CONTRACT_CLASS_NAME}` // Name of the contract in the 
        },
        json: true,
        headers: {
            'content-type': 'multipart/form-data',
        },
        formData: {
            file: {
                value: archive,
                options: {
                    filename: 'smartcontract.zip',
                    contentType: 'application/zip',
                    knownLength: archive.pointer()
                }
            }
        }
    });
    // Log out the built-in Kaleido UI you can use to exercise the contract from a browser
    url.pathname = res.path;
    url.search = '?ui';
    console.log(`Generated REST API: ${url}`);

    // Store a singleton swagger client for us to use
    client = await Swagger(res.openapi, {
        requestInterceptor: req => {
            req.headers.authorization = `Basic ${Buffer.from(`${KALEIDO_AUTH_USERNAME}:${KALEIDO_AUTH_PASSWORD}`).toString("base64")}`;
        }
    });

    this.client = client;
    module.exports.client = this.client;
}

async function postPassport(passport) {
    // Note: we really only want to deploy a new instance of the contract
    //       when we are initializing our on-chain state for the first time.
    //       After that the application should keep track of the contract address.
    try {
        let postRes = await this.client.apis.default.constructor_post({
            body: {
                ...passport
            },
            "kld-from": FROM_ADDRESS,
            "kld-sync": "true"
        });
        console.log("Deployed instance: " + postRes.body.contractAddress);

        return postRes.body;
    }
    catch (err) {
        console.log(`Failed to add Passport: ${err.response && JSON.stringify(err.response.body) && err.response.text}\n${err.stack}`);
    }
}

async function addDose(address, vaccineManufacturer, requiredDose) {
    try {
        let postRes = await this.client.apis.default.addDose_post({
            address,
            body: {
                vaccineManufacturer,
                requiredDose,
            },
            "kld-from": FROM_ADDRESS,
            "kld-sync": "true"
        });
        console.log("Added dose: " + address);

        return postRes.body;
    }
    catch (err) {
        console.log(`Failed to add dose for ${address}: ${err.response && JSON.stringify(err.response.body) && err.response.text}\n${err.stack}`);
        return null;
    }
}


async function getPatientVaccinationStatus(address) {
    try {
        let postRes = await this.client.apis.default.fullyVaccinated_get({
            address,
            "kld-from": FROM_ADDRESS,
            "kld-sync": "true"
        });
        console.log("Getting patient vaccination status: " + address);

        return postRes.body.output;
    }
    catch (err) {
        console.log(`Failed to vaccination status for ${address}: ${err.response && JSON.stringify(err.response.body) && err.response.text}\n${err.stack}`);
        return null;
    }
}

module.exports = {
    contractInit,
    postPassport,
    addDose,
    getPatientVaccinationStatus,
}