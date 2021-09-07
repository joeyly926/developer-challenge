const config = require('../config');
const MongoClient = require('mongodb').MongoClient;

const { MONGODB_URL } = config;
const dbName = "db";

/**
 * Connect to MongoDB
 */
async function connect() {
    console.log("Connecting to MongoDB");
    const mongoClient = new MongoClient(MONGODB_URL, { useNewUrlParser: true });
    const client = await mongoClient.connect();
    console.log("Connected!")
    const db = client.db(dbName);

    // Once connected, store the database in the module as a singleton
    module.exports.db = db;
}

async function list(coll, options = { }) {
    let {
        filter = { },
        pageSize = '10',
        page = '1',
        sort,
        order = 'asc',
    } = options;

    sort = sort ?? { };

    pageSize = parseInt(pageSize) || 10;
    page = parseInt(page) || 1;
    
    order = order === 'asc' ? 1 : -1;
    // make sure page is at least 1
    page = Math.max(page, 1);

    const pipeline = [
        { $match: filter },
        {
            $facet: {
                items: [
                    ...(Object.keys(sort)?.length ? [{ $sort: sort }]: []),
                    { $skip: (page - 1) * pageSize},
                    { $limit: pageSize },
                ],
                count: [{ $count: 'total' }],
            },
        },
    ];

    const result = await coll.aggregate(pipeline).next();
    const total = result?.count?.[0]?.total ?? 0;
    // adding 'id' for React data tables
    const items = result?.items ?? [];
    items.forEach((item, i) => { item['id'] = i });

    const pagination = {
        count: items.length,
        pageSize,
        ...(sort && { order, sort }),
        page,
        total,
    };

    return {
        items,
        pagination,
    };
}

module.exports = {
    connect,
    list,
}