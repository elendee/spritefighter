import env from './env.js'
import * as lib from './lib.js'
// import CAMERA from './three/CAMERA.js'
// import SCENE from './three/SCENE.js'
// import RENDERER from './three/RENDERER.js'
// import { OrbitControls } from 'OrbitControls';
// import Character from './classes/Character.js';
// import Ground from './classes/Ground.js';
import {
	Modal
} from './Modal.js'
import * as TOONS from './TOONS.js'
import hal from './hal.js'
import KEYBINDS from './KEYBINDS.js';
import fetch_wrap from './fetch_wrap.js'
// import { 
// 	Clock, 
// 	DirectionalLight, 
// 	AmbientLight 
// } from 'three';







const url = env.PUB_ROOT + '/ajax.php'
const content = document.getElementById('content')
const sections = {}






const build_toon_row = args => {
	const {
		name,
		toon,
	} = args

	const wrap = lib.b('div', false, 'toon-row')
	wrap.setAttribute('data-toon', name )

	const game_assets = []
	const other_assets = []

	for( const frame_data of toon ){

		const {
			slug,
			w,
			h,
		} = frame_data

		const frame = lib.b('div', false, 'toon-frame')
		const img = lib.b('img', false, 'frame-img')
		img.src = `${env.PUB_ROOT}/resource/toons/${name}/${slug}`
		frame.append( img )
		const label = lib.b('label')
		label.innerText = slug
		frame.append( label )
		const dims = lib.b('div', false, 'frame-dims')
		dims.innerText = `${w} x ${h} px`
		frame.append( dims )
		const rm = lib.b('div', false, 'button', 'rm')
		rm.innerHTML = '&times;'
		rm.addEventListener('click', remove_frame )
		frame.append( rm )
		wrap.append( frame )

		MAP.set( frame, {
			slug,
			name,
			w,
			h,
		})

		let pushed
		for( const key in KEYBINDS ){
			const {
				action,
			} = KEYBINDS[key]
			if( action == slug.split('.')[0] ){
				frame.classList.add('game-frame')
				pushed = true
				game_assets.push( frame )
				break;
			}
		}

		if( !pushed ) other_assets.push( frame )

	}

	for( const asset of game_assets ){
		wrap.append( asset )
	}

	for( const asset of other_assets ){
		wrap.append( asset )
	}

	return wrap

} // build toon row




const remove_frame = e => {
	const btn = lib.click_parent( e.target, 'button', false, 5 )
	const frame = lib.click_parent( btn, 'toon-frame', false, 5 )
	const {
		name,
		slug,	
	} = MAP.get( frame )

	fetch_wrap( url, 'post', {
		action: 'remove_frame',
		slug,
		name,
		p: localStorage.getItem('sprite-pw')
	})
	.then( res => {
		console.log( res )
		if( !res?.success ) return hal('error', res?.msg || 'error removing toons', 5000 )		

		location.reload()

	})

}


const create_frame = e => {
	const btn = lib.click_parent( e.target, 'button', false, 3 )

	const {
		slug,
		toon,
	} = MAP.get( btn)

	const modal = new Modal({
		type: 'add-frame',
		header: 'add frame to ' + slug,
	})

	const file_input = lib.b('input', false, 'input')
	file_input.type = 'file'
	modal.liner.append( file_input )

	const name_input = lib.b('input', false, 'input')
	name_input.placeholder = 'image slug - ex: kick.png'
	modal.liner.append( name_input )

	const submit = lib.b('div', false, 'button')
	submit.innerText = 'submit'
	submit.addEventListener('click', () => {

		const file = file_input.files[0]
		const name = name_input.value.trim()

		if( !file || !name ) return hal('error', 'file and name required', 3000 )

		const formData = new FormData()
		formData.append('file', file )
		formData.append('name', slug ) // the toon name
		formData.append('slug', name ) // the file name
		formData.append('action', 'upload_frame' )
		formData.append('p', localStorage.getItem('sprite-pw') )

		fetch( url, {
			method: 'POST',
			body: formData
		})
		.then( res => res.json() )
		.then( res => {
			console.log( res )
			if( !res?.success ) return hal('error', res?.msg || 'error uploading', 5000 )
			location.reload()
		})

	})
	modal.liner.append( submit )

	document.body.append( modal.ele )

}

fetch_wrap( url, 'post', {
	action: 'read_toons',
	p: localStorage.getItem('sprite-pw')?.trim()
})
.then( res => {
	console.log( res )
	if( !res?.success ) return hal('error', res?.msg || 'error getting toons', 5000 )
	const {
		toons,
	} = res

	const nav = lib.b('div', 'toon-nav')
	content.append( nav )

	const selected = localStorage.getItem('last-selected')

	for( const slug in toons ){

		const toon = toons[slug]

		// nav button
		const nav_btn = lib.b('div', false, 'button')
		nav_btn.innerText = slug
		nav_btn.addEventListener('click', set_toon )
		nav.append( nav_btn )

		if( slug == selected ){
			setTimeout(() => {
				nav_btn.click()
			}, 200 )
		}

		// create frame button
		const create = lib.b('div', false, 'button', 'create-frame')
		create.innerText = 'add frame'
		create.addEventListener('click', create_frame )

		MAP.set( create, {
			slug,
			toon,
		})

		sections[ slug ] = build_toon_row({
			name: slug,
			toon,
		})

		sections[ slug ].prepend( lib.b('br'))
		sections[ slug ].prepend( lib.b('br'))
		sections[ slug ].prepend( create)
		sections[ slug ].prepend( lib.b('br'))

		content.append( sections[ slug ] )

	}

}) // read toons





const set_toon = e => {
	const btn = lib.click_parent( e.target, 'button', false, 5 )
	const nav = lib.click_parent( btn, false, 'toon-nav', 3 )

	const slug = btn.innerText

	for( const slug in sections ) sections[slug].style.display = 'none'

	const buttons = nav.querySelectorAll('.button')
	for( const b of buttons ) b.classList.remove('selected')

	btn.classList.add('selected')

	localStorage.setItem('last-selected', slug )

	sections[slug].style.display = 'inline-block'

} // set toon


const MAP = new Map()

const toon_crud = e => {

	const btn = lib.click_parent( e.target, 'button', false, 5 )

	const action = btn.getAttribute('data-toon-action')

	const modal = new Modal({
		type: 'make-new',
		header: 'make new',
	})

	const name = lib.b('input', false, 'input')
	name.placeholder = 'toon name'
	modal.content.append( name )

	const save = lib.b('div', false, 'button')
	save.innerText = 'save'
	save.setAttribute('data-action', action )
	save.addEventListener('click', do_toon_crud )
	modal.content.append( save )

	MAP.set( save, {
		action,
		input: name,
	})

	document.body.append( modal.ele )

} // make new toons


const do_toon_crud = e => {
	const btn = lib.click_parent( e.target, 'button', false, 4 )
	const {
		action,
		input,
	} = MAP.get( btn )

	const name = input.value

	fetch_wrap( url, 'post', {
		action,
		name,
		p: localStorage.getItem('sprite-pw')
	})
	.then( res => {
		console.log( res )
		if( !res?.success ) return hal('error', res?.msg || 'error creating', 5000 )
		location.reload()
	})

} // save toon






// make new toon

const big_action = lib.b('div', 'big-action')
const delete_toon =lib.b('div', false, 'button')
delete_toon.innerText = 'delete toon'
delete_toon.addEventListener('click', toon_crud )
delete_toon.setAttribute('data-toon-action', 'delete_toon')
big_action.prepend( delete_toon )
const make_new =lib.b('div', false, 'button')
make_new.innerText = 'make new'
make_new.addEventListener('click', toon_crud )
make_new.setAttribute('data-toon-action', 'create_toon')
big_action.prepend( make_new )
document.body.append( big_action )








const input = lib.b('input', false, 'pw')
input.placeholder = 'pw'
input.addEventListener('keyup', e => {
	if( e.keyCode === 13 ){
		localStorage.setItem('sprite-pw', input.value )
		location.reload()		
	}
})
document.body.prepend( input )