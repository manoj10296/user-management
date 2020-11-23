const mongoose = require('mongoose');

module.exports = () => {

  return mongoose.connect("mongodb+srv://<User>:<password>@cluster0.36hup.mongodb.net/<dbname>?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
}