import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';

const regions:   aws.Region[]   = ['us-east-1', 'eu-west-1'];
const providers: aws.Provider[] = regions.map((region) => new aws.Provider(`${region}-provider`, {region}));

/*
 * [
 *   {us-east-1, us-east-1-provider},
 *   {eu-west-1, eu-west-1-provider},
 *   ...
 * ]
*/

const zipped = regions.map((region, i) => ({region, provider: providers[i]}));

export {zipped};
