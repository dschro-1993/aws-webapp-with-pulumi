import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';

import {originAccessIdentity} from './oai';
import {pzipped} from './providers';

const publicReadPolicy = (bucketName: string, iamArn: string): string => {
  return JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Sid:      'PublicRead',
        Effect:   'Allow',
        Action:   ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${bucketName}/*`],
        Principal: {
          AWS: iamArn,
        },
      },
    ],
  });
};

const mimeTypesss = require('mime-types');

const createAssets = (region: string, bucket: aws.s3.Bucket, assets: Asset[], options: pulumi.CustomResourceOptions): void => {
  for (const asset of assets) {
    const contentType = mimeTypesss.lookup(asset.path);
    new aws.s3.BucketObject(
      `${region}-${asset.name}`,
      {
        source: new pulumi.asset.FileAsset(asset.path),
        key:    asset.name,
        contentType,
        bucket,
      },
      options,
    );
  }
};

const attachPolicy = (region: string, bucket: aws.s3.Bucket, iamArn: pulumi.Output<string>, options: pulumi.CustomResourceOptions): void => {
  new aws.s3.BucketPolicy(
    `${region}-bucket-policy`,
    {
      policy: pulumi.all([bucket.bucket, iamArn]).apply(([bucketName, iamArn]) => publicReadPolicy(bucketName, iamArn)),
      bucket: bucket.bucket,
    },
    options,
  );
};

const createBucket = (region: string, provider: aws.Provider): aws.s3.Bucket => {
  return new aws.s3.Bucket(
    `${region}-bucket`,
    {
      // Todo: Maybe add UUIDs? 64 chars limited ...
      bucket:  `${region}-1212121212-bucket`,
      website: {indexDocument: 'index.html'},
    },
    {provider},
  );
};

const putTogether = (region: string, provider: aws.Provider, iamArn: pulumi.Output<string>, assets: Asset[]): aws.s3.Bucket => {
  const bucket = createBucket(region, provider);
  const childOptions: pulumi.CustomResourceOptions = {provider, parent: bucket};
  attachPolicy(region, bucket, iamArn, childOptions);
  createAssets(region, bucket, assets, childOptions);
  return bucket;
};

import {sync} from 'fast-glob';
const build = sync('../build/**/*');
// for name: '../build/index.html' ---> 'index.html'
type  Asset = {name: string, path: string};
const assets: Asset[] = build.map((asset) => ({name: asset.slice(9), path: asset}));

const buckets = pzipped.map((obj) => {
  return putTogether(obj.region, obj.provider, originAccessIdentity.iamArn, assets);
});

export {buckets};
