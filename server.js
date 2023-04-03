require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');

mongoose.connect(process.env.CONNECTIONSTRING,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
       // useFindAndModify: false
    })
    .then(() => {
        console.log('*** Conectado na base de dados ***');
        app.emit('pronto');
    })
    .catch(e => console.log("ERRO: ", e));

const session = require('express-session');
const MongoStore = require('connect-mongo'); // MongoStore = as seções serão salvas dentro da base de dados.
const flash = require('connect-flash'); //Mensagens que aparecem e depois somem. Por ex: msg de erro, feedbacks...
const routes = require('./routes');
const path = require('path');
const helmet = require('helmet');
const csrf = require('csurf');
const {middlewareGlobal, checkCSRFError, csrfMiddleware} = require('./src/middlewares/middleware');

app.use(helmet());
app.use(express.urlencoded({extended: true})); //Motivo do uso: conseguir pegar o req.body quando enviar um form.
app.use(express.json()); //Fazer o parse de JSON para dentro da aplicação. Deixa configurado.
app.use(express.static(path.resolve(__dirname, 'public')));

const sessionOptions = session({
    secret: 'aabxhvhvccisciedi',
    store: new MongoStore({ mongoUrl: process.env.CONNECTIONSTRING }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, //quanto tempo em ms o cookie irá durar = 7 dias
        httpOnly: true
    }
});

app.use(sessionOptions);
app.use(flash());

app.set('views', path.resolve(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

app.use(csrf());

//Nossos próprios middlewares
app.use(middlewareGlobal); //todas as requisições feitas iram passar por este Middleware.
app.use(checkCSRFError);
app.use(csrfMiddleware);
app.use(routes);

app.on('pronto', () => {
    app.listen(3000, () => {
        console.log('Servidor escutando na porta 3000')
        console.log('Acessar: http://localhost:3000');
    });
});