import * as cdk  from '@aws-cdk/core';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as s3 from '@aws-cdk/aws-s3';
import * as waf from '@aws-cdk/aws-waf';
import * as R from 'ramda';

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

        const firewall = new Firewall(this, 'firewall');

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
            webACLId: firewall.acl.ref // don't attach while debugging or we'll have a long wait
        });

      }
}

class Firewall extends cdk.Construct {

    public readonly acl: waf.CfnWebACL;

    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);

        const natIps = new CNVRNats(this);
        const rule = new waf.CfnRule(this, 'allowed-sources', {
            metricName: 'StaticSitesAllowedSources',
            name: 'StaticSitesAllowedSources',
            predicates: [
                {
                    dataId: natIps.ref,
                    type: 'IPMatch',
                    negated: false,

                }
            ],
        });
        this.acl = new waf.CfnWebACL(this, 'firewall', {
            defaultAction: {type: 'BLOCK'},
            metricName: "InternalSitesFirewall",
            name: "InternalSitesFirewall",
            rules: [
                {
                    action: {type: 'ALLOW'},
                    priority: 1,
                    ruleId: rule.ref,
                }
            ]
        });

    }

}

class CNVRNats extends waf.CfnIPSet {
    constructor(scope: cdk.Construct) {
        super(scope, 'cnvr-nats', {
            name: 'cnvr-nats',
            ipSetDescriptors: CNVRNats.descriptors(),
        });
    }

    private static descriptors(): waf.CfnIPSet.IPSetDescriptorProperty[] {
        return R.concat(
            R.map(s => ({type: "IPV4", value: s}), NAT_IPV4_SOURCES),
            R.map(s => ({type: "IPV6", value: s}), NAT_IPV6_SOURCES),
        );
    }

}


const NAT_IPV4_SOURCES: string[] = [

"63.215.202.0/24",
"64.158.223.0/24",
"159.127.42.0/23",
"216.48.66.0/24",
"89.207.16.0/21",
"8.18.45.0/24",
"64.156.167.0/24",
"205.180.86.0/23",
"159.127.104.0/22",
"159.127.40.0/23",
"67.72.99.0/24",
"205.180.85.0/24",
"41.162.70.34/32",
"89.197.36.34/32",
"31.221.7.18/32",
"62.96.18.234/32",
"62.96.18.234/32",
"62.96.18.234/32",
"88.217.144.6/32",
"195.68.101.136/29",
"178.208.9.229/32",

];

const NAT_IPV6_SOURCES: string[] = [
"2606:ae80:0000:0000:0000:0000:0000:0000/32",
"2a02:fa8:0000:0000:0000:0000:0000:0000/32",
];





