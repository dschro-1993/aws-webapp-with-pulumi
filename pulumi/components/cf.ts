import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';

import {originAccessIdentity} from './oai';
import {buckets} from './s3';

const responseHeadersPolicy = new aws.cloudfront.ResponseHeadersPolicy('response-headers-policy', {
  securityHeadersConfig: {
    contentSecurityPolicy: {override: true, contentSecurityPolicy: `default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; connect-src 'self'`},
    // ...
  },
});

export const webDistribution = new aws.cloudfront.Distribution('distribution', {
  origins: buckets.map((bucket) => ({
    domainName: bucket.bucketRegionalDomainName,
    originId:   bucket.bucket, // 's3-origin'
    s3OriginConfig: {
      originAccessIdentity: originAccessIdentity.cloudfrontAccessIdentityPath,
    },
  })),
  originGroups: [
    {
      originId: 's3-origin-group',
      failoverCriteria: {
        statusCodes: [404, 500, 502, 503, 504],
      },
      members: buckets.map((bucket) => ({
        originId: bucket.bucket,
      })),
    },
  ],
  viewerCertificate: {
    cloudfrontDefaultCertificate: true,
  },
  restrictions: {
    geoRestriction: {
      restrictionType: 'none',
    },
  },
  defaultRootObject: 'index.html',
  defaultCacheBehavior: {
    compress: true,
    viewerProtocolPolicy: 'redirect-to-https',
    allowedMethods: ['GET', 'HEAD'],
    cachedMethods:  ['GET', 'HEAD'],
    targetOriginId: 's3-origin-group', // 's3-origin'
    // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html
    cachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6',
    responseHeadersPolicyId: responseHeadersPolicy.id,
  },
  waitForDeployment: true,
  enabled: true,
});
