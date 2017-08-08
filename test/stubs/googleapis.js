module.exports = {
  runtimeconfig: () => ({
    projects: {
      configs: {
        variables: {
          list: (unused, callback) =>
            callback(null, {
              variables: [{
                name: 'projects/thing/ehatever/KEY2',
                value: new Buffer('value2').toString('base64'),
              }],
            }),
        },
      },
    },
  }),
  auth: {
    getApplicationDefault: (callback) => {
      const authClient = {
        createScopedRequired: () => true,
        createScoped: () => 'authClient. Can be anything. Why not a string?',
      };
      callback(null, authClient, 'projectId');
    },
  },
};
