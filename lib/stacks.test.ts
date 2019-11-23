import { StaticOrigin } from "./static-origin";
import { CfnOutput, App, Stack } from "@aws-cdk/core";
import { DnsValidatedCertificate, ValidationMethod } from '@aws-cdk/aws-certificatemanager';
import { DataStack, CertificateStack, DistributionStack } from "./stacks";
import { expect as expectCDK, haveResource, haveResourceLike, SynthUtils } from '@aws-cdk/assert';
import { Bucket } from "@aws-cdk/aws-s3";

test('Data Stack Has Content Write Access Policy Arn Output', () => {

    // when
    const stack = new DataStack(new App());

    // then
    const output = stack.node.children.filter(c => c instanceof CfnOutput && c.node.id === 'WriteContentPolicyArn');
    expect(output.length).toBe(1);

    // snapshot on the output configuration
    expect(SynthUtils.toCloudFormation(stack).Outputs.WriteContentPolicyArn).toMatchSnapshot();

});

test('Certificate Stack Has Certificate', () => {


    const domain = "foo.bar.com";
    const stack = new CertificateStack(new App, domain);

    // then
    expectCDK(stack).to(haveResource('AWS::CertificateManager::Certificate', {
            DomainName: domain,
            ValidationMethod:  ValidationMethod.DNS,
        }));


});

test('Certificate Stack Deploys to US East 1', () => {

    const stack = new CertificateStack(new App, "foo.bar.com");

    expect(stack.region).toBe("us-east-1");
});

function squish(s: string): string {
    return s.replace(/[^a-zA-Z0-9]/g, '');
}

test('Certificate Stack Has Certificate Arn Output', () => {

    // when
    const stack = new CertificateStack(new App, "foo.bar.com");

    // then
    const nodeId = "Certificate-foo-bar-com-Arn";
    const output = stack.node.children.filter(c => c instanceof CfnOutput && c.node.id === nodeId);
    expect(output.length).toBe(1);

    // snapshot the output configuration
    const tpl = SynthUtils.toCloudFormation(stack);
    expect(tpl.Outputs[squish(nodeId)]).toMatchSnapshot();

});

test('Distribution stack has distribution', () => {
    // given
    const app = new App;
    const bstack = new Stack(app, "data", {});
    const origin = new Bucket(bstack, "o");

    // when
    const stack = new DistributionStack(app,  "bar.foo.com", origin);

    // then
    expectCDK(stack).to(haveResourceLike('AWS::CloudFront::Distribution', {
        DistributionConfig: {
            Origins: [{
                OriginPath: "/bar.foo.com/*",
            },]
        },
    }));

    // snapshot because values depend on CDK implementation
    const tpl = SynthUtils.toCloudFormation(stack);
    const ress = tpl.Resources;
    const res = Object.keys(ress).find(k => k.startsWith("CDN"));
    expect(res).toMatchSnapshot();

});
