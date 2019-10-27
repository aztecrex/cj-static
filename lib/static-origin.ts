import { Construct } from '@aws-cdk/core';
import { Bucket, BucketPolicy } from '@aws-cdk/aws-s3';
import { CfnCloudFrontOriginAccessIdentity } from '@aws-cdk/aws-cloudfront';
import { ManagedPolicy, PolicyStatement, Effect } from '@aws-cdk/aws-iam';
export interface IStaticOrigin {

    store: Bucket,
    accessId: CfnCloudFrontOriginAccessIdentity,
    writeAccessPolicy: ManagedPolicy,

}


export class StaticOrigin extends Construct implements IStaticOrigin {
    writeAccessPolicy: ManagedPolicy;
    store: Bucket;
    accessId: CfnCloudFrontOriginAccessIdentity;

    constructor(scope: Construct) {
        super(scope, "Origin");

        this.store = new Bucket(this, 'Content');
        this.accessId = new CfnCloudFrontOriginAccessIdentity(this, 'WebId', {
            cloudFrontOriginAccessIdentityConfig: {
                comment: "Web Identity for Static Site"
            }
        });
        this.writeAccessPolicy = new WriteAccessPolicy(this, this.store);
        new AccessIdReadPolicy(this, this.store, this.accessId);

    }
}


class AccessIdBucketReadAnyStatement extends PolicyStatement {
    constructor(bucket: Bucket, accessId: CfnCloudFrontOriginAccessIdentity) {
        super();
        this.effect = Effect.ALLOW;
        this.addActions('s3:GetObject');
        this.addResources(bucket.arnForObjects('*'));
        this.addCanonicalUserPrincipal(accessId.ref);
    }
}

class BucketWriteAnyStatement extends PolicyStatement {
    constructor(bucket: Bucket) {
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


export class AccessIdReadPolicy extends BucketPolicy {
    bucket: Bucket;
    accessId: CfnCloudFrontOriginAccessIdentity;

    constructor(scope: Construct, bucket: Bucket, accessId: CfnCloudFrontOriginAccessIdentity) {
        super(scope, bucket.node.id + "AccessIdReadAccess", {
            bucket: bucket
        });
        this.document.addStatements(new AccessIdBucketReadAnyStatement(bucket, accessId));
        this.bucket = bucket;
        this.accessId = accessId;
    }
}

export class WriteAccessPolicy extends ManagedPolicy {

    bucket: Bucket;

    constructor(scope: Construct, bucket: Bucket) {
        super(scope, bucket.node.id + "WriteAccess", {
            statements: [new BucketWriteAnyStatement(bucket)]
        });
        this.bucket = bucket;
    }
}


