import SPRITE_SHEET_MANAGER from '../managers/SpriteSheetManager.js';
import { Sprite } from 'three';

class CharacterSprite {
	constructor( init ){
		this.state = 'idle';
		this.frame = 0;
		this.last_frame_update = 0;
		this.direction = 1; // 1 for right, -1 for left
		this.width = 1; // desired width
		this.height = 2; // desired height
		this.material = SPRITE_SHEET_MANAGER.get_material( this.state, this.frame );
		this.sprite = new Sprite( this.material );
		this.sprite.scale.set(this.width, this.height, 1);
		this.sprite.center.set(0.5, 0);

		this.durations = { // frames
			walking: 100,
			jumping: 400,
			idle: 800,
			kicking: 100,
		}

	}

	setState( state, direction ){
		if( this.state === state && this.direction === direction ) return;
		this.state = state;
		if( direction ){
			this.direction = direction;
		}
		this.frame = 0;
		this.sprite.material = SPRITE_SHEET_MANAGER.get_material( this.state, this.frame );
	}

		update( delta ){
			const now = Date.now();
			
			// 1. Update animation frame on a timer
			if( this.state === 'walking' || this.state === 'idle' || this.state === 'jumping' || this.state === 'kicking' ){
				if( now - this.last_frame_update > this.durations[ this.state ] ){
					this.frame = ( this.frame + 1 ) % 3;
					this.last_frame_update = now;
				}
			}

			// 2. Set UVs based on current state (direction and frame) on EVERY frame
			if( this.direction === 1 ){
				this.sprite.material.map.repeat.x = 1 / 3;
				this.sprite.material.map.offset.x = this.frame / 3;
			} else { // direction === -1
				this.sprite.material.map.repeat.x = -1 / 3;
				this.sprite.material.map.offset.x = ( this.frame + 1 ) / 3;
			}
		}

}

export default CharacterSprite;