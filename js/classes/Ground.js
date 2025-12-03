import {
	PlaneGeometry,
	MeshBasicMaterial,
	Mesh,
	TextureLoader,
	DoubleSide,
	SpriteMaterial,
	Sprite,
	BoxGeometry,
} from 'three';
import SCENE from '../three/SCENE.js';

class Ground {
	constructor( init ){

		this.textureLoader = new TextureLoader();
		this.collidables = [];

		// Main ground plane
		const ground_geometry = new PlaneGeometry( 100, 100 );
		const ground_material = new MeshBasicMaterial( {color: 0x333333, side: DoubleSide} );
		this.plane = new Mesh( ground_geometry, ground_material );
		this.plane.rotation.x = -Math.PI / 2;
		this.plane.position.y = 0;
		SCENE.add( this.plane );
		this.collidables.push( this.plane );

		// Load the grass sprite sheet
		const grass_texture = this.textureLoader.load('resource/grasses.png');
		const grass_material = new SpriteMaterial( { map: grass_texture, transparent: true } );

		const num_grass_sprites = 200;
		const grid_cols = 8;
		const grid_rows = 4;

		for( let i = 0; i < num_grass_sprites; i++ ){
			
			const material_clone = grass_material.clone();
			// IMPORTANT: Clone the map texture to allow for unique offsets
			material_clone.map = grass_texture.clone();
			material_clone.map.needsUpdate = true;

			const grass_sprite = new Sprite( material_clone );

			// Randomly select a grass sprite from the sheet
			const rand_col = Math.floor( Math.random() * grid_cols );
			const rand_row = Math.floor( Math.random() * grid_rows );

			material_clone.map.repeat.set( 1 / grid_cols, 1 / grid_rows );
			material_clone.map.offset.set( rand_col / grid_cols, rand_row / grid_rows );
			
			// Set varied scale (2x height vs width)
			const base_width = 0.3;
			const grass_width = base_width + Math.random() * 0.3;
			const grass_height = grass_width * 2;
			grass_sprite.scale.set( grass_width, grass_height, 1 );

			// Position randomly on the ground plane
			grass_sprite.position.x = Math.random() * 50 - 25;
			grass_sprite.position.z = Math.random() * 50 - 25;
			grass_sprite.position.y = grass_height / 2; // Anchor sprite at its base

			SCENE.add( grass_sprite );
		}

		// Add some boxes for elevation
		const box_geometry = new BoxGeometry( 1, 1, 1 );
		const box_material = new MeshBasicMaterial( {color: 0x888888} );

		// Create a simple staircase
		let current_x = 5;
		let current_y = 0.5;
		for( let i = 0; i < 4; i++ ) {
			const box = new Mesh( box_geometry, box_material.clone() );
			box.position.set( current_x, current_y, 0 );
			SCENE.add( box );
			this.collidables.push( box );
			current_x += 1.5;
			current_y += 0.9;
		}

		// Create another platform
		let box2 = new Mesh( box_geometry, box_material.clone() );
		box2.position.set( -8, 0.5, 0 );
		SCENE.add( box2 );
		this.collidables.push( box2 );
		box2 = new Mesh( box_geometry, box_material.clone() );
		box2.position.set( -9.5, 1.4, 0 );
		SCENE.add( box2 );
		this.collidables.push( box2 );
		box2 = new Mesh( box_geometry, box_material.clone() );
		box2.position.set( -11, 2.3, 0 );
		SCENE.add( box2 );
		this.collidables.push( box2 );

	}
}

export default Ground;