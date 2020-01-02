const SSM = require('aws-sdk/clients/ssm');
const ssm = new SSM();
const { Client } = require('@elastic/elasticsearch');

const INDEX_NAME = 'documents';

async function initClient() {
  const esUrl = ssm.getParameter({ Name: 'ocrEsUrl' }).promise();
  const esUsername = ssm.getParameter({ Name: 'ocrEsUsername' }).promise();
  const esPassword = ssm.getParameter({ Name: 'ocrEsPassword' }).promise();
  const auth = { username: (await esUsername).Parameter.Value, password: (await esPassword).Parameter.Value };
  return new Client({ node: (await esUrl).Parameter.Value, auth: auth });
}

let client;
if (!client) {
  client = initClient();
}

module.exports.formatIndexName = function(userId) {
  const suffix = userId ? userId : '*';
  return `${INDEX_NAME}-${suffix}`;
};

module.exports.client = client;
module.exports.INDEX_TYPE = 'document';
