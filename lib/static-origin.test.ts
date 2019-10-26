import {StaticOrigin} from './static-origin';
import { expect as expectCDK, matchTemplate, MatchStyle, haveResource } from '@aws-cdk/assert';
import { Stack } from '@aws-cdk/core';

test('Has Content Bucket', () => {

    const stack = new Stack();

    new StaticOrigin(stack, "test");

    expectCDK(stack).to(haveResource('AWS::S3::Bucket'));
});

test('Has Origin Access Id', () => {

    const stack = new Stack();

    new StaticOrigin(stack, "test");

    expectCDK(stack).to(haveResource('AWS::CloudFront::CloudFrontOriginAccessIdentity'));
});
