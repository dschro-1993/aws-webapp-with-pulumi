import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';

export const originAccessIdentity = new aws.cloudfront.OriginAccessIdentity('oai', {
  comment: 'OAI to connect to react-app bucket',
});
