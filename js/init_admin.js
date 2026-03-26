import env from './env.js'
import * as lib from './lib.js'
import CAMERA from './three/CAMERA.js'
import SCENE from './three/SCENE.js'
import RENDERER from './three/RENDERER.js'
import { OrbitControls } from 'OrbitControls';
import Character from './classes/Character.js';
import Ground from './classes/Ground.js';
import { Clock, DirectionalLight, AmbientLight } from 'three';
import {
	Modal
} from './Modal.js'
import TOONS from './TOONS.js'
import hal from './hal.js'
import KEYBINDS from './KEYBINDS.js';
import fetch_wrap from './fetch_wrap.js'




const url = env.PUB_ROOT + '/ajax.php'
console.log({
	url
})

fetch_wrap( url, 'post', {
	p: localStorage.getItem('sprite-pw')?.trim()
})
.then( res => {
	console.log('toons', res )
})


let setting

const input = lib.b('input', false, 'pw')
input.placeholder = 'pw'
input.addEventListener('keyup', e => {
	if( setting ) return;
	setting = setTimeout(() => {
		localStorage.setItem('sprite-pw', input.value )
		setting = false
	}, 500 )
})
document.body.append( input )