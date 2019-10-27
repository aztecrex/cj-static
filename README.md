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

So far, the content store, origin access id, read and write permissions, and the certificate
requests are working. Next up is the CloudFront provisioning. In our environment, vanity
domains are managed in a separate administration boundary so initiall we'll just output the
necessary information to configure those without actually provisioning anything in Route 53.

Then I'll start on the WAF.

## Future Feature Ideas

- backup content store to archival storage
- partition write access by site
- expose DNS administration (a separate project) for cert validation and create a custom
  resource for cert validation (alternatively, use the one in CDK but I don't think it
  is compatible with our particular administrative setup).

## Install the CDK

Read about it and install it: https://aws.amazon.com/cdk/ .

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template


