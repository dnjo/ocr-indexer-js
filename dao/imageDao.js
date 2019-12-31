const es = require('../es');

const INDEX_NAME = 'documents';
const INDEX_TYPE = 'document';

function formatIndexName(userId) {
  return `${INDEX_NAME}-${userId}`;
}

module.exports.findImage = async function (id, userId) {
  const client = await es.getClient();
  const index = formatIndexName(userId);
  const type = INDEX_TYPE;
  console.log(`Getting image from index ${index} with ID ${id}`);
  const documentResult = (await client.get({ id, index, type })).body;
  const document = documentResult['_source'];
  return {
    id: id,
    createdAt: document.createdAt,
    text: document.text,
    ocrText: document.ocrText,
    type: document.type,
    updatedAt: document.updatedAt
  };
};