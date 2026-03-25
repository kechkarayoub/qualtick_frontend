module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const rules = webpackConfig.module?.rules ?? [];

      const matchesSourceMapLoader = (entry) =>
        typeof entry?.loader === 'string' && entry.loader.includes('source-map-loader');

      const patchLoaderOptions = (entry) => {
        entry.options = {
          ...(entry.options || {}),
          filterSourceMappingUrl: (_url, resourcePath) => {
            if (resourcePath.includes('react-datepicker')) {
              return false;
            }
            return true;
          },
        };
      };

      for (const rule of rules) {
        if (matchesSourceMapLoader(rule)) {
          patchLoaderOptions(rule);
        }

        if (Array.isArray(rule.use)) {
          for (const useEntry of rule.use) {
            if (matchesSourceMapLoader(useEntry)) {
              patchLoaderOptions(useEntry);
            }
          }
        }
      }

      return webpackConfig;
    },
  },
};
