module.exports = {
    webpack: (config) => {
        config.resolve.fallback = {
            fs: false,
            buffer: false
        };
        return config;
    },
}
