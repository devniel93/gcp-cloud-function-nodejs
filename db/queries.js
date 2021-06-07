module.exports = {
    getAllCustomers: `select top 5 c.FirstName, c.LastName, c.CompanyName, c.Phone 
                        from SalesLT.Customer c`,
    getCustomerById: `select c.FirstName, c.LastName, c.CompanyName, c.Phone 
                        from SalesLT.Customer c 
                        where c.CustomerID = @customerId`,
    insertCustomer: `INSERT INTO SalesLT.Customer(FirstName, LastName, CompanyName, Phone, PasswordHash, PasswordSalt) 
                        OUTPUT INSERTED.CustomerID 
                        VALUES (@firstName, @lastName, @companyName, @phone, NEWID(), '')`
}