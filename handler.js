'use strict';
const imageDao = require('./dao/imageDao');

const responseHeaders = {
  'Content-Type': 'application/json',
  'X-Custom-Header': 'application/json',
  'Access-Control-Allow-Origin': '*'
};

function parseUserId(headers) {
  const authHeader = headers.Authorization;
  const encodedClaims = authHeader.split('.')[1];
  const decodedClaims = new Buffer(encodedClaims, 'base64').toString('ascii');
  return JSON.parse(decodedClaims).sub;
}

module.exports.findImage = async (event) => {
  const id = event.pathParameters.id;
  const userId = parseUserId(event.headers);
  const image = await imageDao.findImage(id, userId);
  return {
    statusCode: 200,
    body: JSON.stringify(image,
      null,
      2
    ),
    headers: responseHeaders
  };
};
