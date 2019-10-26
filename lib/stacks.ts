import cdk = require('@aws-cdk/core');

import {StaticOrigin} from './static-origin';


export class DataStack extends cdk.Stack {
    constructor(scope: cdk.Construct, props?: cdk.StackProps) {
        super(scope, "StaticData", props);

        new StaticOrigin(this, "Origin");

      }
}

export class CertificateStack extends cdk.Stack {
    constructor(scope: cdk.Construct, domain: string, props?: cdk.StackProps) {
        super(scope, "Certificate" + domain, props);

      }
}

export class DistributionStack extends cdk.Stack {
    constructor(scope: cdk.Construct, domain: string, props?: cdk.StackProps) {
        super(scope, "Distribution" + domain, props);

      }
}
