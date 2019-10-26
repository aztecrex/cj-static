import cdk = require('@aws-cdk/core');
import s3 = require('@aws-cdk/aws-s3');
import {StaticSite} from './static-site';
export class CjStaticStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const site = new StaticSite(this, 'Commitments')

  }
}


