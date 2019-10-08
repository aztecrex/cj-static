import { Construct } from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';

export interface IStaticSite {


}

export interface StaticSiteProps {

}

export class StaticSite extends Construct implements IStaticSite {

    constructor(scope: Construct, id: string, props?: StaticSiteProps) {
        super(scope, id);

        const bucket = new Bucket(this, 'Content');

      }


}
