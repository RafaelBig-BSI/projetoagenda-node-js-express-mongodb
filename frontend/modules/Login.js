import validator from "validator";

class Login{
    constructor(formClass){ //validar o form de register e login
        this.form = document.querySelector(formClass);
    }

    init(){
        this.events();
    }

    events(){
        if(!this.form) //se o form não existe
            return;
        
        this.form = document.addEventListener('submit', e => {
            e.preventDefault();
            this.validate(e);
        });
    }

    validate(e){
         const el = e.target;
         const emailInput = el.querySelector('input[name="email"]');
         const passwordInput = el.querySelector('input[name="password"]');
         let error = false;

        if(!validator.isEmail(emailInput.value)){
            alert('Email inválido.');
            error = true;
        }

        if(passwordInput.value.length < 3 || passwordInput.value.length > 50){
            alert('Senha precisa ter entre 3 e 50 caracteres.');
            error = true;
        }

        if(!error)
            el.submit();
    }
}

export default Login;