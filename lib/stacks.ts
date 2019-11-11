import cdk = require('@aws-cdk/core');

import {StaticOrigin} from './static-origin';
import { CfnOutput } from '@aws-cdk/core';
import { DnsValidatedCertificate, Certificate, ValidationMethod } from '@aws-cdk/aws-certificatemanager';
import { CfnDistribution, CloudFrontWebDistribution, CloudFrontAllowedMethods } from '@aws-cdk/aws-cloudfront';
import { IBucket } from '@aws-cdk/aws-s3';


function asName(s: string): string {
    return s.replace(/[^A-Za-z0-9-]/g, '-');
}

export class DataStack extends cdk.Stack {
    readonly origin: StaticOrigin;

    constructor(scope: cdk.Construct, props?: cdk.StackProps) {
        super(scope, "StaticData", props);

        this.origin = new StaticOrigin(this);

        new CfnOutput(this, "WriteContentPolicyArn", {
            value: this.origin.writeAccessPolicy.managedPolicyArn,
            exportName: 'WriteContentPolicyArn',
        });

      }
}

export class CertificateStack extends cdk.Stack {
    constructor(scope: cdk.Construct, domain: string, props?: cdk.StackProps) {
        super(scope, "Certificate-" + asName(domain), {...props, env: {region: 'us-east-1'}});
        const cert = new Certificate(this, "Certificate", {
            domainName: domain,
            validationMethod:  ValidationMethod.DNS,
        });

        new CfnOutput(this, "Certificate-" + asName(domain) + "-Arn", {
            value: cert.certificateArn,
        });
      }
}


export class DistributionStack extends cdk.Stack {
    constructor(scope: cdk.Construct, domain: string, origin: IBucket, props?: cdk.StackProps) {
        super(scope, "Distribution-" + asName(domain), props);


        const cdn = new CloudFrontWebDistribution(this, "CDN", {
            originConfigs: [{
                s3OriginSource: {
                    s3BucketSource: origin,
                },
                originPath: "/" + domain + "/*",
                behaviors: [{
                    isDefaultBehavior: true,
                }],
    /**
     * The relative path to the origin root to use for sources.
     *
     * @default /
     */
    // readonly originPath?: string;
    /**
     * Any additional headers to pass to the origin
     *
     * @default - No additional headers are passed.
     */
    // readonly originHeaders?: {
    //     [key: string]: string;
    // };

            }],
        });


      }
}
