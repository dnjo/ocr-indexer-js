const es = require('../es');

function buildImageDocument(id, document) {
  return {
    id: id,
    createdAt: document.createdAt,
    text: document.text,
    ocrText: document.ocrText,
    type: document.type,
    updatedAt: document.updatedAt,
    bucket: document.s3Bucket,
    key: document.s3Key
  };
}

module.exports.findImage = async function (id, userId) {
  const client = await es.getClient();
  const index = es.formatIndexName(userId);
  const type = es.INDEX_TYPE;
  console.log(`Getting image from index ${index} with ID ${id}`);
  const documentResult = (await client.get({ id, index, type })).body;
  return buildImageDocument(id, documentResult['_source']);
};

module.exports.findImageById = async function (id) {
  const client = await es.getClient();
  const index = es.formatIndexName();
  const type = es.INDEX_TYPE;
  const body = {
    query: {
      bool: {
        must: {
          term: {
            '_id': id
          }
        }
      }
    }
  };
  const documentResult = (await client.search({ index, type, body })).body;
  return buildImageDocument(id, documentResult.hits.hits[0]['_source']);
};
