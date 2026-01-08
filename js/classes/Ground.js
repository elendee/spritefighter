import env from '../env.js'
import {
	PlaneGeometry,
	MeshBasicMaterial,
	Mesh,
	TextureLoader,
	DoubleSide,
	SpriteMaterial,
	Sprite,
	BoxGeometry,
	MeshLambertMaterial,
	RepeatWrapping,
	CanvasTexture,
} from 'three';
import SCENE from '../three/SCENE.js';

class Ground {

	get_cloud_canvas(){
		const canvas = document.createElement('canvas');
		canvas.width = 128;
		canvas.height = 64;
		const context = canvas.getContext('2d');
		
		context.fillStyle = 'white';
		context.beginPath();
		context.arc(32, 32, 30, Math.PI * 0.5, Math.PI * 1.5);
		context.arc(64, 32, 32, Math.PI * 1, Math.PI * 2);
		context.arc(96, 32, 30, Math.PI * 1.5, Math.PI * 0.5);
		context.closePath();
		context.fill();
		
		return canvas;
	}

	constructor( init ){

		this.textureLoader = new TextureLoader();
		this.collidables = [];
		this.clouds = [];
		this.cloud_speed = 2;

		// Main ground plane
		const ground_geometry = new PlaneGeometry( 100, 100 );
		const ground_texture = this.textureLoader.load( env.PUB_ROOT + '/resource/crate.gif');
		ground_texture.wrapS = ground_texture.wrapT = RepeatWrapping;
		ground_texture.repeat.set( 10, 10 ); // Repeat 10 times across the plane
		const ground_material = new MeshLambertMaterial( { map: ground_texture, side: DoubleSide} );
		this.plane = new Mesh( ground_geometry, ground_material );
		this.plane.rotation.x = -Math.PI / 2;
		this.plane.position.y = 0;
		this.plane.receiveShadow = true; // Receive shadows
		SCENE.add( this.plane );
		this.collidables.push( this.plane );

		// Clouds
		const cloud_texture = new CanvasTexture( this.get_cloud_canvas() );
		const cloud_material = new SpriteMaterial( { map: cloud_texture, transparent: true, opacity: 0.8 } );
		for( let i = 0; i < 5; i++ ) {
			const cloud = new Sprite( cloud_material.clone() );
			cloud.position.set(
				(Math.random() * 100) - 50,
				8 + (Math.random() * 2),
				-10 - (Math.random() * 10)
			);
			cloud.scale.set( 10 + (Math.random() * 5), 5 + (Math.random() * 2.5), 1 );
			this.clouds.push( cloud );
			SCENE.add( cloud );
		}

		// Load the grass sprite sheet
		const grass_texture = this.textureLoader.load('resource/grasses.png');
		const grass_material = new SpriteMaterial( { map: grass_texture, transparent: true } );

		const num_grass_sprites = 200;
		const grid_cols = 8;
		const grid_rows = 4;

		for( let i = 0; i < num_grass_sprites; i++ ){
			
			const material_clone = grass_material.clone();
			material_clone.map = grass_texture.clone();
			material_clone.map.needsUpdate = true;

			const grass_sprite = new Sprite( material_clone );

			const rand_col = Math.floor( Math.random() * grid_cols );
			const rand_row = Math.floor( Math.random() * grid_rows );

			material_clone.map.repeat.set( 1 / grid_cols, 1 / grid_rows );
			material_clone.map.offset.set( rand_col / grid_cols, rand_row / grid_rows );
			
			const base_width = 0.3;
			const grass_width = base_width + Math.random() * 0.3;
			const grass_height = grass_width * 2;
			grass_sprite.scale.set( grass_width, grass_height, 1 );

			grass_sprite.position.x = Math.random() * 50 - 25;
			grass_sprite.position.z = Math.random() * 50 - 25;
			grass_sprite.position.y = grass_height / 2;

			SCENE.add( grass_sprite );
		}

		// Add some boxes for elevation
		const box_geometry = new BoxGeometry( 1, 1, 1 );
		const crate_texture = this.textureLoader.load( env.PUB_ROOT + '/resource/crate.gif');
		const crate_material = new MeshLambertMaterial( { 
			map: crate_texture,
			side: DoubleSide,
		} );


		// Create a simple staircase
		let current_x = 5;
		let current_y = 0.5;
		for( let i = 0; i < 4; i++ ) {
			const box = new Mesh( box_geometry, crate_material );
			box.castShadow = true;
			box.position.set( current_x, current_y, 0 );
			SCENE.add( box );
			this.collidables.push( box );
			current_x += 1;
			current_y += 0.9;
		}

		// Create another platform
		let box2_1 = new Mesh( box_geometry, crate_material );
		box2_1.castShadow = true;
		box2_1.position.set( -8, 0.5, 0 );
		SCENE.add( box2_1 );
		this.collidables.push( box2_1 );
		let box2_2 = new Mesh( box_geometry, crate_material );
		box2_2.castShadow = true;
		box2_2.position.set( -9, 1.4, 0 );
		SCENE.add( box2_2 );
		this.collidables.push( box2_2 );
		let box2_3 = new Mesh( box_geometry, crate_material );
		box2_3.castShadow = true;
		box2_3.position.set( -10, 2.3, 0 );
		SCENE.add( box2_3 );
		this.collidables.push( box2_3 );

		// Add a platform between them
		const platform_geometry = new BoxGeometry( 13, 1, 1 );
		const platform = new Mesh( platform_geometry, crate_material );
		platform.castShadow = true;
		platform.position.set( -1, 4, 0 );
		SCENE.add( platform );
		this.collidables.push( platform );

	}

	update(delta) {
		// Animate clouds
		for( const cloud of this.clouds ) {
			cloud.position.x += this.cloud_speed * delta;
			if( cloud.position.x > 60 ) { // Screen boundary, with some buffer
				cloud.position.x = -60;
			}
		}
	}
}

export default Ground;