const SSM = require('aws-sdk/clients/ssm');
const ssm = new SSM();
const { Client } = require('@elastic/elasticsearch');

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

module.exports.getClient = async () => {
  return await client;
};
