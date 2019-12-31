'use strict';
const es = require('./es');
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

module.exports.search = async (event) => {
  const userId = parseUserId(event.headers);
  const client = await es.getClient();
  const index = es.formatIndexName(userId);
  const type = es.INDEX_TYPE;
  const body = event.body;
  const result = await client.msearch({ index, type, body });
  return {
    statusCode: 200,
    body: JSON.stringify(result.body,
      null,
      2
    ),
    headers: responseHeaders
  };
};
