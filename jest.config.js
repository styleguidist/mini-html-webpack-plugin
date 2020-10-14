module.exports = {
	preset: 'ts-jest',
	globals: {
    'ts-jest': {
      // Disable type-checking in Jest tests since we test separately
      isolatedModules: true,
    },
  },
};
