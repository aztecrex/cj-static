import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import { ManagedPolicy, PolicyStatement, Effect } from '@aws-cdk/aws-iam';
export interface IStaticOrigin {

    readonly store: s3.Bucket,
    readonly accessId: cloudfront.OriginAccessIdentity,
    readonly writeAccessPolicy: ManagedPolicy,

}


export class StaticOrigin extends cdk.Construct implements IStaticOrigin {
    writeAccessPolicy: ManagedPolicy;
    store: s3.Bucket;
    accessId: cloudfront.OriginAccessIdentity;

    constructor(scope: cdk.Construct) {
        super(scope, "Origin");

        this.store = new s3.Bucket(this, 'Content');

        this.accessId = new cloudfront.OriginAccessIdentity(this, 'access-id');

        this.writeAccessPolicy = new WriteAccessPolicy(this, this.store);
        new AccessIdReadPolicy(this, this.store, this.accessId);

    }
}


class AccessIdBucketReadAnyStatement extends PolicyStatement {
    constructor(bucket: s3.Bucket, accessId: cloudfront.OriginAccessIdentity) {
        super();
        this.effect = Effect.ALLOW;
        this.addActions('s3:GetObject');
        this.addResources(bucket.arnForObjects('*'));
        this.addCanonicalUserPrincipal(accessId.cloudFrontOriginAccessIdentityS3CanonicalUserId);
    }
}

class BucketWriteAnyStatement extends PolicyStatement {
    constructor(bucket: s3.Bucket) {
        super();
        this.effect = Effect.ALLOW;
        this.addActions(
            's3:PutObject',
            's3:DeleteObject',
            's3:GetObject',
            's3:ListBucket',
            's3:AbortMultipartUpload',
            's3:ListBucketMultipartUploads',
            's3:ListMultipartUploadParts');
        this.addResources(bucket.arnForObjects('*'), bucket.bucketArn);
    }
}


export class AccessIdReadPolicy extends s3.BucketPolicy {
    bucket: s3.Bucket;
    accessId: cloudfront.OriginAccessIdentity;

    constructor(scope: cdk.Construct, bucket: s3.Bucket, accessId: cloudfront.OriginAccessIdentity) {
        super(scope, bucket.node.id + "AccessIdReadAccess", {
            bucket: bucket
        });
        this.document.addStatements(new AccessIdBucketReadAnyStatement(bucket, accessId));
        this.bucket = bucket;
        this.accessId = accessId;
    }
}

export class WriteAccessPolicy extends ManagedPolicy {

    bucket: s3.Bucket;

    constructor(scope: cdk.Construct, bucket: s3.Bucket) {
        super(scope, bucket.node.id + "WriteAccess", {
            statements: [new BucketWriteAnyStatement(bucket)]
        });
        this.bucket = bucket;
    }
}


