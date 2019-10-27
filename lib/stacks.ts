import cdk = require('@aws-cdk/core');

import {StaticOrigin} from './static-origin';
import { CfnOutput } from '@aws-cdk/core';
import { DnsValidatedCertificate, Certificate, ValidationMethod } from '@aws-cdk/aws-certificatemanager';


function asName(s: string): string {
    return s.replace(/[^A-Za-z0-9-]/g, '-');
}

export class DataStack extends cdk.Stack {
    constructor(scope: cdk.Construct, props?: cdk.StackProps) {
        super(scope, "StaticData", props);

        const origin = new StaticOrigin(this);

        new CfnOutput(this, "WriteContentPolicyArn", {
            value: origin.writeAccessPolicy.managedPolicyArn,
            exportName: 'WriteContentPolicyArn',
        });

      }
}

export class CertificateStack extends cdk.Stack {
    constructor(scope: cdk.Construct, domain: string, props?: cdk.StackProps) {
        super(scope, "Certificate-" + asName(domain), props);
        new Certificate(this, "Certificate", {
            domainName: domain,
            validationMethod:  ValidationMethod.DNS,
        });
      }
}

export class DistributionStack extends cdk.Stack {
    constructor(scope: cdk.Construct, domain: string, props?: cdk.StackProps) {
        super(scope, "Distribution-" + asName(domain), props);

      }
}
