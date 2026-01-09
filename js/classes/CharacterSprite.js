import SpriteSheetManager from '../managers/SpriteSheetManager.js';
import { Sprite } from 'three';




const step_actions = [
	'walking',
	'idle',
	'jumping',
	// 'punching',
	'punch_light',
	'punch_medium',
	'punch_heavy',
	// 'kick_light',
	'kicking',
	'kick_medium',
	'kick_heavy'
]



class CharacterSprite {

	constructor( init ){
		this.state = 'idle';
		this.frame = 0;
		this.last_frame_update = 0;
		this.direction = 1; // 1 for right, -1 for left
		this.width = .75; // desired width
		this.height = 2; // desired height
		this.character = init.character // circ ref

		this.toon_name = init.toon_name

		this.SPRITE_SHEET_MANAGER = new SpriteSheetManager({
			toon_name: init.toon_name || 'eric',
			sprite: this,
		})

		this.material = this.SPRITE_SHEET_MANAGER.get_material( this.state, this.frame );
		this.sprite = new Sprite( this.material );

		this.durations = { // frames
			punch_light: 200,
			punch_medium: 200,
			punch_heavy: 200,
			punching: 200,
			kicking: 100,
			kick_medium: 200,
			kick_heavy: 300,
			jumping: 400,
			idle: 800,
			walking: 200,
		}

		this.widths = {
			punch_light: 1.25,
			punch_medium: 1.25,
			punch_heavy: 1.25,
			kicking: 1.5,
			kick_medium: 1.75,
			kick_heavy: 2,
			jumping: .75,
			idle: .75,
			walking: .75,
		}

		this.frame_count = 4 // update with state
		this.frame_duration = 300

	}

	scaleToSize(){
		this.sprite.scale.set( this.width, this.height, 1 );
		this.sprite.center.set( 0.5, 0 );
	}

	setState( state, direction ){
		if( this.state === state && this.direction === direction ){
			return;
		}
		this.state = state;
		if( direction ){
			this.direction = direction;
		}
		this.frame = 0;
		this.sprite.material = this.SPRITE_SHEET_MANAGER.get_material( this.state, this.frame );

		this.SPRITE_SHEET_MANAGER.set_frame_count( this.state )

		console.log('set-state', {
			state,
		})

		this.width = this.widths[ state ] * this.height

		this.character.character_width = this.sprite.width;
		this.character.character_height = this.sprite.height;

		this.scaleToSize()
	}

	update( delta ){

		const now = Date.now();

		// 1. Update animation frame on a timer
		if( step_actions.includes( this.state ) ){
			if( now - this.last_frame_update > this.durations[ this.state ] ){
				this.frame = ( this.frame + 1 ) % this.frame_count;
				this.last_frame_update = now;
			}

			// if( this.direction === 1 ){
			// 	this.sprite.material.map.repeat.x = 1 / this.frame_count;
			// 	this.sprite.material.map.offset.x = this.frame / this.frame_count;
			// } else { // direction === -1
			// 	this.sprite.material.map.repeat.x = -1 / this.frame_count;
			// 	this.sprite.material.map.offset.x = ( this.frame + 1 ) / this.frame_count;
			// }

		}

		// 2. Set UVs based on current state (direction and frame) on EVERY frame
		if( this.direction === 1 ){
			this.sprite.material.map.repeat.x = 1 / this.frame_count;
			this.sprite.material.map.offset.x = this.frame / this.frame_count;
		} else { // direction === -1
			this.sprite.material.map.repeat.x = -1 / this.frame_count;
			this.sprite.material.map.offset.x = ( this.frame + 1 ) / this.frame_count;
		}

	}

}

export default CharacterSprite;