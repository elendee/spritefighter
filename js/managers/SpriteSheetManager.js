import env from '../env.js'
import {
	SpriteMaterial,
	TextureLoader,
} from 'three';

class SpriteSheetManager {
	constructor( init ){

		this.textureLoader = new TextureLoader();

		this.textures = {
			idle: this.textureLoader.load( env.PUB_ROOT + '/resource/walker.png'),
			// idle: this.textureLoader.load('https://placehold.co/128x256/ff0000/FFFFFF.png?text=idle'),
			// walking: this.textureLoader.load('https://placehold.co/384x256/00ff00/FFFFFF.png?text=walking'),
			walking: this.textureLoader.load( env.PUB_ROOT + '/resource/walker.png'),
			jumping: this.textureLoader.load('https://placehold.co/128x256/0000ff/FFFFFF.png?text=jumping'),
			kicking: this.textureLoader.load('https://placehold.co/128x256/ffff00/FFFFFF.png?text=kicking'),
		}

		this.materials = {
			// idle: new SpriteMaterial({ map: this.textures.idle }),
			idle: [
				new SpriteMaterial({ map: this.textures.idle.clone(), }),
				new SpriteMaterial({ map: this.textures.idle.clone(), }),
				new SpriteMaterial({ map: this.textures.idle.clone(), }),
			],
			walking: [
				new SpriteMaterial({ map: this.textures.walking.clone(), }),
				new SpriteMaterial({ map: this.textures.walking.clone(), }),
				new SpriteMaterial({ map: this.textures.walking.clone(), }),
			],
			jumping: new SpriteMaterial({ map: this.textures.jumping }),
			kicking: new SpriteMaterial({ map: this.textures.kicking }),
		}

		for( let i = 0; i < 3; i++ ){
			this.materials.idle[i].map.offset.x = i / 3;
			this.materials.idle[i].map.repeat.x = 1 / 3;
		}

		for( let i = 0; i < 3; i++ ){
			this.materials.walking[i].map.offset.x = i / 3;
			this.materials.walking[i].map.repeat.x = 1 / 3;
		}

	}

	get_material( state, frame ){
		if( Array.isArray( this.materials[state] )){
			return this.materials[state][frame] || this.materials.idle;
		}
		return this.materials[ state ] || this.materials.idle;
	}

}

const SPRITE_SHEET_MANAGER = new SpriteSheetManager();

export default SPRITE_SHEET_MANAGER;