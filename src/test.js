const AWS = require('aws-sdk');
const access_key = require('./APIKEYS.js').S3_ACCESS_KEY;
const secret_key = require('./APIKEYS.js').S3_SECRET_KEY;
AWS.config.update({region: 'us-east-1'});

var s3 = new AWS.S3({accessKeyId: access_key, secretAccessKey: secret_key, apiVersion: '2006-03-01'});
var kms = new AWS.KMS({accessKeyId: access_key, secretAccessKey: secret_key, apiVersion: '2014-11-01'});
var key = '/test/data';
var ARN = `arn:aws:s3:::digitalpath/${key}`;

s3.getObject({Bucket: 'digitalpath', Key: key}, (err, data) => {
    if (err) {
        console.log(err);
    } else {
        console.log(data.Body.toString());
    }
});

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getobjectcommand.html
// How to get data from an S3 bucket
// Probably make singelton instance of someting like dis in the backend
// client.send(new GetObjectCommand(new GetObjectCommand))

