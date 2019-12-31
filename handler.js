'use strict';
const es = require('./es');
const imageDao = require('./dao/imageDao');
const S3 = require('aws-sdk/clients/s3');
const s3 = new S3();

function defaultHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };
}

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
    headers: defaultHeaders()
  };
};

module.exports.findImageBlob = async (event) => {
  const id = event.pathParameters.id;
  const image = await imageDao.findImageById(id);
  const params = {
    Bucket: image.bucket,
    Key: image.key
  };
  const object = await s3.getObject(params).promise();
  const headers = defaultHeaders();
  headers['Content-Type'] = object.ContentType;
  headers['X-Custom-Header'] = object.ContentType;
  return {
    statusCode: 200,
    body: object.Body.toString('base64'),
    headers: headers,
    isBase64Encoded: true
  };
};

module.exports.updateImage = async (event) => {
  const id = event.pathParameters.id;
  const userId = parseUserId(event.headers);
  const body = JSON.parse(event.body);
  const imageData = {
    text: body.text,
    ocrText: body.ocrText
  };
  const image = await imageDao.updateImage(id, userId, imageData);
  return {
    statusCode: 200,
    body: JSON.stringify(image,
      null,
      2
    ),
    headers: defaultHeaders()
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
    headers: defaultHeaders()
  };
};
