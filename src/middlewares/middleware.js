exports.middlewareGlobal = (req, res, next) => {
    /*
        Essas variáveis em "locals" servem para serem acessadas
        nos arquivos EJS como, por exemplo, messages.ejs.

        É dessa forma que podemos acessar e exibir por meio de 
        flash messages na tela

        Essas flash messages como ali abaixo em "req.flash" vem do loginController,
        uma vez que "flash messages" necessita de instalação via npm.
    */
    res.locals.errors = req.flash('errors');
    res.locals.success = req.flash('success');
    res.locals.user = req.session.user;
    next();
};

exports.checkCSRFError = (err, req, res, next) => {
    if(err){ 
        //'BADCSRFTOKEN ==== err.code
        //É para não mostrar o erro no navegador, pois isto é inseguro.
        return res.render('404'); //chama o arquivo 404.ejs
    }

    next();
};

exports.csrfMiddleware = (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
};

exports.loginRequired = (req, res, next) => {
    if(!req.session.user){
        req.flash('errors', 'Você precisa fazer login');
        req.session.save(() => res.redirect('/')); //sempre que for redirecionar a pag, é sempre bom salvar a sessão para garanti-la que seja salva.
        return;
    }
    next();
};