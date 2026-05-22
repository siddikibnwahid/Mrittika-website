module.exports = {
  // Explicitly set the Turbopack root to avoid workspace confusion when multiple lockfiles exist.
  turbopack: {
    root: __dirname,
  },
  // Suppress deprecation warning for middleware; using the new proxy convention.
  // Future updates can migrate middleware to the "proxy" file.
  // No additional custom config needed for the Earthy Minimalist redesign.
};
