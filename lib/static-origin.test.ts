import {StaticOrigin, WriteAccessPolicy, AccessIdReadPolicy} from './static-origin';
import { expect as expectCDK, haveResource, SynthUtils } from '@aws-cdk/assert';
import { Stack } from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import * as cloudfront from '@aws-cdk/aws-cloudfront';

test('Has Content Bucket', () => {

    const stack = new Stack();

    new StaticOrigin(stack);

    expectCDK(stack).to(haveResource('AWS::S3::Bucket'));
});

test('Has Origin Access Id', () => {

    const stack = new Stack();

    new StaticOrigin(stack);

    expectCDK(stack).to(haveResource('AWS::CloudFront::CloudFrontOriginAccessIdentity'));
});

test('Has Origin Access Read Bucket Policy', () => {

    // when
    const origin = new StaticOrigin(new Stack());

    // then
    // a. we find a single AcccessIdReadPolicy
    const matching = origin.node.children.filter(c => c instanceof AccessIdReadPolicy);
    expect(matching.length).toBe(1);

    // b. policy is attached to content bucket
    expect((matching[0] as AccessIdReadPolicy).bucket).toBe(origin.store);

    // c. policy is attched to origin access id
    expect((matching[0] as AccessIdReadPolicy).accessId).toBe(origin.accessId);

});

test('Has Content Write Access Policy', () => {

    // when
    const origin = new StaticOrigin(new Stack());

    // then
    // a. we find a single WriteAccessPolicy in the construct
    const matching = origin.node.children.filter(c => c instanceof WriteAccessPolicy);
    expect(matching.length).toBe(1);

    // b. policy bucket is the origin content bucket
    expect((matching[0] as WriteAccessPolicy).bucket).toBe(origin.store);

});



/* -------------------------------------------------------------------------------------------------------------
 * Experimental snapshot testing
 *
 * Using snapshots to prevent regressions on highly technical, high-risk items such as security policy. These
 * are the least likely to benefit from TDD since they are data, not behavior. However, they will necessarily be
 * driven by wizard ops work which is kind of lousy.
 */


test ('Snapshot: Write Access Policy', () => {

    const stack = new Stack();
    const bucket = new Bucket(stack, "test");

    const policy = new WriteAccessPolicy(stack, bucket);

    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();

});

test ('Snapshot: Access Id Read Access Policy', () => {

    const stack = new Stack();
    const bucket = new Bucket(stack, "test");
    const id = new cloudfront.OriginAccessIdentity(stack, "testid");

    const policy = new AccessIdReadPolicy(stack, bucket, id);

    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();

});
