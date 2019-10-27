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


    const domain = "foo.cj.dev";
    const stack = new CertificateStack(new App, domain);

    // then
    expectCDK(stack).to(haveResource('AWS::CertificateManager::Certificate', {
            DomainName: domain,
            ValidationMethod:  ValidationMethod.DNS,
        }));


});
