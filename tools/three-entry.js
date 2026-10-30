// Entry for the vendored three.js bundle (tools/build-vendor.mjs): the core plus the addons and post-processing
// libraries the 3D view uses. Everything lands on globalThis.THREE.
export * from 'three';
export { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
export { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
export { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
export { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
export { mergeGeometries, toTrianglesDrawMode } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
export * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
// post-processing: pmndrs postprocessing (Zlib) and N8AO (ISC); only src/js/gl/post.js touches these
export * as PP from 'postprocessing';
export { N8AOPostPass } from 'n8ao';
