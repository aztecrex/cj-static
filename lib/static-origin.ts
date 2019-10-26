import { Construct } from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import { CfnCloudFrontOriginAccessIdentity } from '@aws-cdk/aws-cloudfront';

export interface IStaticOrigin {


}

export interface StaticOriginProps {

}

export class StaticOrigin extends Construct implements IStaticOrigin {

    constructor(scope: Construct, id: string, props?: StaticOriginProps) {
        super(scope, id);

        const bucket = new Bucket(this, 'Content');
        const access = new CfnCloudFrontOriginAccessIdentity(this, 'WebId', {
            cloudFrontOriginAccessIdentityConfig: {
                comment: "Web Identity for Static Site"
            }
        });

      }
}
