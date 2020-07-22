const crypto = require('crypto');
const path = require('path');
const ibm = require('ibm-cos-sdk');

const cos = new ibm.S3({
  endpoint: process.env.IBM_OBJECT_STORAGE_ENDPOINT,
  apiKeyId: process.env.IBM_OBJECT_STORAGE_API_KEY,
  serviceInstanceId: process.env.IBM_OBJECT_STORAGE_SERVICE_INSTANCE_ID,
});

console.log('Successfully connected to IBM cloud object storage');

exports.addItem = async file => {
  const key = crypto.randomBytes(20).toString('hex') + path.extname(file.originalname);

  await cos.putObject({
    Bucket: process.env.IBM_OBJECT_STORAGE_BUCKET, 
    Key: key, 
    Body: file.buffer
  }).promise();

  return `${process.env.DOMAIN}/media/${key}`;
};

exports.getItem = async key => Buffer.from((await cos.getObject({
  Bucket: process.env.IBM_OBJECT_STORAGE_BUCKET,
  Key: key
}).promise()).Body);

exports.deleteItem = async _path => await cos.deleteObject({
  Bucket: process.env.IBM_OBJECT_STORAGE_BUCKET,
  Key: path.basename(_path)
}).promise();
