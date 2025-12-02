import { WebGLRenderer } from 'three';

const RENDERER = new WebGLRenderer();
RENDERER.setSize( window.innerWidth, window.innerHeight );

export default RENDERER;