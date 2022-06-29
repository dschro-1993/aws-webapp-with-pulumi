import * as pulumi from '@pulumi/pulumi';

export const enforceTags = (tags: Record<string, string>): void => {
  pulumi.runtime.registerStackTransformation((args) => {
    if (args.props.hasOwnProperty('tags')) {
      args.props['tags'] = {...args.props['tags'], ...tags};
      return {props: args.props, opts: args.opts};
    }
  });
};
