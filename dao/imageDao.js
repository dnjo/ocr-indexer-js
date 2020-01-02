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

async function findImage(id, userId) {
  const client = await es.client;
  const index = es.formatIndexName(userId);
  const type = es.INDEX_TYPE;
  console.log(`Getting image from index ${index} with ID ${id}`);
  const documentResult = (await client.get({ id, index, type })).body;
  return buildImageDocument(id, documentResult['_source']);
}

async function updateImage (id, userId, imageData) {
  const client = await es.client;
  const index = es.formatIndexName(userId);
  const type = es.INDEX_TYPE;
  const now = new Date().toISOString();
  imageData.updatedAt = now;
  const body = { doc: imageData };
  await client.update({ id, index, type, body });
  const image = await findImage(id, userId);
  image.updatedAt = now;
  image.text = imageData.text;
  image.ocrText = imageData.ocrText;
  return image;
}

module.exports.findImage = findImage;
module.exports.updateImage = updateImage;

module.exports.findImageById = async function (id) {
  const client = await es.client;
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

module.exports.deleteImage = async function (id, userId) {
  return updateImage(id, userId, { present: false });
};
