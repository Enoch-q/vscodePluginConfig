import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from "rollup-plugin-uglify";
import json from '@rollup/plugin-json';

// export default {
//     input: 'src/index.js',
//     output: {
//         file: 'dist/bundle.js',
//         format: 'cjs',
//         name: 'vscodePlugin'
//     },
//     plugins: [
//         resolve(),
//         commonjs(),
//         // uglify(),
//         json()
//     ]
// };
export default {
    input: 'src/index.js',
    output: {
        file: 'dist/bundle.js',
        format: 'cjs',
        name: 'vscodePlugin'
    },
    plugins: [
        commonjs(),
        resolve(),
        // uglify(),
        json()
    ]
};