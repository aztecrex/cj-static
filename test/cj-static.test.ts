import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import CjStatic = require('../lib/cj-static-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new CjStatic.CjStaticStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});