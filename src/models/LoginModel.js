const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');

const LoginSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true }
});

const LoginModel = mongoose.model('Login', LoginSchema);

class Login {
    constructor(body){
        this.body = body;
        this.errors = []; //irá controlar se o usuario pode ou não salvo na base de dados.
        this.user = null;
    
    }

    async register(){
        this.valida();

        if(this.errors.length > 0) //se há algum erro
            return;

        await this.userExists(); //checar se o usuario ja existe

        if(this.errors.length > 0) return; //tem que verificar novamente, pois pode ser que tenha algum erro do usuario ja existir.

        const salt = bcryptjs.genSaltSync(); //gera um salt
        this.body.password = bcryptjs.hashSync(this.body.password, salt); //gera um hash da propria senha junto com o salt
        
        this.user = await LoginModel.create(this.body); //salva na base de dados.
    }

    async login(){
        this.valida();

        if(this.errors.length > 0)
            return;

        this.user = await LoginModel.findOne({email: this.body.email});

        if(!this.user)
        {
            this.errors.push('Usuário não existe.');
            return;
        }

        if(!bcryptjs.compareSync(this.body.password, this.user.password)) //checar se a senha informada é a mesma senha com Hash no BD
        {
            this.errors.push('Senha inválida.');
            this.user = null;
            return;
        }
    }

    async userExists(){
        this.user = await LoginModel.findOne({ email: this.body.email });

        if(this.user)
            this.errors.push('Usuário já existe.');
    }

    valida(){
        this.cleanUp();

        //Email precisa ser válido        
        if(!validator.isEmail(this.body.email)) //pega pelo "name" no HTML
        this.errors.push('Email inválido'); //add uma flag de erro no array
        
        //Senha precisa ter entre 3 e 50 caracteres
        if(this.body.password.length < 3 || this.body.password.length > 50)
            this.errors.push('A senha precisa ter entre 3 e 50 caracteres');
    }

    cleanUp(){
        //Irá garantir que tudo que tiver no body da requisição seja String.
        for(const key in this.body){
            if(typeof this.body[key] !== "string"){
                this.body[key] = '';
            }
        }

        //Garantir que apenas tenha os campos necessários para este model: Email e Senha.
        this.body = {
            email: this.body.email,
            password: this.body.password
        };
    }    
}

module.exports = Login;