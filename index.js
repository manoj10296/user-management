const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors')
const mongoose = require('mongoose');

const authRoutes = require('./routes/Authentication')
const boardRoutes = require('./routes/Board')
const userRoutes = require('./routes/User')
const listRoutes = require('./routes/List')
const cardRoutes = require('./routes/Card')

const app = express();

const port = 8010
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json())
app.use(cors())

mongoose.connect("mongodb+srv://User:User123@cluster0.36hup.mongodb.net/trello?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('database connected')).catch((err) => console.log(err))

app.use('/api', authRoutes)
app.use('/board', boardRoutes)
app.use('/list', listRoutes)
app.use('/card', cardRoutes)
app.use('/user', userRoutes)

app.listen(port, () => {
  console.log(`App is running on port ${port}`)

  app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
  });

  app.use((error, req, res, next) => {
    res.status(error.status || 500).send({
      error: {
        status: error.status || 500,
        message: error.message || 'Internal Server Error',
      },
    });
  });
})