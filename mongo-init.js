
db = db.getSiblingDB('database');
db.createUser(
    {
        user: "root",
        pwd: "root",
        roles: [
            {
                role: "readWrite",
                db: "db"
            }
        ]
    }
);

