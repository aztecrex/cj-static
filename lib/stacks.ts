import * as cdk  from '@aws-cdk/core';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as s3 from '@aws-cdk/aws-s3';

import {StaticOrigin} from './static-origin';


function asName(s: string): string {
    return s.replace(/[^A-Za-z0-9-]/g, '-');
}


export class EasternStack extends cdk.Stack {

    private static STACK_ENV = {region: 'us-east-1'};

    constructor(scope: cdk.Construct, id: string,  props?: cdk.StackProps) {
        super(scope, id, {...props, env: EasternStack.STACK_ENV});
    }
}

export class DataStack extends EasternStack {
    readonly origin: StaticOrigin;

    constructor(scope: cdk.Construct) {
        super(scope, "StaticData");

        this.origin = new StaticOrigin(this);

        new cdk.CfnOutput(this, "WriteContentPolicyArn", {
            value: this.origin.writeAccessPolicy.managedPolicyArn,
            exportName: 'WriteContentPolicyArn',
        });

      }
}

export class CertificateStack extends EasternStack {

    public readonly certificate: acm.Certificate;

    constructor(scope: cdk.Construct, domain: string) {
        super(scope, "Certificate-" + asName(domain));
        this.certificate = new acm.Certificate(this, "Certificate", {
            domainName: domain,
            validationMethod:  acm.ValidationMethod.DNS,
        });

        new cdk.CfnOutput(this, "Certificate-" + asName(domain) + "-Arn", {
            value: this.certificate.certificateArn,
        });
      }
}


export class DistributionStack extends EasternStack {
    constructor(scope: cdk.Construct, domain: string, origin: s3.IBucket, certificate: acm.Certificate, originAccessId: cloudfront.OriginAccessIdentity) {
        super(scope, "Distribution-" + asName(domain));

        const cdn = new cloudfront.CloudFrontWebDistribution(this, "CDN", {
            aliasConfiguration: {
                acmCertRef: certificate.certificateArn,
                names: [domain],
            },
            originConfigs: [{
                s3OriginSource: {
                    s3BucketSource: origin,
                    originAccessIdentity: originAccessId,
                },
                originPath: "/" + domain,
                behaviors: [{
                    isDefaultBehavior: true,
                    maxTtl: cdk.Duration.seconds(120),
                    minTtl: cdk.Duration.seconds(15),
                    defaultTtl: cdk.Duration.seconds(120),

                }],

            }],
        });

      }
}
