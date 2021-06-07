const config = {
    "server": process.env.DB_HOST || 'localhost',
    "authentication": {
        "type": "default",
        "options": {
            "userName": process.env.DB_USERNAME,
            "password": process.env.DB_PASSWORD
        }
    },
    "options": {
        "database": process.env.DB_NAME,
        "encrypt": false,
        "instancename": process.env.DB_INSTANCE,
        "port": parseInt(process.env.DB_PORT) || 1433,
        "trustServerCertificate": false
    }
};

module.exports = config;