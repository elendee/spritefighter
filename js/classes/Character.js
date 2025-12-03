import CharacterSprite from './CharacterSprite.js'
import { Vector3 } from 'three';

class Character {
	constructor( init ){
		this.sprite = init.sprite || new CharacterSprite();
		init.scene.add( this.sprite.sprite );
		this.speed = 0.11;
		this.velocity = new Vector3(0, 0, 0);
		this.direction = 1; // 1 for right, -1 for left
		this.jump_velocity = 0.3;
		this.gravity = -0.02;
		this.on_ground = true;
	}

	setState( state, direction ){
		this.sprite.setState( state, direction );
		if( direction ){
			this.direction = direction;
			// console.log('SET!', {
			// 	state,
			// 	direction,
			// })
		}

		if (state === 'jumping' && this.on_ground) {
			this.velocity.y = this.jump_velocity;
			this.on_ground = false;
		}

		if( state === 'walking' || (state === 'jumping' && direction) ){
			this.velocity.x = this.speed * this.direction;
		} else if( !direction ) {
			this.velocity.x = 0;
		}
	}

	update( delta ){

		// Apply gravity
		if (!this.on_ground) {
			this.velocity.y += this.gravity;
		}

		// Move the character
		this.sprite.sprite.position.add( this.velocity );

		// Check if on the ground
		if (this.sprite.sprite.position.y <= 0) {
			this.sprite.sprite.position.y = 0;
			this.velocity.y = 0;
			this.on_ground = true;
		}
		
		this.sprite.update( delta );
	}

}



export default Character