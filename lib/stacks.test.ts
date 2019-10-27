import { StaticOrigin } from "./static-origin";
import { CfnOutput, App } from "@aws-cdk/core";
import { DnsValidatedCertificate, ValidationMethod } from '@aws-cdk/aws-certificatemanager';
import { DataStack, CertificateStack } from "./stacks";
import { expect as expectCDK, haveResource, SynthUtils } from '@aws-cdk/assert';

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
    console.log(tpl.Outputs);
    expect(tpl.Outputs[squish(nodeId)]).toMatchSnapshot();

});
