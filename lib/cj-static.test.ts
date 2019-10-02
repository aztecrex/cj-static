import { expect as expectCDK, matchTemplate, MatchStyle, haveResource } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import CjStatic = require('./cj-static-stack');

// test('Empty Stack', () => {
//     const app = new cdk.App();
//     // WHEN
//     const stack = new CjStatic.CjStaticStack(app, 'MyTestStack');
//     // THEN
//     expectCDK(stack).to(matchTemplate({
//       "Resources": {}
//     }, MatchStyle.EXACT))
// });

test('Has Content Bucket', () => {
    const app = new cdk.App();

    const stack = new CjStatic.CjStaticStack(app, "teststack");

    expectCDK(stack).to(haveResource('AWS::S3::Bucket' ));
});
