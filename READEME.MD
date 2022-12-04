CRIAR PROJETO COM YARN (criar package.json)
### yarn init

ADICIONAR DEPENDÊNCIAS
### yarn add

GERENCIAR ROTAS
### yarn add express

EXECUTAR O PROJETO
### node index.js

Instalar o módulo para reiniciar o servidor sempre que houver alteração no código fonte
### yarn add nodemon

Criar no packge.json
  "scripts": {
      "dev": "nodemon src/index.js"
  },

Agora pode utilizar apenas comando para executar o projeto (dev foi a variável que criamos no script)
### yarn dev

Instalar o sequelize e sequelize-cli, este último possibilita digitar comandos para criar a migrations
### yarn add sequelize sequelize-cli

Instalar o driver do mysql
### yarn add mysql2

Criar o arquivo .squelizerc que indica para a biblioteca que temos os arquivos de configuração de banco de dados de acesso colocando o seguinte comando:
const path = require('path');

module.exports = {
    config: path.resolve(__dirname, 'src', 'config', 'database.js'),
    'migrations-path': path.resolve(__dirname, 'src', 'database', 'migrations'),
};

Para criar o banco de dados usando sequelize-cli
### yarn sequelize db:create

Para criar as tabelas do banco de dados (usar o seguinte comando) (Criar tabelas no plural)
### yarn sequelize migration:create --name=create-usuarios
### yarn sequelize migration:create --name=create-sinais
### yarn sequelize migration:create --name=create-sinonimos

Comando para inserir novas colunas na tabela do banco de dados
### yarn sequelize migration:create --name=add-logado-column-usuarios-table

### yarn sequelize migration:create --name=add-polissemico-column-sinais-table

### yarn sequelize migration:create --name=add-quantidadeSinais-column-usuarios-table


Após a criação da migration colocar os campos com os seus respectivos atributos

Para criar as tabelas no banco usar o seguinte comando
### yarn sequelize db:migrate

comando para inserir na tabela usuarios
### INSERT INTO esinais.usuarios (cpf, nome, email, endereco, telefone, senha, perfil, status_Usuario, logado, quantidade_sinais, sexo, foto_perfil, created_at, updated_at) VALUES ('00000000000', 'Efanio','efaniojeferson@gmail.com', 'Avenida Leblon', '0000000000', '1234', 'administrador', 'ativo', false, 0, 'masculino','perfilSemFoto.jpg', '2022-09-22 08:40:00', '2022-09-22 08:40:00');
Inserção em formato JSON para teste no insomina
{
	"cpf": "12345678900",
	"nome": "Antonio Carlos",
	"email": "a@a.com",
	"endereco": "Avenida A",
	"telefone": "1122222222",
	"senha": "1234",
	"perfil": "Administrador",
	"status_usuario": "ATIVO"
}
comando para inserir na tabela sinais
### INSERT INTO sinais (id_usuario, nome_sinal, endereco_sinal, endereco_img_associativa, classificacao_gramatical, regiao, status_sinal, situacao, created_at, updated_at) VALUES (1,'Amor', 'localhost','localhost2', 'substantivo', 'Nacional', 'Aprovado', 'Ativo','2021-12-09 08:40:00', '2021-12-09 08:40:00');

Inserção em formato JSON para teste no insomina
{	
	"nomeSinal": "amor",
	"enderecoSinal": "localhost",
	"enderecoImgAssociativa": "localhost2",
	"classificacaoGramatical": "Substantivo",
	"regiao": "Nacional",
	"statusSinal": "Aprovado",
	"situacao": "Ativo"
}

Adicionar a biblioteca para criptografar senha
### yarn add bcryptjs

Adicionar a biblioteca para gerar token de usuário 
### yarn add jsonwebtoken

Adicionar a biblioteca Multer
Multer é um middleware node.js para manipulação multipart/form-data, usado para o upload de arquivos. 
### yarn add multer --save multer

Adicionar a biblioteca sinonimos
Responsável por buscar sinônimo da palavra enviada pelo parâmetro da função
### yarn add sinonimo


Instalar CORS para permitir requisições externas para o API de um site ou app mobile
### yarn add cors --save cors

Dependência para validar as informações do campos vinda do front-end
### yarn add yup --save

Instalar as seguinte bibliotecas para que funcione a edição de vídeo
corta vídeo:
### Instalar ffmpeg como variável ambiente no windows e baixar o pacote no site
### yarn add ffmpeg --save
### yarn add ffmpeg-static --save
### yarn add ffprobe-static --save


gif
### yarn add gm --save
### yarn add gifencoder --save
### yarn add canvas --save






Sequelize é uma biblioteca Javascript que facilita o gerenciamento de um banco de dados SQL
### npm install --save sequelize

Instalar sequelize CLI
### npm install --save-dev sequelize-cli

Instalar o drive do banco de dados
### npm install --save mysql2





