#!/usr/bin/env node
import 'source-map-support/register';

import * as cdk  from '@aws-cdk/core';

import { StaticSites } from '../lib/sites';

const app = new cdk.App();
const sites = new StaticSites(app, "StaticSites");
sites.addDistribution("files.cj.dev");
sites.addDistribution("commitments.cj.dev");
