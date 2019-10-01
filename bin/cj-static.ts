#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { CjStaticStack } from '../lib/cj-static-stack';

const app = new cdk.App();
new CjStaticStack(app, 'CjStaticStack');
