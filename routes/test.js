module.exports = app=>{
  
  // test api
  app.get('/api/gettest', function (req, res) {
    res.send("helllp  adas")
  })
  
  app.post('/api/posttest', function (req, res) {
    console.log(req.body)
    res.send(req.body)
  })
}