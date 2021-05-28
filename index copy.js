const config = require('./config.json')
var Connection = require('tedious').Connection;
var TYPES = require('tedious').TYPES;
var Request = require('tedious').Request;

//var connection;
var customerName = "null";

var connection;

exports.myDemoFunction = (req, res) => {
    
    console.log("1");
    connection = new Connection(config);

    if (!connection) {
        console.log("1.1");
        //connection = new Connection(config);
    }

    // Attempt to connect and execute queries if connection goes through
    connection.on("connect", err => {
        if (err) {
            console.log("2");
            console.error(err.message);
        } else {
            console.log("3");
            queryDatabase();
            console.log("4");
            res.status(200).send("ok");
            console.log("after ok");
        }
    });

    connection.connect();

    /*try {
        switch (req.path) {
            case '/customers':
                getCustomers(req, res);
                break;
            default:
                res.status(200).send('Hello World!');
        }
    } catch (err) {
        res.status(500).send(`Error: ${err.message}`);
    }*/

};

const queryDatabase = () => {
    console.log("Reading rows from the Table...");

    // Read all rows from table
    const request = new Request(
        `select top 3 c.FirstName from SalesLT.Customer c`,
        (err, rowCount) => {
            if (err) {
                console.error(err.message);
            } else {
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
        //connection.pause();
        //connection.resume();
        connection.close();
    });

    connection.execSql(request);
}

const getCustomers = async (req, res) => {

    if (req.method === 'GET') {
        let custId = req.query.custId || 1;
        await executeSQL(custId);
        res.status(200).send(customerName);
    }
    else if (req.method === 'POST') {
        res.status(201).send('Creating customer...');
    }
    else {
        res.status(404);
    }

}

const getConnection = async () => {

    console.log("1");

    // Evaluar si la conexion se encuentra en cache, sino crearla
    if (!connection) {
        console.log('Conexion no en cache');
        connection = new Connection(config);
    }

    // Inicializar la conexion
    connection.connect();

    console.log("2");

    // Configurar event handler cuando se establezca conexion
    connection.on('connect', function (err) {
        if (err) {
            console.log("3");
            console.log(err);
            throw err;
        } else {
            console.log('Connected to SQL Server!');
        }
    });

    // Configurar event handler cuando se cierra la conexion
    /*connection.on('end', function (err) {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log('Connection end');
        }
    });*/

    console.log("4");
};

const executeSQL = async (customerId) => {
    console.log("5");
    // Establecer conexion con BD
    await getConnection();

    console.log("6");

    // Construir statement y crear request a BD
    let statement = "select c.FirstName from SalesLT.Customer c where c.CustomerID = @customerId";
    const request = new Request(statement, (err, rowCount) => {
        if (err) {
            console.log(err);
            console.log("7");
            throw err;
        }
        console.log('Request done...' + rowCount);
        connection.close();
    });
    request.addParameter('customerId', TYPES.Int, customerId);
    console.log("8");

    // Emite un evento 'DoneInProc' cuando ha sido completado
    request.on('row', (columns) => {
        columns.forEach((column) => {
            if (column.value === null) {
                console.log('NULL');
            } else {
                customerName = column.value
                console.log('on row...' + customerName);
            }
        });
    });

    request.on('doneInProc', (rowCount, more) => {
        console.log('on doneInProc...' + customerName);
    });

    // In SQL Server 2000 you may need: connection.execSqlBatch(request);
    console.log("9");
    //connection.execSql(request);
    console.log("10");

}
