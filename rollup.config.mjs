
import _camelCase from 'lodash-es/camelCase.js';
import _upperFirst from 'lodash-es/upperFirst.js';

import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const pkgs = [];

[
  {name: 'index'},
  {name: 'ajax'},
].forEach((pkg) => {
  const isCombined = pkg.name === 'index';

  const inputPath = `src/${pkg.name}.ts`;

  let outputName = `JsUtilsProj`;
  let outputFileDir = `dist`;
  let outputFileName = `js-utils-proj`;

  if (!isCombined) {
    outputName += `_${_upperFirst(_camelCase(pkg.name))}`;
    outputFileDir += `/${pkg.name}`;
    outputFileName += `.${pkg.name}`;
  }

  pkgs.push({
    input: inputPath,
    output: [
      {
        name: outputName,
        file: `${outputFileDir}/${outputFileName}.cjs.js`,
        format: 'cjs'
      },
      {
        name: outputName,
        file: `${outputFileDir}/${outputFileName}.esm.js`,
        format: 'esm'
      },

      {
        name: outputName,
        file: `${outputFileDir}/${outputFileName}.umd.js`,
        format: 'umd'
      },
      {
        name: outputName,
        file: `${outputFileDir}/${outputFileName}.umd.min.js`,
        format: 'umd',
        plugins: [terser()]
      }
    ],
    plugins: [typescript()],
  });
});

export default pkgs;
