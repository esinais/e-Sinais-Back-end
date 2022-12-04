const Sinal = require('../models/Sinal');
const Usuario = require('../models/Usuario');
const Sinonimo = require('../models/Sinonimo');
const Sinonimos = require('sinonimo');
const { Op } = require("sequelize");
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const Gifier = require('./createGif');
const pathToFfmpeg = require('ffmpeg-static');
const ffprobe = require('ffprobe-static');


const fs = require('fs'); // manipular arquivos
const caminhoImg = './public/upload/';



//função responsável por eliminar pontuações e espaços do texto
function breakWords(frases) {
    //usando expressões regulares para tirar espaços e pontuações
    const expre1 = /[\s,.?()!''""-\_\*;:<>\/{}\[\]°º#@$%¨&+=]+/g;
    const palavras_primeira_etapa = frases.split(expre1);
    return (palavras_primeira_etapa);
}
//função responsável por relizar uma busca de palavra sinônimo no momento em que for cadastrada
async function searchSinonimos(palavra) {
    //faz uma busca pelo sinônimo do nome do sinal a biblioteca retorna um array de sinônimos
    const sinonimos = await Sinonimos(palavra);
    var idSinalBD = [];
    //faz uma varredura dos sinônimos para verificar se existe alguma palavra no banco de dados
    for (let i = 0; i < sinonimos.length; i++) {
        //consulta no banco de dados com uma clausula Where
        const sinais = await Sinal.findAll({
            where: {
                nomeSinal: sinonimos[i]
            }

        }, {
            attributes: ['id'],
            raw: true
        });
        //faz uma busca no objeto encontrado pegar o ID e associa a variável IdSinalBD vinda do banco de dados
        sinais.forEach((elemento) => {
            idSinalBD.push(elemento.id);
        });

    }
    //caso o tamanho do array seja igual 0 retorna falso, ou seja não tem sinônimo no banco de dados
    if (idSinalBD.length == 0) {
        return false;
    }
    return idSinalBD;
}
async function deletarImgAntiga(imgAntiga, tipoImg) {

    imgOld = caminhoImg + tipoImg + "/" + imgAntiga;

    fs.access(imgOld, (err) => {
        if (!err) {
            //este comando deleta o arquivo da pasta
            fs.unlink(imgOld, () => { });
            return true


        } else {
            console.log(err)
        }
    });
    return false;

}
//Retorna um array de objetos contendo o nome do SINAL e da IMAGEM ASSOCIATIVA
async function buscarSinonimos(idSinal) {

    var sinonimo2 = {};
    const sinonimos = await Sinonimo.findAll({
        where: {
            id_sinal: idSinal
        }
    });


    if (sinonimos.length != 0) {
        var palavras_sinonimos = [];
        var palavras = [];
        sinonimos.forEach((elemento) => {
            palavras_sinonimos.push(elemento.id_sinal_sinonimos);
        });

        for (let i = 0; i < palavras_sinonimos.length; i++) {
            var s = await Sinal.findAll({
                where: {
                    id: palavras_sinonimos[i]
                },
            });

            if (s.length != 0) {
                //console.log("entrei" + s[0].id);
                sinonimo2 = { "nomeSinal": s[0].nomeSinal, "enderecoSinalSinonimo": s[0].enderecoSinal, "imgSinonimo": s[0].enderecoImgAssociativa, "gramatical": s[0].classificacaoGramatical, "regiao": s[0].regiao }
                palavras.push(sinonimo2);
            }

        }

    }
    return palavras;
}
async function buscarPolissemia(idSinal, nomeSinal) {
    var polissemia2 = {};
    var palavras = [];

    const polissemia = await Sinal.findAll({
        where: {
            nomeSinal: nomeSinal,
            id: {
                //diferente
                [Op.ne]: idSinal
            }
        }
    });

    if (polissemia.length != 0) {
        for (let i = 0; i < polissemia.length; i++) {
            polissemia2 = { "nomeSinal": polissemia[i].nomeSinal, "enderecoSinalPolissemico": polissemia[i].enderecoSinal, "imgPolissemia": polissemia[i].enderecoImgAssociativa, "regiao": polissemia[i].regiao, "gramatical": polissemia[i].classificacaoGramatical }
            palavras.push(polissemia2);
        }
    }

    return palavras;
}

//função responsável por cortar o vídeo
async function cut_video(nomeVideo, startTime, duration) {
    var sourcePath = path.resolve("public/upload/videosBrutos/" + nomeVideo);
    var outputPath = path.resolve("public/upload/videosBrutos/videosCortados/" + nomeVideo);
    
    console.log('start cut video');

    await new Promise((resolve, reject) => {
        ffmpeg(sourcePath)
            .setFfmpegPath(pathToFfmpeg)
            .setFfprobePath(ffprobe.path)
            .output(outputPath)
            .setStartTime(startTime)
            .setDuration(duration)
            .withVideoCodec('copy')
            .withAudioCodec('copy')
            .on('end', function (err) {

                if (!err) {
                    console.log("olha aqui: " + sourcePath)
                    //fs.unlink(sourcePath)
                    fs.rm(sourcePath, { recursive: true }, (err) => {
                        if (err) {
                            // File deletion failed
                            console.error(err.message);
                            return;
                        }
                        console.log("File deleted successfully");
                    });
                    console.log("aqui ophhhhhhhh")
                    console.log('conversion Done');
                    resolve();
                } else {
                    console.log("merda")
                }
            })
            .on('error', function (err) {
                console.log('error: ', err);
                reject(err);
            })
            .run();
    });


}
async function tirarExtensao(enderecoSinal) {

    var ext = enderecoSinal.split('.');
    //console.log(ext[0])
    return ext[0];

}

module.exports = {

    //Método para buscar tudo do banco de dados
    async index(req, res) {
        /*
        este método faz a busca através da selecão vinda do front-end por tipos diferentes
        parâmetros:
        1 - Retorna todos os sinais
        2 - Retorna todos os sinais cadastrado pelo usuário
        3 - Retorna a tradução do texto completo enviado do front-end      
        */
        try {
            //Identifica do corpo do front-end o tipo de serviço para retorno ao front-end
            const { id_tipo, paginacao = 1 } = req.params;

            //implementando a paginação
            //estabelecendo o limite de registro
            const limite = 10;
            var ultimaPagina = 1;

            //consultando a quantidade de registros no banco de dados
            const qtdRegistros = await Sinal.count();
            //Caso não tiver nenhum registro retornar null
            if (qtdRegistros === null) {
                return res.status(400).json({ error: err })
            } else {
                ultimaPagina = Math.ceil(qtdRegistros / limite);
            }



            if (id_tipo == 1) {
                //A função findAll no sequelize tras todas as informações para um array
                //const sinais = await Sinal.findAll();
                //A função findAll no sequelize tras todas as informações para um array
                const sinais = await Sinal.findAll({ offset: Number((paginacao * limite) - limite), limit: limite });

                //validação se não tiver nenhum dado
                if (sinais == "" || sinais == null) {
                    return res.status(200).send({ message: "Nenhum sinal encontrado" });
                }
                return res.status(200).send({
                    sinais,
                    qtdRegistros,
                    ultimaPagina
                });

            } else if (id_tipo == 2) {
                const { id_usuario } = req.params;
                console.log(id_usuario);
                const usuario = await Usuario.findByPk(id_usuario, {
                    include: { association: 'sinal' }
                });

                if (!usuario) {
                    return res.status(400).send({
                        status: 0,
                        message: 'sinal não encontrado!'
                    })
                }

                return res.status(200).send(usuario.sinal);
            } else if (id_tipo == 3) {
                const { texto } = req.body;
                //const { palavras } = req.params;
                console.log("entrei aqui agora")
                console.log(req.body)
                const palavras_separadas = breakWords(texto);
                sinais = "";
                sinais_encontrados = [];
                for (let i = 0; i < palavras_separadas.length; i++) {

                    sinais = await Sinal.findAll({
                        where: {
                            nomeSinal: palavras_separadas[i]
                        }
                    });

                    if (sinais != "") {
                        sinais_encontrados.push(sinais);
                    }

                }
                console.log(sinais_encontrados)
                return res.status(200).send({
                    status: 1,
                    message: 'Busca por nome!',
                    sinais_encontrados
                });
            } else {

                return res.status(400).send({
                    status: 0,
                    message: 'Tipo de serviço não identificado!'
                });
            }


        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    async index_tradutor(req, res) {
        try {
            //Identifica do corpo do front-end o tipo de serviço para retorno ao front-end

            const { texto } = req.body;
            //var textoConvertido = texto.toUpperCase();

            const palavras_separadas = breakWords(texto);

            sinais = "";
            sinais_encontrados = [];
            tem = {};
            sinonimosArray = [];
            polissemiaArray = [];
            for (let i = 0; i < palavras_separadas.length; i++) {

                sinais = await Sinal.findAll({
                    where: {
                        nomeSinal: palavras_separadas[i],
                        situacao: {
                            [Op.ne]: "PENDENTE"
                        }

                    }
                });
                if (sinais.length != 0) {
                    sinonimosArray = await buscarSinonimos(sinais[0].id);
                    polissemiaArray = await buscarPolissemia(sinais[0].id, sinais[0].nomeSinal);

                    tem = { "nomeSinal": sinais[0].nomeSinal, "sinal": sinais[0].enderecoSinal, "img": sinais[0].enderecoImgAssociativa, "gramatical": sinais[0].classificacaoGramatical, "regiao": sinais[0].regiao,  "sinonimo": sinonimosArray, "polissemia": polissemiaArray }

                    if (sinais != "") {

                        sinais_encontrados.push(tem);


                    }
                }


            }

            return res.status(200).send({
                status: 1,
                message: 'Busca por nome!',
                sinais_encontrados
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },

    //Método para buscar os sinais pelos parâmetros
    async indexSinalParametros(req, res) {
        /*
            este método faz a busca através da selecão vinda do front-end por tipos diferentes
            parâmetros:
            1 - busca por nome do sinal
            2 - busca pela classificação gramatical
            3 - busca pela região
            4 - busca pelo status do sinal (ATIVO OU INATIVO) 
            5 - busca pela situação (PENDENTE, APROVADO OU REPROVADO)
            6 - busca do sinônimo por palavra
            7 - busca da polissemia por palavra
            8 - busca pelo ID do SINAL
            9 - busca de usuários que mais cadastram no sistema Ranking de 03 primeiros colocados
            10 - busca por contribuição de cadastro individualmente por usuário
            11 -  busca para o dashboard
            
        */

        //const { id_tipo, valor } = req.params;

        //Identifica do corpo do front-end o tipo de serviço para retorno ao front-end
        const { id_tipo, valor, paginacao = 1 } = req.params;

        //implementando a paginação
        //estabelecendo o limite de registro
        const limite = 2;
        var ultimaPagina = 1;


        if (id_tipo == 1) {
            
            //consultando a quantidade de registros no banco de dados
            const qtdRegistros = await Sinal.count({
                where: {
                    nomeSinal: valor
                }
            });
            
            //Caso não tiver nenhum registro retornar null
            if (qtdRegistros === null) {
                return res.status(400).json({ error: err })
            } else {
                ultimaPagina = Math.ceil(qtdRegistros / limite);
            }
            console.log("p");
            const sinais = await Sinal.findAll({
                where: {
                    nomeSinal: valor
                }
            });
            
            if (sinais == "") {
                
                return res.status(400).send({
                    status: 0,
                    message: 'sinal não encontrado!'
                });
            } else {
                
                return res.status(200).send({
                    status: 1,
                    message: 'Busca por nome!',
                    sinais,
                    ultimaPagina
                });
            }

        } else if (id_tipo == 2) {

            //consultando a quantidade de registros no banco de dados
            const qtdRegistros = await Sinal.count({
                where: {
                    classificacaoGramatical: valor
                }
            });
            //Caso não tiver nenhum registro retornar null
            if (qtdRegistros === null) {
                return res.status(400).json({ error: err })
            } else {
                ultimaPagina = Math.ceil(qtdRegistros / limite);
            }

            const sinais = await Sinal.findAll({
                where: {
                    classificacaoGramatical: valor
                }
            });
            if (sinais == "") {
                return res.status(400).send({
                    status: 0,
                    message: 'sinal não encontrado!'
                });
            } else {
                return res.status(200).send({
                    status: 1,
                    message: 'Busca pela classificação gramatical!',
                    sinais,
                    ultimaPagina
                });
            }

        } else if (id_tipo == 3) {

            //consultando a quantidade de registros no banco de dados
            const qtdRegistros = await Sinal.count({
                where: {
                    regiao: valor
                }
            });
            //Caso não tiver nenhum registro retornar null
            if (qtdRegistros === null) {
                return res.status(400).json({ error: err })
            } else {
                ultimaPagina = Math.ceil(qtdRegistros / limite);
            }

            const sinais = await Sinal.findAll({
                where: {
                    regiao: valor
                }
            });
            if (sinais == "") {
                return res.status(400).send({
                    status: 0,
                    message: 'sinal não encontrado!'
                });
            } else {
                return res.status(200).send({
                    status: 1,
                    message: 'Busca pela região!',
                    sinais,
                    ultimaPagina
                });
            }

        } else if (id_tipo == 4) {

            //consultando a quantidade de registros no banco de dados
            const qtdRegistros = await Sinal.count({
                where: {
                    statusSinal: valor
                }
            });
            //Caso não tiver nenhum registro retornar null
            if (qtdRegistros === null) {
                return res.status(400).json({ error: err })
            } else {
                ultimaPagina = Math.ceil(qtdRegistros / limite);
            }

            const sinais = await Sinal.findAll({
                where: {
                    statusSinal: valor
                }
            }, { offset: Number((paginacao * limite) - limite), limit: limite });

            /*const sinais = await Sinal.findAll({
                where: {
                    statusSinal: valor
                }
            });*/
            if (sinais == "") {
                return res.status(400).send({
                    status: 0,
                    message: 'Sinal não encontrado!'
                });
            } else {
                return res.status(200).send({
                    status: 1,
                    message: 'Busca pelo status do sinal!',
                    sinais,
                    ultimaPagina
                });
            }

        } else if (id_tipo == 5) {

            //consultando a quantidade de registros no banco de dados
            const qtdRegistros = await Sinal.count({
                where: {
                    situacao: valor
                }
            });
            //Caso não tiver nenhum registro retornar null

            if (qtdRegistros === null) {
                return res.status(400).json({ error: err })
            } else if (qtdRegistros === 0) {
                ultimaPagina = 1;
            }
            else {
                ultimaPagina = Math.ceil(qtdRegistros / limite);

            }


            const sinais = await Sinal.findAll({
                where: {
                    situacao: valor
                }
            }, { offset: Number((paginacao * limite) - limite), limit: limite });

            /*const sinais = await Sinal.findAll({
                where: {
                    situacao: valor
                }
            });*/
            if (sinais == "") {
                return res.status(400).send({
                    status: 0,
                    message: 'Não há sinais para aprovação!',
                    ultimaPagina
                });
            } else {
                return res.status(200).send({
                    status: 1,
                    message: 'Busca pela situação do sinal!',
                    sinais,
                    ultimaPagina
                });
            }

        } else if (id_tipo == 6) {
            var idSinalBD = [];
            const sinal = await Sinal.findAll({
                where: {
                    nomeSinal: valor
                }
            });
            sinal.forEach((elemento) => {
                idSinalBD.push(elemento.id);
            });

            const sinonimos = await Sinonimo.findAll({
                where: {
                    id_sinal: idSinalBD
                }
            });
            if (sinonimos.length != 0) {
                var palavras_sinonimos = [];
                var palavras = [];
                sinonimos.forEach((elemento) => {
                    palavras_sinonimos.push(elemento.id_sinal_sinonimos);
                });
                for (let i = 0; i < palavras_sinonimos.length; i++) {
                    var s = await Sinal.findAll({
                        where: {
                            id: palavras_sinonimos[i]
                        },
                    });

                    palavras.push(s);


                }
                return res.status(200).send({
                    status: 1,
                    message: 'Busca pelo sinônimo do sinal!',
                    palavras
                });

            } else {
                return res.status(400).send({
                    status: 0,
                    message: 'Esta palavra não possui sinônimo cadastrado!'
                });
            }



        } else if (id_tipo == 7) {
            const sinais = await Sinal.findAll({
                where: {
                    nomeSinal: valor,
                    polissemico: true
                }
            });
            if (sinais == "") {
                return res.status(400).send({
                    status: 0,
                    message: 'sinal não encontrado!'
                });
            } else {
                return res.status(200).send({
                    status: 1,
                    message: 'Busca pela polissemia do sinal!',
                    sinais
                });
            }

        } else if (id_tipo == 8) {
            //const usuario = await Usuario.findByPk(valor);
            const sinais = await Sinal.findAll({
                where: {
                    id: valor
                }
            });
            if (sinais == "") {
                return res.status(400).send({
                    status: 0,
                    message: 'Sinal não encontrado!'
                });
            } else {
                return res.status(200).send({
                    status: 1,
                    message: 'Busca pela ID!',
                    sinais
                });
            }

        } else if(id_tipo == 9){
            
            const usuarios = await Usuario.findAll({
                order: [
                    // Will escape title and validate DESC against a list of valid direction parameters
                    ['quantidadeSinais', 'DESC']]
            });
            
            if (usuarios == "") {
                return res.status(400).send({
                    status: 0,
                    message: 'Sinal não encontrado!'
                });
            } else {
                return res.status(200).send({
                    status: 1,
                    message: 'Busca pela ID!',
                    usuarios
                });
            }
        } else if (id_tipo == 10){
            const usuarios = await Usuario.findAll({
                where: {
                    id: valor,
                    
                },
                attributes:
                    ['quantidadeSinais']
                
            });
           
            if (usuarios == "") {
                return res.status(400).send({
                    status: 0,
                    message: 'Sinal não encontrado!'
                });
            } else {
                return res.status(200).send({
                    status: 1,
                    message: 'Busca pela ID!',
                    usuarios
                });
            }
        } else if(id_tipo == 11){
            const qtdSinais = await Sinal.count();
            const qtdSinaisPendentes = await Sinal.count({
                where: {
                  situacao: 'PENDENTE'
                }
            });
            const qtdVerbo = await Sinal.count({
                where: {
                  classificacaoGramatical: 'VERBO'
                }
            });
            const qtdSubstantivo = await Sinal.count({
                where: {
                  classificacaoGramatical: 'SUBSTANTIVO'
                }
            });
            const qtdAdjetivo = await Sinal.count({
                where: {
                  classificacaoGramatical: 'ADJETIVO'
                }
            });
            const qtdNumeral = await Sinal.count({
                where: {
                  classificacaoGramatical: 'NUMERAL'
                }
            });
            const contribuicoesUsuario = await Usuario.findAll({
                where: {
                    id: valor,
                    
                },
                attributes:
                    ['nome', 'quantidadeSinais']
                
            });
            dashboard = {"sinaisTotais":qtdSinais, "sinaisPendentes":qtdSinaisPendentes, "verbos":qtdVerbo , "substantivo":qtdSubstantivo, "adjetivo":qtdAdjetivo, "numeral":qtdNumeral, "nomeUsuario": contribuicoesUsuario[0].dataValues.nome , "contribuicoes": contribuicoesUsuario[0].dataValues.quantidadeSinais}
            if (contribuicoesUsuario == "") {
                return res.status(400).send({
                    status: 0,
                    message: 'Sinal não encontrado!'
                });
            } else {
                return res.status(200).send({
                    status: 1,
                    message: 'Busca pela ID!',
                    dashboard
                });
            }

           
        }    
            

    },

    //Método para salvar no banco de dados
    async store(req, res) {

        try {

            //recebe as informações do parâmetro da requisição
            const { id_usuario } = req.params;
            //recebe as informações do corpo da requisição
            const { nomeSinal, classificacaoGramatical, regiao, statusSinal, situacao, tempoInicial, tempoFinal } = req.body;
            //verifica se o usuário recebido pelo parâmetro está cadastrado no banco de dados
            const usuario = await Usuario.findByPk(id_usuario);
            //captura a imagem recebida pelo req.files que vem em formato de array
            var enderecoSinal = req.files.enderecoSinal[0].filename;
            //captura a imagem recebida pelo req.files que vem em formato de array
            const enderecoImgAssociativa = req.files.enderecoImgAssociativa[0].filename;




            //Caso o usuário que esteja cadastrando no banco de dados não exista o código retorna o erro
            if (!usuario) {
                return res.status(400).json({
                    status: 0,
                    message: 'Usuário não econtrado!'
                });
            }
            ///fazer a conversão do vídeo vindo front-end para .GIF
            //comparando se arquivo vindo é do tipo video/mp4
            if (req.files.enderecoSinal[0].mimetype === 'video/webm') {
                //console.log("entrei aquiaaaaaaaaaaaaa");
                let nomeSinal = await tirarExtensao(enderecoSinal);
                nomeSinal = nomeSinal + ".gif"
                let pastaOrigem = "public/upload/videosBrutos/videosCortados/" + enderecoSinal;
                let destino = "public/upload/sinais/";
                
                
                
                    await cut_video(enderecoSinal, tempoInicial, tempoFinal).then((resolve) => {
                        enderecoSinal = nomeSinal;
                        var newGif = new Gifier(pastaOrigem, destino, nomeSinal, {
                            frames: 10,    //Number of frames to get from the video. The frames will be evenly distributed.
                            size: '480x?', //Size of the new gif, '?' follows the video ratio.
                            delay: 35      //Delay between the frames in ms.
                        })
                        newGif.on('end', () => {
                            console.log("Convertido e salvo no diretório")
                        })
                    });
                

            }
            var sinal = null;
            var polissemico = false;
            const verificador = await Sinal.findAll({
                where: {
                    nomeSinal: nomeSinal
                },
            });

            if (verificador != 0) {
                polissemico = true;
                //Informa os parâmetros vindo do corpo para serem inseridos no INSERT do banco de dados
                sinal = await Sinal.create({ id_usuario, nomeSinal, enderecoSinal, enderecoImgAssociativa, classificacaoGramatical, regiao, statusSinal, situacao, polissemico });
                if (sinal != 0) {
                    for (let i = 0; i < verificador.length; i++) {
                        await Sinal.update({ polissemico }, {
                            where: {
                                id: verificador[i].id
                            }
                        });

                    }

                }


            } else {
                //Informa os parâmetros vindo do corpo para serem inseridos no INSERT do banco de dados
                sinal = await Sinal.create({ id_usuario, nomeSinal, enderecoSinal, enderecoImgAssociativa, classificacaoGramatical, regiao, statusSinal, situacao, polissemico });
            }


            var id_sinal = sinal.id;


            //retorna a ID do SINAL que é sinônimo cadastrado no banco de dados
            verificarSinonimo = await searchSinonimos(nomeSinal)

            //caso tenha algum sinônimo entra na condição
            if (verificarSinonimo) {
                //este for verifica a QUANTIDADE de de palavras sinônimos já cadastrada no banco de dados para associar com a nova palavra na tabela sinônimo
                for (let i = 0; i < verificarSinonimo.length; i++) {
                    //recebe o id do sinal sinônimo cadastrado
                    var id_sinal_sinonimos = verificarSinonimo[i];
                    //adiciona na tabela sinonimo
                    await Sinonimo.create({ id_sinal, id_sinal_sinonimos });
                    //Ao cadastrar na tabela sinônimo é necessário fazer a inversão das ID's
                    /*
                        Por exemplo:
                        ID_SINAL = 2 É SINÔNIMO DO ID_SINAL 1, TODAVIA O ID_SINAL 1 É SINÔNIMO DO ID_SINAL 2
                        2 ------1
                        1 ------2
                    
                    */
                    let temp1 = id_sinal;
                    id_sinal = id_sinal_sinonimos;
                    id_sinal_sinonimos = temp1;
                    //Cadastra o id invertido na tabela sinônimo
                    await Sinonimo.create({ id_sinal, id_sinal_sinonimos });
                    id_sinal = temp1;

                }

            }
            let quantidadeSinais = usuario.quantidadeSinais;
            quantidadeSinais = quantidadeSinais + 1;
            await Usuario.update({ quantidadeSinais },{
                where: {
                    id: id_usuario
                }    
            });
            //retorna o status 200 e informa o sucesso
            return res.status(200).send({
                status: 1,
                message: "Sinal cadastrado com sucesso!",
                sinal
            });



        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Método para atualizar no banco de dados
    async update(req, res) {
        /*
    este método faz a busca através da selecão vinda do front-end por tipos diferentes
    parâmetros:
    1 - Altera a situação do sinal (APROVADO, REPROVADO)
    2 (Qualquer número diferente de 1) - Altera todas as informações de uma só vez
*/


        try {
            //recebe o parâmetro passado pela URL, neste cado a ID do front-end
            const { id_tipo, id_sinal } = req.params;



            if (id_tipo == 1) {
                //recebe as informações do corpo da requisição
                const { situacao } = req.body;
                console.log(situacao, id_sinal);
                //informa os parâmetros vindo do corpo com as informações para atualização no banco de dados

                await Sinal.update({ situacao }, {
                    where: {
                        id: id_sinal
                    }
                });
                //retorna o status 200 e informa o sucesso
                return res.status(200).send({
                    status: 1,
                    message: "O sinal foi " + situacao + " com sucesso!",
                });
            } else {
                const sinaisTemp = await Sinal.findByPk(id_sinal);

                //recebe as informações do corpo da requisição
                const { nomeSinal, classificacaoGramatical, regiao, statusSinal, situacao, tempoInicial, tempoFinal } = req.body;
                var enderecoSinal = '';
                var enderecoImgAssociativa = '';

                if (!(req.files.enderecoSinal) && !(req.files.enderecoImgAssociativa)) {
                    enderecoImgAssociativa = sinaisTemp.enderecoImgAssociativa;
                    enderecoSinal = sinaisTemp.enderecoSinal;
                } else if ((req.files.enderecoSinal) && !(req.files.enderecoImgAssociativa)) {
                    //captura a imagem recebida pelo req.files que vem em formato de array
                    enderecoSinal = req.files.enderecoSinal[0].filename;
                    enderecoImgAssociativa = sinaisTemp.enderecoImgAssociativa;
                    deletarImgAntiga(sinaisTemp.dataValues.enderecoSinal, "sinais");

                    ///fazer a conversão do vídeo vindo front-end para .GIF
                    //comparando se arquivo vindo é do tipo video/mp4
                    if (req.files.enderecoSinal[0].mimetype === 'video/webm') {
                        let nomeSinal = await tirarExtensao(enderecoSinal);
                        nomeSinal = nomeSinal + ".gif"
                        let pastaOrigem = "public/upload/videosBrutos/videosCortados/" + enderecoSinal;
                        let destino = "public/upload/sinais/";
                        await cut_video(enderecoSinal, tempoInicial, tempoFinal).then((resolve) => {
                            enderecoSinal = nomeSinal;
                            var newGif = new Gifier(pastaOrigem, destino, nomeSinal, {
                                frames: 10,    //Number of frames to get from the video. The frames will be evenly distributed.
                                size: '480x?', //Size of the new gif, '?' follows the video ratio.
                                delay: 25      //Delay between the frames in ms.
                            })
                            newGif.on('end', () => {
                                console.log("fim do GIF")
                            })
                        });
                    }

                } else if (!(req.files.enderecoSinal) && (req.files.enderecoImgAssociativa)) {
                    //captura a imagem recebida pelo req.files que vem em formato de array
                    enderecoImgAssociativa = req.files.enderecoImgAssociativa[0].filename;
                    enderecoSinal = sinaisTemp.enderecoSinal;
                    deletarImgAntiga(sinaisTemp.dataValues.enderecoImgAssociativa, "imgAssociativa");

                } else {
                    //captura a imagem recebida pelo req.files que vem em formato de array
                    enderecoSinal = req.files.enderecoSinal[0].filename;
                    ///fazer a conversão do vídeo vindo front-end para .GIF
                    //comparando se arquivo vindo é do tipo video/mp4
                    if (req.files.enderecoSinal[0].mimetype === 'video/webm') {
                        let nomeSinal = await tirarExtensao(enderecoSinal);
                        nomeSinal = nomeSinal + ".gif"
                        let pastaOrigem = "public/upload/videosBrutos/videosCortados/" + enderecoSinal;
                        let destino = "public/upload/sinais/";
                        await cut_video(enderecoSinal, tempoInicial, tempoFinal).then((resolve) => {
                            enderecoSinal = nomeSinal;
                            var newGif = new Gifier(pastaOrigem, destino, nomeSinal, {
                                frames: 10,    //Number of frames to get from the video. The frames will be evenly distributed.
                                size: '480x?', //Size of the new gif, '?' follows the video ratio.
                                delay: 25      //Delay between the frames in ms.
                            })
                            newGif.on('end', () => {
                                console.log("fim do GIF")
                            })
                        });
                    }
                    //captura a imagem recebida pelo req.files que vem em formato de array
                    enderecoImgAssociativa = req.files.enderecoImgAssociativa[0].filename;

                    var imagemAntigaSinais = caminhoImg + "sinais/" + sinaisTemp.dataValues.enderecoSinal;
                    fs.access(imagemAntigaSinais, (err) => {
                        if (!err) {
                            //este comando deleta o arquivo da pasta
                            fs.unlink(imagemAntigaSinais, () => { });

                        } else {
                            console.log("Nao acessei o arquivo 1")
                        }
                    });
                    var imagemAntigaAssoci = caminhoImg + "imgAssociativa/" + sinaisTemp.dataValues.enderecoImgAssociativa;

                    fs.access(imagemAntigaAssoci, (err) => {
                        if (!err) {
                            //este comando deleta o arquivo da pasta
                            fs.unlink(imagemAntigaAssoci, () => { });

                        } else {
                            console.log(err)
                        }
                    });
                }

                //informa os parâmetros vindo do corpo com as informações para atualização no banco de dados
                await Sinal.update({ nomeSinal, enderecoSinal, enderecoImgAssociativa, classificacaoGramatical, regiao, statusSinal, situacao }, {
                    where: {
                        id: id_sinal
                    }
                });
                //retorna o status 200 e informa o sucesso
                return res.status(200).send({
                    status: 1,
                    message: "Informações atualizadas com sucesso!",
                });
            }

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Método para deletar no banco de dados
    async delete(req, res) {
        try {
            //recebe o parâmetro passado pela URL, neste cado a ID do usuário
            const { id_sinal } = req.params;
            //verifica na tabela sinônimo se possui o sinal relacionado com outro sinal
            const sinonimo = await Sinonimo.findByPk(id_sinal);
            //caso seja verdadeiro faz a exclusão da linha na tabela e sinônimo
            if (sinonimo) {
                await Sinonimo.destroy({
                    where: {
                        id_sinal: id_sinal
                    }
                });
            }
            //comando para deletar o sinal da tabela SINAL do banco de dados
            await Sinal.destroy({
                where: {
                    id: id_sinal
                }
            });
            //retorna o status 200 e informa o sucesso
            return res.status(200).send({
                status: 1,
                message: "Sinal deletado com sucesso!",
            });
        } catch (err) {
            return res.status(400).json({ error: err })
        }

    }
};