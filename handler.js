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

function buildReturnBody(params) {
  const statusCode = params.statusCode || 200;
  const headers = params.headers || defaultHeaders();
  const body = params.jsonResponse === false ? params.body : JSON.stringify(params.body);
  return { statusCode, body, headers };
}

module.exports.findImage = async (event) => {
  const id = event.pathParameters.id;
  const userId = parseUserId(event.headers);
  const body = await imageDao.findImage(id, userId);
  return buildReturnBody({ body });
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
  const body = object.Body.toString('base64');
  const jsonResponse = false;
  const returnBody =  buildReturnBody({ body, headers, jsonResponse });
  returnBody.isBase64Encoded = true;
  return returnBody;
};

module.exports.updateImage = async (event) => {
  const id = event.pathParameters.id;
  const userId = parseUserId(event.headers);
  const inputBody = JSON.parse(event.body);
  const imageData = {
    text: inputBody.text,
    ocrText: inputBody.ocrText
  };
  const body = await imageDao.updateImage(id, userId, imageData);
  return buildReturnBody({ body });
};

module.exports.deleteImage = async (event) => {
  const id = event.pathParameters.id;
  const userId = parseUserId(event.headers);
  await imageDao.deleteImage(id, userId);
  const body = { success: true };
  return buildReturnBody({ body });
};

module.exports.search = async (event) => {
  const userId = parseUserId(event.headers);
  const client = await es.client;
  const index = es.formatIndexName(userId);
  const type = es.INDEX_TYPE;
  const inputBody = event.body;
  const body = (await client.msearch({ index, type, body: inputBody })).body;
  return buildReturnBody({ body });
};
