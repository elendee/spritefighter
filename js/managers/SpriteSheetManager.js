import env from '../env.js'
import {
	SpriteMaterial,
	TextureLoader,
	SRGBColorSpace,
} from 'three';




class SpriteSheetManager {
	constructor( init ){

		init = init || {}

		this.textureLoader = new TextureLoader();

		this.toon_name = init.toon_name || 'eric'

		this.sprite = init.sprite

		this.init_textures()

	}

	set_frame_count( state ){
		switch( state ){
		case 'walking':
			this.sprite.frame_count = 4
			break;
		case 'jumping':
			this.sprite.frame_count = 4
			break;
		case 'kick_light':
		case 'kick_medium':
		case 'kick_heavy':
		case 'kicking':
		case 'punch_heavy':
		case 'punch_light':
		case 'idle':
			this.sprite.frame_count = 4
			break;
		default:
			console.warn('unknown set-frame-count', state )
			this.sprite.frame_count = 4
			break;
		}
	}

	init_textures(){
		/*
			run this after settin toon
		*/


		this.textures = {
			idle: this.textureLoader.load( env.PUB_ROOT + '/resource/toons/' + this.toon_name + '/idle.png'),
			walking: this.textureLoader.load( env.PUB_ROOT + '/resource/toons/' + this.toon_name + '/walking.png'),
			jumping: this.textureLoader.load( env.PUB_ROOT + '/resource/toons/' + this.toon_name + '/jumping.png'),
			punch_light: this.textureLoader.load( env.PUB_ROOT + '/resource/toons/' + this.toon_name + '/punch_light.png'),
			punch_medium: this.textureLoader.load( env.PUB_ROOT + '/resource/toons/' + this.toon_name + '/punch_medium.png'),
			punch_heavy: this.textureLoader.load( env.PUB_ROOT + '/resource/toons/' + this.toon_name + '/punch_heavy.png'),
			kicking: this.textureLoader.load( env.PUB_ROOT + '/resource/toons/' + this.toon_name + '/kicking.png'),
			kick_medium: this.textureLoader.load( env.PUB_ROOT + '/resource/toons/' + this.toon_name + '/kick_medium.png'),
			kick_heavy: this.textureLoader.load( env.PUB_ROOT + '/resource/toons/' + this.toon_name + '/kick_heavy.png'),
			// kicking: this.textureLoader.load('https://placehold.co/128x256/ffff00/FFFFFF.png?text=kicking'),
		}

		for( const key in this.textures ){
			this.textures[key].colorSpace = SRGBColorSpace; // This is the most common fix!
		}

		this.materials = {
			idle: new SpriteMaterial({ map: this.textures.idle }),
			walking: new SpriteMaterial({ map: this.textures.walking }),
			jumping: new SpriteMaterial({ map: this.textures.jumping }),
			// punching: new SpriteMaterial({ map: this.textures.punching }),
			punch_light: new SpriteMaterial({ map: this.textures.punch_light }),
			punch_medium: new SpriteMaterial({ map: this.textures.punch_medium }),
			punch_heavy: new SpriteMaterial({ map: this.textures.punch_heavy }),
			kicking: new SpriteMaterial({ map: this.textures.kicking }),
			kick_medium: new SpriteMaterial({ map: this.textures.kick_medium }),
			kick_heavy: new SpriteMaterial({ map: this.textures.kick_heavy }),
		}

	}

	get_material( state, frame ){

		return this.materials[ state ] || this.materials.idle;
	}

}



// const SPRITE_SHEET_MANAGER = new SpriteSheetManager();

export default SpriteSheetManager