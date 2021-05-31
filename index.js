const config = require('./config.json')

var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

var customerName;
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
                res.status(404).send("Not Found!");
        }
    } catch (err) {
        res.status(500).send(`Error: ${err.message}`);
    }
};

const customerController = (req, res) => {
    if (req.method === 'GET') {
        getCustomer(req, res);
    } else if (req.method === 'POST') {
        res.status(201).send('Creating customer...');
    } else if (req.method === 'PUT') {
        res.status(200).send('Updating customer...');
    } else if (req.method === 'DELETE') {
        res.status(200).send('Removing customer...');
    }
};

const getCustomer = (req, res) => {
    customerName = "";
    let statement = "select c.FirstName from SalesLT.Customer c where c.CustomerID = @customerId";
    if (!req.query.customerId) {
        console.log("No se incluyo customerId");
        statement = "select top 10 c.FirstName from SalesLT.Customer c";
    }
    executeStatement(statement, req.query.customerId, res);
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
            console.log(`${rowCount} row(s) returned`);
            if (rowCount == 0) {
                res.status(200).send("No se encontro customers");
            } else {
                res.status(200).send("Hello " + customerName);
            }
            connection.close();
        }
    });

    if (customerId) {
        request.addParameter('customerId', TYPES.Int, customerId);
    }

    request.on("row", columns => {
        columns.forEach(column => {
            if (column.value !== null) {
                console.log("%s\t%s", column.metadata.colName, column.value);
                customerName = column.value;
            }
        });
    });

    connection.execSql(request);

};

