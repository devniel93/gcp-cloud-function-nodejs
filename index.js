const config = require('./db/config.json')
const queries = require('./db/queries');

var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

var jsonArray = [];
var connection;

exports.myDemoFunction = (req, res) => {
    try {
        switch (req.path) {
            case "/":
                res.status(200).send('Hello World!');
                break;

            case "/customers":
                customerController(req, res);
                break;

            default:
                res.status(404).send("Ruta no encontrada");
        }
    } catch (err) {
        res.status(500).send(`Error: ${err.message}`);
    }
};

const customerController = (req, res) => {
    if (req.method === 'GET') {
        getCustomer(req, res);
    } 
    else if (req.method === 'POST') {
        res.status(201).send('Creating customer...');
    } 
    else if (req.method === 'PUT') {
        res.status(200).send('Updating customer...');
    } 
    else if (req.method === 'DELETE') {
        res.status(200).send('Removing customer...');
    }
};

const getCustomer = (req, res) => {
    jsonArray = [];    
    let statement = queries.getCustomerById;

    if (!req.query.customerId) {
        statement = queries.getAllCustomers;
    }
    
    executeStatement(statement, req.query.customerId, res);
};

const createCustomer = (req, res) => {
    let statement = `INSERT INTO SalesLT.Customer(FirstName, LastName, CompanyName, Phone, PasswordHash, PasswordSalt) 
                    OUTPUT INSERTED.CustomerID 
                    VALUES (@firstName, @lastName, @company, @phone, NEWID(), '')`;
    const data = {
        customerId: 10,
        firstName: "Daniel",
        lastName: "Olano",
        companyName: "Pandero",
        phone: "966370312"
    };
};

const executeStatement = (statement, customerId, res) => {
    connection = new Connection(config);
    connection.on("connect", err => {
        if (err) {
            console.error(err);
            res.status(500).send(`Error: ${err.message}`);
        } else {
            execStmtRequest(statement, customerId, res);
        }
    });
    connection.connect();
};

const execStmtRequest = (stmt, customerId, res) => {
    const request = new Request(stmt, (err, rowCount) => {
        if (err) {
            console.error(err);
            res.status(500).send(`Error: ${err.message}`);
        } else {
            //console.log(`${rowCount} row(s) returned`);
            if (rowCount == 0) {
                res.status(200).send("No se encontro customers");
            } else {
                res.status(200).json(jsonArray);
            }
            connection.close();
        }
    });

    if (customerId) {
        request.addParameter('customerId', TYPES.Int, customerId);
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

