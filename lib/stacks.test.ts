import { StaticOrigin } from "./static-origin";
import { Stack, CfnOutput, App } from "@aws-cdk/core";
import { DataStack } from "./stacks";
import { SynthUtils } from "@aws-cdk/assert";

test('Data Stack Has Content Write Access Policy Arn Output', () => {

    // when
    const stack = new DataStack(new App());

    // then
    const output = stack.node.children.filter(c => c instanceof CfnOutput && c.node.id === 'WriteContentPolicyArn');
    expect(output.length).toBe(1);

    // snapshot on the output configuration
    expect(SynthUtils.toCloudFormation(stack).Outputs.WriteContentPolicyArn).toMatchSnapshot();

});

