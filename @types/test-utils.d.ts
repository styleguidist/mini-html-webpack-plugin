declare module '@webpack-contrib/test-utils' {
	/* eslint-disable-next-line no-unused-vars */
	import webpack from 'webpack';

	const compiler: (
		context: any,
		args: webpack.Configuration
	) => Promise<{
		compilation: { assets: { [id: string]: { _value: string } } };
	}>;

	export default compiler;
}
