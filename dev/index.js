const concat = require('concat-files');
 
  concat([
    "./src/BlockExtractor.mjs",
    "./src/Block.mjs",
    "./src/ConditionalBlock.mjs",
    "./src/IterativeBlock.mjs",
  ], "./prebuild/block-extractor.mjs", function(err) {
    if (err) throw err
    console.log('done');
  });