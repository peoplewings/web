({
  // Tells Require.js to look at main.js for all shim and path configurations
  mainConfigFile: "../main.js",

  wrap: true,

  //All the built layers will use almond.
  name: "build/almond",

  // Removes third-party license comments
  preserveLicenseComments: false,

  // Uses uglify.js for minification
  optimize: "none",

  include: ["main"],
  out: "out.js"
})
