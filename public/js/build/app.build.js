({
  // Tells Require.js to look at main.js for all shim and path configurations
  mainConfigFile: "../main.js",
  urlArgs: null,

  //All the built layers will use almond.
  name: "build/almond",

  // Uses uglify.js for minification
  optimize: "uglify",

  include: ["main"],
  out: "out.js"
})
