const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const indexRouter = require('./routes/index');
const userRouter = require('./routes/users');
const userLogin = require('./routes/auth/login');
const requestRouter = require('./routes/req-expertizes');
const groupExpRouter = require('./routes/group-expertises');
const blankRouter = require('./routes/blanks');
const invitationRouter = require('./routes/invitations');
const administrationRouter = require('./routes/administration');
const agregationRouter = require('./routes/agregation');
const sanitizer = require('mongo-sanitize');
require('dotenv').config()
const app = express();
app.use(cors({
  origin: '*',
}));
mongoose.connect(`mongodb://localhost:27017/decisioner`).then(() => {
  console.log('database connected');
});

// view engine setup

app.disable('x-powered-by');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

/*app.use(function (req, res, next) {
  //set headers to allow cross origin request.
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT,PATCH, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});*/

app.use(logger('dev'));
app.use(bodyParser.json({limit: '200mb'}));
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  limit: '200mb',
  extended: true
}));
app.use(fileUpload({
  createParentPath: true,
  safeFileNames: true,
  preserveExtension: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req,res, next) {
  req.body = sanitizer(req.body);
  req.params = sanitizer(req.params);
  req.query = sanitizer(req.query);
  next();
})
app.use('/', indexRouter);
app.use('/api', userLogin);
app.use('/users', userRouter);
app.use('/req-expertises', requestRouter);
app.use('/group-expertises', groupExpRouter);
app.use('/blanks', blankRouter);
app.use('/invitations', invitationRouter);
app.use('/administration', administrationRouter);
app.use('/agregation', agregationRouter);
app.get('*',(req,res)=>{
  res.sendFile(path.join(__dirname,'public/index.html'));
})
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;

  // render the error page
  res.status(err.status || 500);
  if (err.status === 500) {
    res.locals.error = err;
  } else {
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  }
  console.log(res.locals.error);
  res.json({message: err.message});
});

module.exports = app;
