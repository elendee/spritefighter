import env from './env.js'
import * as lib from './lib.js'
import CAMERA from './three/CAMERA.js'
import SCENE from './three/SCENE.js'
import RENDERER from './three/RENDERER.js'
import { OrbitControls } from 'OrbitControls';
import Character from './classes/Character.js';
import Ground from './classes/Ground.js';
import {
	Modal
} from './Modal.js'
import TOONS from './TOONS.js'
import hal from './hal.js'
import KEYBINDS from './KEYBINDS.js';
import fetch_wrap from './fetch_wrap.js'
import { 
	Clock, 
	DirectionalLight, 
	AmbientLight 
} from 'three';







const url = env.PUB_ROOT + '/ajax.php'



fetch_wrap( url, 'post', {
	p: localStorage.getItem('sprite-pw')?.trim()
})
.then( res => {
	console.log( res )
	if( !res?.success ) return hal('error', res?.msg || 'error getting toons', 5000 )
	const {
		toons,
	} = res
	for( const slug in toons ){
		const toon = toons[slug]

		const row = build_toon_row({
			name: slug,
			toon,
		})

		document.body.append( row )

	}
})


const build_toon_row = args => {
	const {
		name,
		toon,
	} = args

	const wrap = lib.b('div', false, 'toon-row')

	for( const slug of toon ){
		const frame = lib.b('div', false, 'toon-frame')
		const img = lib.b('img', false, 'frame-img')
		img.src = `${env.PUB_ROOT}/resource/toons/${name}/${slug}`
		frame.append( img )
		const label = lib.b('label')
		label.innerText = slug
		frame.append( label )
		wrap.append( frame )
	}

	return wrap

}




const input = lib.b('input', false, 'pw')
input.placeholder = 'pw'
input.addEventListener('keyup', e => {
	if( e.keyCode === 13 ){
		localStorage.setItem('sprite-pw', input.value )
		location.reload()		
	}
})
document.body.append( input )