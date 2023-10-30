const urlParser = require('url');
const query = require('querystring');
const cardInfoJson = require('./cardInfo.json');

const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

const getCardList = async (request, response) => {
  const parsedUrl = urlParser.parse(request.url);
  const params = query.parse(parsedUrl.query);

  // allow get/head request
  if (request.method === 'GET' || request.method === 'HEAD') {
    const { fname, type } = params;
    if (!fname || !type) {
      const responseJSON1 = {
        id: 'badRequest',
        message: 'Missing fname or type query parameter',
      };
      return respondJSON(request, response, 400, responseJSON1);
    }
    try {
      const list = cardInfoJson.data
        .filter((card) => card.name.toLowerCase().includes(fname.toLowerCase())
          && card.type.toLowerCase().includes(type.toLowerCase())).map(i => {
            return {
              id: i.id,
              name: i.name,
              card_images: i.card_images
            }
          });
      if (list.length > 0) {
        return respondJSON(request, response, 200, {
          data: list,
        });
      }
    } catch (error) {
      const responseJSON2 = {
        message: 'Internal Server Error. Something went wrong',
        id: 'internalError',
      };
      return respondJSON(request, response, 500, responseJSON2);
    }
  }
  const responseJSON3 = {
    message: 'do not support other request method',
    id: 'internalError',
  };
  return respondJSON(request, response, 500, responseJSON3);
};

const getCardInfo = async (request, response) => {
  // allow post request
  if (request.method === 'POST') {
    // get post body
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
    });

    request.on('end', () => {
      try {
        const postData = JSON.parse(body);

        if (postData.id) {
          const cardInfo = cardInfoJson.data.find(card => card.id === postData.id);

          if (cardInfo) {
            return respondJSON(request, response, 200, cardInfo);
          } else {
            const responseJSON4 = {
              message: 'Card not found',
              id: 'notFound',
            };
            return respondJSON(request, response, 404, responseJSON4);
          }
        } else {
          cardInfoJson.data.push(postData);
          return respondJSON(request, response, 201, postData);
        }

      } catch (error) {
        const responseJSON5 = {
          message: 'Bad Request. Invalid JSON',
          id: 'badRequest',
        };
        return respondJSON(request, response, 400, responseJSON5);
      }
    });
  } else {
    const responseJSON6 = {
      message: 'do not support other request method',
      id: 'internalError',
    };
    return respondJSON(request, response, 500, responseJSON6);
  }
};

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  respondJSON(request, response, 404, responseJSON);
};

module.exports = {
  getCardList,
  getCardInfo,
  notFound,
};
