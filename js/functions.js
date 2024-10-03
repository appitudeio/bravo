export const merge = (target, ...sources) => {
  const output = { ...target };

  sources.forEach(source => {
    if (isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          // If the key exists in the target and is also an object, merge them
          output[key] = output[key] ? merge(output[key], source[key]) : source[key];
        } else {
          // Otherwise, directly assign the value from source to output
          output[key] = source[key];
        }
      });
    }
  });

  return output;
}

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);