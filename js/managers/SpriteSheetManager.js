import env from '../env.js'
import {
	SpriteMaterial,
	TextureLoader,
} from 'three';

class SpriteSheetManager {
	constructor( init ){

		init = init || {}

		this.textureLoader = new TextureLoader();

		this.toon = init.toon || 'eric'

		this.init_textures()

	}

	init_textures(){
		/*
			run this after settin toon
		*/

		this.textures = {
			idle: this.textureLoader.load( env.PUB_ROOT + '/resource/toons/' + this.toon + '/idle.png'),
			walking: this.textureLoader.load( env.PUB_ROOT + '/resource/toons/' + this.toon + '/walking.png'),
			jumping: this.textureLoader.load( env.PUB_ROOT + '/resource/toons/' + this.toon + '/jumping.png'),
			kicking: this.textureLoader.load( env.PUB_ROOT + '/resource/toons/' + this.toon + '/kicking.png'),
			// kicking: this.textureLoader.load('https://placehold.co/128x256/ffff00/FFFFFF.png?text=kicking'),
		}

		this.materials = {
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
			jumping: [
				new SpriteMaterial({ map: this.textures.jumping.clone() }),
				new SpriteMaterial({ map: this.textures.jumping.clone() }),
				new SpriteMaterial({ map: this.textures.jumping.clone() }),
			],
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

		for( let i = 0; i < 3; i++ ){
			this.materials.jumping[i].map.offset.x = i / 3;
			this.materials.jumping[i].map.repeat.x = 1 / 3;
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