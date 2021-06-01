exports.functionGetSomething = (req, res) => {
    res.status(200).send('Getting something...');
};

exports.functionCreate = (req, res) => {
    res.status(201).send('Something created');
}