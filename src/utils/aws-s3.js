import S3 from 'aws-s3';
import Config from '../config';

export const getS3Client = path => {
  const config = {
    bucketName: Config.AWS_S3.Bucket,
    dirName: path,
    region: Config.AWS_S3.region,
    accessKeyId: Config.AWS_S3.accessKeyId,
    secretAccessKey: Config.AWS_S3.secretAccessKey,
  };

  return new S3(config);
};

export const uploadReportDriverPhoto = file => {
  const filePath = 'reportDriver';
  const S3Client = getS3Client(filePath);

  return S3Client.uploadFile(file);
};
