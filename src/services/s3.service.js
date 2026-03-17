import {
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import s3 from "../config/s3.js";
import env from "../config/env.js";

export const uploadToS3 = async (key, body, contentType = "image/jpeg") => {
  await s3.send(
    new PutObjectCommand({
      Bucket: env.s3BucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return `https://${env.s3BucketName}.s3.${env.awsRegion}.amazonaws.com/${key}`;
};

export const getFromS3 = async (key) => {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: env.s3BucketName,
      Key: key,
    })
  );

  return response;
};

export const getJsonFromS3 = async (key) => {
  const response = await getFromS3(key);
  const body = await response.Body.transformToString();
  return JSON.parse(body);
};

export const existsInS3 = async (key) => {
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: env.s3BucketName,
        Key: key,
      })
    );
    return true;
  } catch {
    return false;
  }
};

export const getS3Url = (key) => {
  return `https://${env.s3BucketName}.s3.${env.awsRegion}.amazonaws.com/${key}`;
};
