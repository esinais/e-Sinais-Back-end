const express = require("express");
const UsuarioControllers = require('./controllers/UsuariosControllers');
const SinalControllers = require('./controllers/SinalControllers');


const authMiddleware = require("./middlewares/auth");
const uploadSinais = require("./middlewares/uploadSinais");
const uploadUsuarios = require("./middlewares/uploadUsuarios");
const router = express.Router();
const cpUpload = uploadSinais.fields([{name: 'enderecoSinal', maxCount: 1},{name: 'enderecoImgAssociativa', maxCount: 1}]);
//const cpUpload = uploadSinais.single('enderecoSinal');
const cpUploadUsuarios = uploadUsuarios.fields([{name: 'fotoPerfil', maxCount: 1}]);


//rota para listar todos os usuários do banco de dados
router.get('/usuarios/:paginacao', authMiddleware, UsuarioControllers.index);
//rota para listar todos os usuário de acordo com o tipo parâmentro passado
router.get('/usuarios/:id_tipo/:valor', UsuarioControllers.indexUsuarioParametros);
//rota para salvar os usuários no banco de dados
router.post('/usuarios', cpUploadUsuarios, UsuarioControllers.store);
//rota para atualizar os usuários no banco de dados
router.put('/usuarios/:user_id', cpUploadUsuarios, UsuarioControllers.update);
//rota para deletar usuário do banco de dados
router.delete('/usuarios/:user_id', UsuarioControllers.delete);
//rota para logar no sistema
router.post('/usuarios/login', UsuarioControllers.login);

//rota para listar todos os sinais do banco de dados
router.post('/sinais/:id_tipo/:id_usuario/:paginacao', SinalControllers.index);
//rota que recebe o texto e retorna os sinais correspondentes
router.post('/sinais/', SinalControllers.index_tradutor);
//rota para listar todos o sinal de acordo com o tipo parâmentro passado
router.get('/sinais/:id_tipo/:valor/:paginacao', SinalControllers.indexSinalParametros);
//rota para salvar os sinais no banco de dados (.fields de acordo com a documentação do multer permite receber mais de um arquivo)
router.post('/sinais/:id_usuario', cpUpload, SinalControllers.store);
//rota para atualizar os sinais no banco de dados 
router.put('/sinais/:id_tipo/:id_sinal', cpUpload, SinalControllers.update);
//rota para deletar sinais do banco de dados
router.delete('/sinais/:id_sinal', SinalControllers.delete);


module.exports = router;