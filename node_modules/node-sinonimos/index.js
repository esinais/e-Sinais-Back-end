const request = require('request-promise');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');


const address = 'https://www.sinonimos.com.br/';

function parseSearch(word, $)
{
  const elements = $('p strong a');
  
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].children[0].data === word)
      {
        const redirectionLocation = elements[i].attribs.href;
        const redirection = redirectionLocation.substr(1, redirectionLocation.length - 2);
        return redirection;
      }
  }
  
  return null;
}

function parseGet(word, $)
{
  if ($('#total strong:last-of-type').text() !== word)
    throw new Error('Word "' + word + '" was not found');

  const synonyms = [];
  const elements = $('.s-wrapper a');

  for (let i = 0; i < elements.length; i++)
    synonyms.push(elements[i].children[0].data);

  return synonyms;
}

function get(word, redirection)
{
  if (redirection === undefined) redirection = word;

  return request.get({
      url: address + redirection,
      encoding: null
    })
    .then(body => iconv.decode(body, 'iso-8859-1'))
    .then(cheerio.load)
    .then($ => parseGet(word, $));
}

function search(word)
{
  return request.get({
      url: address + 'search.php',
      qs: { q: word },
      resolveWithFullResponse: true,
      encoding: null
    })
    .then(response => iconv.decode(response.body, 'iso-8859-1'))
    .then(cheerio.load)
    .then($ => {
      const redirection = parseSearch(word, $);

      if (redirection === null)
        return parseGet(word, $);
      else
        return get(word, redirection);
    });
}


/**
 * Gets the synonyms of a word.
 * @param {string} word The word to search for the synonyms.
 * @return {Promise<Array<string>>} The synonyms of the word.
 */
module.exports = function (word) {
  return search(word).catch(() => []);
}