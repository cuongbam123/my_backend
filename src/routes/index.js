const routes = (app) => {
    app.get('/api/user' , (reg, res) => {
        res.send('User page')
    })
}

module.exports = routes