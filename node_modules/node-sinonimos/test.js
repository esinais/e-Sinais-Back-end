const _ = require('underscore');
const sinonimos = require('./');


const words = ['casa', 'fôrma', 'abcdef']
const expected = [
  ['residência', 'habitação', 'domicílio', 'vivenda', 'moradia', 'morada', 'lar', 'companhia', 'empresa', 'firma', 'agremiação', 'associação', 'classe', 'dinastia', 'estirpe', 'família', 'linhagem', 'geração', 'loja', 'edifício', 'supermercado', 'mercado', 'armazém', 'estabelecimento', 'convento', 'mosteiro', 'igreja', 'subdivisão', 'botoeira', 'espaço', 'divisão', 'fenda', 'abertura', 'assistência', 'público', 'teatro', 'cinema', 'plateia', 'década', 'decênio', 'decenário'],
  ['modelo', 'matriz', 'recipiente', 'molde', 'caixilho', 'carcaça'],
  []
];

const js = JSON.stringify;

function getOf(word, expected)
{
  console.log('Searching synonyms of "%s"', word);
  return sinonimos(word)
    .then(synonyms => {
      if (!_.isEqual(synonyms, expected))
        throw new Error(`Sinonims of "${word}" are not equal: got ${js(synonyms)}, expected ${js(expected)}`);

      console.log('Success!');
    });
}

Promise.resolve()
  .then(() => getOf(words[0], expected[0]))
  .then(() => getOf(words[1], expected[1]))
  .then(() => getOf(words[2], expected[2]))
  .catch(console.error);