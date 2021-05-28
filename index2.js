//const escapeHtml = require('escape-html');
const config = require('./config.json')
var Connection = require('tedious').Connection;  
var TYPES = require('tedious').TYPES;
var Request = require('tedious').Request;

const executeSQL = (customerId, req, res) => {  
  var connection = new Connection(config);  
  var customerName = "null";

  // Configurar event handler cuando se establezca conexion
  connection.on('connect', function(err) {
    if (err){
      console.log(err);
      throw err;
    } else {
        console.log('Connected to SQL Server!');
    }
  });

  // Configurar event handler cuando se cierra la conexion
  connection.on('end', function(err) {
    if (err){
      console.log(err);
      throw err;
    } else {
        console.log('Connection end');
    }
  });

  // Inicializar la conexion
  connection.connect();

  // Construir query para obtener...
  let statement = "select c.FirstName from SalesLT.Customer c where c.CustomerID = @customerId";  
  const request = new Request(statement, (err, rowCount) => {
    if (err) {
      console.log(err);
      throw err;
    }
    console.log('Request done...' + rowCount);
    connection.close();
  });

  request.addParameter('customerId', TYPES.Int, customerId);
  
  // Emits a 'DoneInProc' event when completed.
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

  /*request.on('done', (rowCount) => {
    console.log('Done is called!');
    console.log(customerName);
  });*/

  request.on('doneInProc', (rowCount, more) => {
    console.log('on doneInProc...' + customerName);    
  });

  request.on('requestCompleted', function () {
    console.log('on requestCompleted...' + customerName);    
  });

  // In SQL Server 2000 you may need: connection.execSqlBatch(request);
  connection.execSql(request);
};

/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
 exports.helloHttp = (req, res) => {
  const path = req.path;
  switch(path) {
    case '/customers':
      getCustomers(req, res);
      break;
    default:
      res.status(200).send('Hello World!');
  }
 };

 const getCustomers = (req, res) => {
   if(req.method === 'GET') {
    let custId = req.query.custId || 1;
    executeSQL(custId, req, res);
     //res.status(200).send('Listing customers...');
     res.status(200).send(customerName);     
   } else if(req.method === 'POST') {
     res.status(201).send('Creating customer...');
   } else {
     res.status(404);
   }
 }
