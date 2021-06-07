const config = require('./db/config');
const queries = require('./db/queries');

var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

var jsonArray = [];
var connection;

exports.myFunctionTesting = (req, res) => {
    res.status(200).send(process.env);
};

exports.myDemoFunction = (req, res) => {
    try {
        switch (req.path) {
            case "/":
                res.status(200).send({ msg: "Hello World!" });
                break;

            case "/customers":
                customerController(req, res);
                break;

            default:
                res.status(404).send({ msg: "Ruta no encontrada" });
        }
    } catch (err) {
        res.status(500).send({ msg: `${err.message}` });
    }
};

const customerController = (req, res) => {
    switch (req.method) {
        case "GET":
            getCustomer(req, res); break;

        case "POST":
            createCustomer(req, res); break;

        case "PUT":
            res.status(200).send({ msg: "Actualizando customer" }); break;

        case "DELETE":
            res.status(200).send({ msg: "Eliminando customer" }); break;

        default:
            res.status(200).send({ msg: "Alguna otra operacion" });
    }
};

const getCustomer = (req, res) => {
    jsonArray = [];
    let statement = queries.getCustomerById;

    if (!req.query.customerId) {
        statement = queries.getAllCustomers;
    }

    executeStatement(statement, req.query.customerId, null, res);
};

const createCustomer = (req, res) => {
    jsonArray = [];
    let statement = queries.insertCustomer;
    const dummyData = {
        customerId: 10,
        firstName: "Daniel",
        lastName: "Olano",
        companyName: "Pandero",
        phone: "966370312"
    };
    executeStatement(statement, null, dummyData, res);
};

const executeStatement = (statement, customerId, data, res) => {
    connection = new Connection(config);
    connection.on("connect", err => {
        if (err) {
            console.error(err);
            res.status(500).send({ msg: `${err.message}` });
        } else {
            execStmtRequest(statement, customerId, data, res);
        }
    });
    connection.connect();
};

const execStmtRequest = (stmt, customerId, data, res) => {

    const request = new Request(stmt, (err, rowCount) => {
        if (err) {
            console.error(err);
            res.status(500).send({ msg: `${err.message}` });
        } else {
            if (rowCount == 0) {
                res.status(200).send({ msg: "No se encontro customers" });
            } else {
                res.status(data ? 201 : 200).json(jsonArray);
            }
            connection.close();
        }
    });


    if (customerId) {
        request.addParameter('customerId', TYPES.Int, customerId);
    }

    if (data) {
        request.addParameter('firstName', TYPES.NVarChar, data.firstName);
        request.addParameter('lastName', TYPES.NVarChar, data.lastName);
        request.addParameter('companyName', TYPES.NVarChar, data.companyName);
        request.addParameter('phone', TYPES.NVarChar, data.phone);
    }

    request.on("row", columns => {
        var rowObject = {};
        columns.forEach(column => {
            //console.log("%s\t%s", column.metadata.colName, column.value);
            rowObject[column.metadata.colName] = column.value;
        });
        jsonArray.push(rowObject);
    });

    connection.execSql(request);
};

