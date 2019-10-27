#!/usr/bin/env node
import 'source-map-support/register';

import { StaticSites } from '../lib/sites';

import cdk = require('@aws-cdk/core');
import { CjStaticStack } from '../lib/cj-static-stack';

const app = new cdk.App();
const sites = new StaticSites(app, "StaticSites");
sites.addDistribution("files.cj.dev");
sites.addDistribution("commitments.cj.dev");
