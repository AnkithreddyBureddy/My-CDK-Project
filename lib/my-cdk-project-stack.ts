import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';  // Import Construct from 'constructs'
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';

export class MyCdkProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();

    // CodeBuild Project
    const buildProject = new codebuild.PipelineProject(this, 'BuildProject', {
      buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yml'),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
      },
    });

    // CodePipeline
    new codepipeline.Pipeline(this, 'MyPipeline', {
      pipelineName: 'MyCdkPipeline',
      stages: [
        {
          stageName: 'Source',
          actions: [
            new codepipeline_actions.GitHubSourceAction({
              actionName: 'GitHub_Source',
              owner: 'AnkithreddyBureddy',
              repo: 'My-CDK-Project',
              oauthToken: cdk.SecretValue.unsafePlainText('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'),
              output: sourceOutput,
              branch: 'main',
            }),
          ],
        },
        {
          stageName: 'Build',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'CodeBuild',
              project: buildProject,
              input: sourceOutput,
              outputs: [buildOutput],
            }),
          ],
        },
        {
          stageName: 'Deploy',
          actions: [
            new codepipeline_actions.CloudFormationCreateUpdateStackAction({
              actionName: 'DeployCDK',
              stackName: 'MyCdkStack',
              templatePath: buildOutput.atPath('MyCdkStack.template.json'),
              adminPermissions: true,
            }),
          ],
        },
      ],
    });
  }
}
