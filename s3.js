require('dotenv').config()
const fs = require('fs')
const S3 = require('aws-sdk/clients/s3')
const util = require("util");
const bodyParser = require('body-parser');
const SDCClient = require("statsd-client");
const sdcclient = new SDCClient({host: 'localhost', port: 8080});
const bucketName = process.env.RDS_AWS_BUCKET
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY
console.log('bucket', bucketName)
const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
})

exports.uploadFileToS3 =  (req, res, userData) => {
    sdcclient.increment("Deleting Image");
     let startTime = new Date();
        console.log("File header", req)
      
      const uploadParams = {
      Bucket: bucketName,
      Body: req.body,
      Key: "BucketImage" + userData.id
      }
     return s3.upload(uploadParams).promise()
      
 
    }
    // var file = req.files.file
exports.deleteFileFromS3 = (req,res,result) => {
  sdcclient.increment("Deleting File from S3");
  let startTime = new Date();
  console.log("result", result)
  const params1 = {
      Bucket: bucketName,
      Key: "BucketImage" + result.id
  }
  let endTime = new Date();
                sdcclient.timing(
                  "Deleting File from S3 Time",
                  endTime - startTime
                  );
  return s3.deleteObject(params1).promise()

}  
    
    


