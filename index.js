const config = require('./config.json')
var Connection = require('tedious').Connection;
var TYPES = require('tedious').TYPES;
var Request = require('tedious').Request;

var customerName;
var connection;

const getCustomers = (req, res) => {

    console.log('----------------------------------------------------------------');
    let statement = "select c.FirstName from SalesLT.Customer c where c.CustomerID = @customerId";
    customerName = "";
    let customerId = req.query.customerId || 0;
    executeStatement(statement, customerId, res);
};

const executeStatement = (statement, customerId, res) => {
    connection = new Connection(config);

    // Attempt to connect and execute queries if connection goes through
    connection.on("connect", err => {
        if (err) {
            console.error(err.message);
        } else {
            execStmtRequest(statement, customerId, res);
        }
    });
    
    connection.connect();
};

const execStmtRequest = (stmt, customerId, res) => {

    const request = new Request(stmt, (err, rowCount) => {
        if (err) {
            console.error(err.message);
        } else {            
            console.log(`${rowCount} row(s) returned`);
            if(rowCount == 0) {
                res.status(200).send("No existe el customerId " + customerId);
            } else {
                res.status(200).send("Hello " + customerName);
            }
            connection.close();
        }
    });
    request.addParameter('customerId', TYPES.Int, customerId);

    request.on("row", columns => {
        columns.forEach(column => {
            if(column.value !== null) {
                console.log("%s\t%s", column.metadata.colName, column.value);
                customerName = column.value;
            }
        });
    });

    /*request.on('requestCompleted', function () {
        console.log('on requestCompleted...' + customerName);
        connection.close();
        res.status(200).send("Hello " + customerName);
    });*/

    connection.execSql(request);
};

exports.myDemoFunction = (req, res) => {
    try {
        switch (req.path) {
            case "/customers":
                getCustomers(req, res);
                break;
            default:
                res.status(200).send('Hello World!');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(`Error: ${err.message}`);
    }
};