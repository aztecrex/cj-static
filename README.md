# Static File Service with Multiple Domains and Shared Content Store

At CJ, we want to replace our Apache-based file sharing with something in the cloud. Using
this opportunity to get acquanted with the new AWS CDK and to figure out how to do
TDD and Top-down with it.

## Architecture

This project uses a single S3 bucket to hold content. Each static site we need will get its
own domain, certificate, and CloudFront distribution (or, possibly, its own origin configuration
in a shared CF distro, TBD).

Each site will have an optional WAF config so we can add IP whitelisting for some content.

The Construct supports a simple way to add a domain: the method `addDistrubition` performs
all the work necessary to make a new website. Each domain results in an independent stack
so sites can be brought down without risking other site configs.

## Status

Generally working and has a [first site](https://files.cj.dev).

Example upload *cats.jpg* to files.cj.dev: `aws s3 cp cats.jpg s3://staticsitesstaticdata92393d-origincontentf0b6a01b-55v1e4nmnftb/files.cj.dev/cats.jpg`

To do:
- attach WAF to prevent access from outside our network
- generate write roles and provide a way for some of them to be assumed by developer role
- take out the cj-specific bits, turn the core of this into a library, and publish on npjms.org


## Future Feature Ideas

- command line UI for upload, delete, list - using roles
- once command line tool can set TTL, remove max TTL in distributions
- backup content store to archival storage in another region

## Install the CDK

Read about it and install it: https://aws.amazon.com/cdk/ .

## Useful commands

 * `npm run build`   compile and synthesize stacks
 * `npm run deploy`  compile and deploy to us-east-1 in current account
 * `npm run diff`    compile and display status
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk diff`        compare deployed stack with current state


