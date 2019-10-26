import {StaticSite} from './static-site';
import { expect as expectCDK, matchTemplate, MatchStyle, haveResource } from '@aws-cdk/assert';
import { Stack } from '@aws-cdk/core';

test('Has Content Bucket', () => {

    const stack = new Stack();

    const site = new StaticSite(stack, "site");

    expectCDK(stack).to(haveResource('AWS::S3::Bucket'));
    expectCDK(stack).to(haveResource('AWS::CloudFront::CloudFrontOriginAccessIdentity'));
});
