const mongoose = require('mongoose');
const { async } = require('regenerator-runtime');
const validator = require('validator');

const ContatoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    sobrenome: { type: String, required: false, default: '' }, //"default" indica que se não enviar um sobrenome, será salvo como uma string vazia.
    email: { type: String, required: false, default: '' },
    telefone: { type: String, required: false, default: '' },
    criadoEm: { type: Date, default: Date.now }
});

const ContatoModel = mongoose.model('Contato', ContatoSchema);

function Contato(body){ //Constructor funciont (opcional, poderia ser class normal)
    this.body = body;
    this.errors = [];
    this.contato = null;
}

Contato.prototype.register = async function(){
    this.valida();

    if(this.errors.length > 0) return;

    this.contato = await ContatoModel.create(this.body);
};

Contato.prototype.valida = function(){
    this.cleanUp();

    if(this.body.email && !validator.isEmail(this.body.email)) this.errors.push('Email inválido');

    if(!this.body.nome) this.errors.push('Nome é um campo obrigatório.');
    
    if(!this.body.email && !this.body.telefone){
        this.errors.push('Pelo menos um contato precisa ser enviado: E-mail ou Telefone.')
    }
};

Contato.prototype.cleanUp = function(){
    //Irá garantir que tudo que tiver no body da requisição seja String.
    for(const key in this.body){
        if(typeof this.body[key] !== "string"){
            this.body[key] = '';
        }
    }

    //Garantir que apenas tenha os campos necessários para este model: Email e Senha.
    this.body = {
        nome: this.body.nome,
        sobrenome: this.body.sobrenome,
        email: this.body.email,
        telefone: this.body.telefone
    };
};

Contato.prototype.edit = async function(id) {
    if(typeof id !== "string") return;

    this.valida(); //validar novamente os dados do form
    
    if(this.errors.length > 0) return;

    this.contato = await ContatoModel.findByIdAndUpdate(id, this.body, {new: true}); //Passa o "id" do contato a ser editado, passa o "req.body" pois são os novos dados que vem do form, e passa "new: true" que indica que, quando atualizar o contato, será retornado os dados atualizados e não os antigos.
};


/* Métodos estáticos - não vão para "prototype" e não usa "this" */
Contato.buscaPorId = async  function(id){
    
    if(typeof id !== "string") return;

    const contato  = await ContatoModel.findById(id);
    return contato ;
};

Contato.buscaContatos = async function(){
    const contatos = await ContatoModel.find().sort({criadoEm: -1}); //irá trazer os contatos do banco ordenados pela chave "criadoEm". o valor -1 indica que a ordenação será decrescente. Se o valor fosse 1 seria crescente.
    return contatos;
};

Contato.delete = async function(id){
    if(typeof id !== "string") return;

    const contato = await ContatoModel.findOneAndDelete({_id: id});
    return contato;
}

module.exports = Contato;