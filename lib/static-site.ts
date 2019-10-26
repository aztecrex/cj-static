import { Construct } from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import { CfnCloudFrontOriginAccessIdentity } from '@aws-cdk/aws-cloudfront';

export interface IStaticSite {


}

export interface StaticSiteProps {

}

export class StaticSite extends Construct implements IStaticSite {

    constructor(scope: Construct, id: string, props?: StaticSiteProps) {
        super(scope, id);

        const bucket = new Bucket(this, 'Content');
        const access = new CfnCloudFrontOriginAccessIdentity(this, 'WebId', {
            cloudFrontOriginAccessIdentityConfig: {
                comment: "Web Identity for Static Site"
            }
        });

      }
}
