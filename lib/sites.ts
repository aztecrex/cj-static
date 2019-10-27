import cdk = require('@aws-cdk/core');
import { DataStack, CertificateStack, DistributionStack } from  './stacks';



export class StaticSites extends cdk.Construct {

    private data: DataStack;

    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);
        this.data = new DataStack(this);
      }

    addDistribution(domain: string): StaticSites {
        const cert = new CertificateStack(this, domain);
        const dist = new DistributionStack(this, domain);
        dist.addDependency(this.data);
        dist.addDependency(cert);
        return this;
    }

}
