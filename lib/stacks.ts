import * as cdk from "@aws-cdk/core";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as s3 from "@aws-cdk/aws-s3";
import * as waf from "@aws-cdk/aws-waf";
import * as R from "ramda";
import * as nat from "@cjdev/nataddr";

import { StaticOrigin } from "./static-origin";

function asName(s: string): string {
  return s.replace(/[^A-Za-z0-9-]/g, "-");
}

export class EasternStack extends cdk.Stack {
  private static STACK_ENV = { region: "us-east-1" };

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, { ...props, env: EasternStack.STACK_ENV });
  }
}

export class DataStack extends EasternStack {
  readonly origin: StaticOrigin;

  constructor(scope: cdk.Construct) {
    super(scope, "StaticData");

    this.origin = new StaticOrigin(this);

    new cdk.CfnOutput(this, "WriteContentPolicyArn", {
      value: this.origin.writeAccessPolicy.managedPolicyArn,
      exportName: "WriteContentPolicyArn",
    });
  }
}

export class CertificateStack extends EasternStack {
  public readonly certificate: acm.Certificate;

  constructor(scope: cdk.Construct, domain: string) {
    super(scope, "Certificate-" + asName(domain));
    this.certificate = new acm.Certificate(this, "Certificate", {
      domainName: domain,
      validationMethod: acm.ValidationMethod.DNS,
    });

    new cdk.CfnOutput(this, "Certificate-" + asName(domain) + "-Arn", {
      value: this.certificate.certificateArn,
    });
  }
}

export class DistributionStack extends EasternStack {
  constructor(
    scope: cdk.Construct,
    domain: string,
    origin: s3.IBucket,
    certificate: acm.Certificate,
    originAccessId: cloudfront.OriginAccessIdentity
  ) {
    super(scope, "Distribution-" + asName(domain));

    const firewall = new Firewall(this, "firewall");

    const cdn = new cloudfront.CloudFrontWebDistribution(this, "CDN", {
      aliasConfiguration: {
        acmCertRef: certificate.certificateArn,
        names: [domain],
      },
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: origin,
            originAccessIdentity: originAccessId,
          },
          originPath: "/" + domain,
          behaviors: [
            {
              isDefaultBehavior: true,
              maxTtl: cdk.Duration.seconds(120),
              minTtl: cdk.Duration.seconds(15),
              defaultTtl: cdk.Duration.seconds(120),
            },
          ],
        },
      ],
      webACLId: firewall.acl.ref, // don't attach while debugging or we'll have a long wait
    });

    new cdk.CfnOutput(this, "DomainName", {
      value: cdn.domainName,
    });
  }
}

class Firewall extends cdk.Construct {
  public readonly acl: waf.CfnWebACL;

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    const natIps = new CNVRNats(this);
    const rule = new waf.CfnRule(this, "allowed-sources", {
      metricName: "StaticSitesAllowedSources",
      name: "StaticSitesAllowedSources",
      predicates: [
        {
          dataId: natIps.ref,
          type: "IPMatch",
          negated: false,
        },
      ],
    });
    this.acl = new waf.CfnWebACL(this, "firewall", {
      defaultAction: { type: "BLOCK" },
      metricName: "InternalSitesFirewall",
      name: "InternalSitesFirewall",
      rules: [
        {
          action: { type: "ALLOW" },
          priority: 1,
          ruleId: rule.ref,
        },
      ],
    });
  }
}

class CNVRNats extends waf.CfnIPSet {
  constructor(scope: cdk.Construct) {
    super(scope, "cnvr-nats", {
      name: "cnvr-nats",
      ipSetDescriptors: CNVRNats.descriptors(),
    });
  }

  private static descriptors(): waf.CfnIPSet.IPSetDescriptorProperty[] {
    // workaround for WAF classic, 44 bit netmask is not allowed
    // so we just exclude it. ultimate solution is to upgrade to
    // current WAF version
    const usable = R.filter((b) => !b.descriptor.endsWith("/44"), nat.all());
    return R.map((b) => {
      return {
        type: b.type === nat.AddressType.IPV4 ? "IPV4" : "IPV6",
        value: b.descriptor,
      };
    }, usable);
  }
}

// const NAT_IPV4_SOURCES: string[] = nat.v4();

// const NAT_IPV6_SOURCES: string[] = nat.v6();
