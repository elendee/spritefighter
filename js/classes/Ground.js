import {
	PlaneGeometry,
	MeshBasicMaterial,
	Mesh,
	TextureLoader,
	DoubleSide,
} from 'three';
import SCENE from '../three/SCENE.js';

class Ground {
	constructor( init ){

		this.textureLoader = new TextureLoader();

		const ground_geometry = new PlaneGeometry( 100, 100 );
		const ground_material = new MeshBasicMaterial( {color: 0x333333, side: DoubleSide} );
		this.plane = new Mesh( ground_geometry, ground_material );
		this.plane.rotation.x = -Math.PI / 2;
		this.plane.position.y = 0;

		SCENE.add( this.plane );

		// Add grass patches using PlaneGeometry
		const grass_texture = this.textureLoader.load('https://placehold.co/128x128/008000/FFFFFF.png?text=grass');
		const grass_material = new MeshBasicMaterial( { map: grass_texture, side: DoubleSide, transparent: true, opacity: 0.8 } );
		const grass_geometry = new PlaneGeometry( 1, 1 ); // Small planes for grass

		for( let i = 0; i < 100; i++ ){
			const grass_patch = new Mesh( grass_geometry, grass_material );
			grass_patch.rotation.x = -Math.PI / 2;
			grass_patch.position.x = Math.random() * 50 - 25;
			grass_patch.position.z = Math.random() * 50 - 25;
			grass_patch.position.y = 0.09; // Slightly above the ground
			SCENE.add( grass_patch );
		}

	}
}

export default Ground;