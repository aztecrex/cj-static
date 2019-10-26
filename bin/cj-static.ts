#!/usr/bin/env node
import 'source-map-support/register';

import { StaticSites } from '../lib/app';

import cdk = require('@aws-cdk/core');
import { CjStaticStack } from '../lib/cj-static-stack';

const sites = new StaticSites();
sites.addDistribution("files.cj.dev");
sites.addDistribution("commitments.cj.dev");
