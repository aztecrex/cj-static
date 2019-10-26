import cdk = require('@aws-cdk/core');
import { DataStack, CertificateStack, DistributionStack } from  '../lib/stacks';



export class StaticSites extends cdk.App {

    private data: DataStack;

    constructor() {
        super();
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
