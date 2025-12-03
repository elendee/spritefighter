import CharacterSprite from './CharacterSprite.js'
import { Vector3, Raycaster } from 'three';

class Character {
	constructor( init ){
		this.sprite = init.sprite || new CharacterSprite();
		init.scene.add( this.sprite.sprite );
		this.collidables = init.collidables || [];

		this.speed = 0.11;
		this.velocity = new Vector3(0, 0, 0);
		this.direction = 1; // 1 for right, -1 for left
		this.jump_velocity = 0.3;
		this.gravity = -0.02;
		this.on_ground = true;

		this.raycaster = new Raycaster();
		this.character_width = this.sprite.width;
		this.character_height = this.sprite.height;
	}

	setState( state, direction ){
		this.sprite.setState( state, direction );

		// don't allow direction to be 0
		if( direction === 1 || direction === -1 ){
			this.direction = direction;
		}

		if (state === 'jumping' && this.on_ground) {
			this.velocity.y = this.jump_velocity;
			this.on_ground = false;
		}

		if( state === 'walking' || (state === 'jumping' && direction) ){
			this.velocity.x = this.speed * this.direction;
		} else { // idle, kicking, or jumping without direction
			this.velocity.x = 0;
		}
	}

	update( delta ){

		// 1. Apply gravity
		if (!this.on_ground) {
			this.velocity.y += this.gravity;
		}

		// 2. Horizontal collision detection
		if( this.velocity.x !== 0 ){
			const origin = this.sprite.sprite.position.clone();
			// Raycast from the center of the character
			origin.y += this.character_height / 2;

			this.raycaster.set( origin, new Vector3( this.direction, 0, 0 ) );
			const intersections = this.raycaster.intersectObjects( this.collidables );

			const collision_dist = this.character_width / 2;

			if( intersections.length > 0 && intersections[0].distance < collision_dist ){
				// Collision detected, revoke the move
				this.velocity.x = 0;
			}
		}

		// 3. Vertical collision detection (to prevent tunnelling)
		const vertical_travel_dist = Math.abs(this.velocity.y);
		const ray_origin_y_offset = 0.2; // Start ray from just above feet
		const ground_ray_origin = this.sprite.sprite.position.clone();
		ground_ray_origin.y += ray_origin_y_offset; 
		
		this.raycaster.set( ground_ray_origin, new Vector3( 0, -1, 0 ) );
		const ground_intersections = this.raycaster.intersectObjects( this.collidables );

		let landed = false;
		if( ground_intersections.length > 0 ){
			const ground_dist = ground_intersections[0].distance;
			// Check if the intersection point is within the path of travel for this frame
			if( ground_dist <= vertical_travel_dist + ray_origin_y_offset && this.velocity.y <= 0 ){
				this.on_ground = true;
				this.velocity.y = 0;
				// Snap the base of the sprite to the intersection point
				this.sprite.sprite.position.y = ground_intersections[0].point.y; 
				landed = true;
			}
		}

		if( !landed ){
			this.on_ground = false;
		}

		// 4. Apply final velocity
		this.sprite.sprite.position.add( this.velocity );
		this.sprite.sprite.position.z = 0; // Lock Z position
		
		// 5. Update sprite animation
		this.sprite.update( delta );
	}

}

export default Character;