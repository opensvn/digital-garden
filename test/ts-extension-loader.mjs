export async function resolve(specifier, context, defaultResolve) {
  if (specifier === "vfile-reporter/lib") {
    return {
      shortCircuit: true,
      url: "data:text/javascript,export const VFile = undefined;",
    };
  }

  try {
    return await defaultResolve(specifier, context, defaultResolve);
  } catch (error) {
    const isRelativeImport = specifier.startsWith("./") || specifier.startsWith("../");
    if (
      (error.code === "ERR_MODULE_NOT_FOUND" || error.code === "ERR_UNSUPPORTED_DIR_IMPORT") &&
      isRelativeImport
    ) {
      try {
        return await defaultResolve(`${specifier}.ts`, context, defaultResolve);
      } catch {
        return defaultResolve(`${specifier}/index.ts`, context, defaultResolve);
      }
    }

    throw error;
  }
}
