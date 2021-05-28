const config = require('./config.json')
var Connection = require('tedious').Connection;
var TYPES = require('tedious').TYPES;
var Request = require('tedious').Request;

var customerName = "null";

var connection;

const getConn = async() => {
    console.log('in getConn');
    connection = new Connection(config);
    // Attempt to connect and execute queries if connection goes through
    connection.on("connect", err => {
        if (err) {
            console.log("2");
            console.error(err.message);
        } else {
            console.log("3");
            executeMyStatement2();
            console.log("4");
            //res.status(200).send("ok");
            //console.log("after ok");
        }
    });
    connection.connect();
};


const executeMyStatement = async() => {
    console.log('----------------------------------------------------------------');
    console.log('in executeMyStatement');
    await getConn();
};

const executeMyStatement2 = () => {
     // Read all rows from table
     const request = new Request(
        `select top 3 c.FirstName from SalesLT.Customer c`,
        (err, rowCount) => {
            if (err) {
                console.error(err.message);
            } else {
                customerName = "danii";
                console.log(`${rowCount} row(s) returned`);
            }
        }
    );
    request.on("row", columns => {
        columns.forEach(column => {
            console.log("%s\t%s", column.metadata.colName, column.value);
        });
    });
    request.on('requestCompleted', function () {
        console.log('on requestCompleted...' + customerName);
        connection.close();
    });
    connection.execSql(request);
};

exports.myDemoFunction = async (req, res) => {
    await executeMyStatement();
    console.log("before ok");
    res.status(200).send("ok");
    console.log("after ok");
};
