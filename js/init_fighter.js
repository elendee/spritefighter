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






const reset = lib.b('div', 'reset', 'button')
reset.innerText = 'new fighter'
reset.addEventListener('click', () => {
	delete localStorage['toon-name']
	location.reload()
})
document.body.append( reset )

const full_reset = lib.b('div', 'full-reset', 'button')
full_reset.innerText = 'full reset'
full_reset.addEventListener('click', () => {
	delete localStorage['first-load']
	delete localStorage['toon-name']
	location.reload()
})
document.body.append( full_reset )

const instructs = lib.b('div', 'instructs', 'button')
instructs.innerText = 'guide'
instructs.addEventListener('click', () => {
	const modal = new Modal({
		type: 'instructs',
	})

	// here
	const _instructs = lib.b('div')
    let list = '<ul>';
    for(const code in KEYBINDS) {
        const bind = KEYBINDS[code];
        const key_display = code.replace('Key', '').replace('Arrow', '');
        list += `<li>${bind.description}: ${key_display}</li>`;
    }
    list += '</ul>';
	_instructs.innerHTML = list;
	modal.content.append( _instructs )

	document.body.append( modal.ele )
})
document.body.append( instructs )



const TOON_NAME = localStorage.getItem('toon-name')
const RETURN_LOAD = localStorage.getItem('first-load')

function init() {
	const container = document.getElementById('spritefighter');
	RENDERER.shadowMap.enabled = true;
	container.appendChild(RENDERER.domElement);

	const controls = new OrbitControls(CAMERA, RENDERER.domElement);
	controls.minAzimuthAngle = 0; // radians
	controls.maxAzimuthAngle = 0; // radians

	const ground = new Ground();
	window.ground = ground;

	// Add a directional light as a sun
	const sun_light = new DirectionalLight( 0xffffff, 1 ); // White light, full intensity
	sun_light.position.set( 5, 10, 5 ); // From top-right-front
	sun_light.castShadow = true;
	SCENE.add( sun_light );

	// Add an ambient light
	const ambient_light = new AmbientLight( 0xffffff, 0.1 ); // Soft white light, 50% intensity
	SCENE.add( ambient_light );

	if( !TOON_NAME ){

		const modal = new Modal({
			type: 'choose-toon',
			header: 'choose your fighter'
		})

		if( RETURN_LOAD ){

			const select = lib.b('select', false, 'input')

			for( const key in TOONS ){
				const data = TOONS[key]
				const option = lib.b('option')
				option.innerText = data.name
				option.value = key
				select.append( option )
			}

			modal.content.append( select )

			const ok = lib.b('div', false, 'button')
			ok.innerText = 'ok'
			ok.addEventListener('click', () => {
				localStorage.setItem('toon-name', select.value )
				// modal.close.click()
				location.reload()
			})
			modal.content.append( ok )

			// document.body.append( modal.ele )
		}else{

			modal.ele.classList.add('is-fight')

			// const first_load_bg = lib.b('div', false, 'first-load')
			// first_load_bg.style.background = `url(/resource/Title Screen.jpg)`
			// modal.content.append( first_load_bg )

			// const switch_bg = lib.b('div', false, 'button')
			// switch_bg.innerText = 'press start'
			modal.ele.addEventListener('click', () => {
				modal.ele.classList.remove('is-fight')
				localStorage.setItem('first-load', Date.now() )
				location.reload()
			})

			modal.content.remove()

			// modal.content.append( switch_bg )

		}

		document.body.append( modal.ele )
		return;
	}

	hal('success', 'playing as: ' + TOON_NAME, 5000 )

	const player = new Character({
		// TOON_NAME: 
		toon_name: TOON_NAME,
		scene: SCENE,
		collidables: ground.collidables,
	});
	window.player = player;

	const KEYBOARD_STATE = {};
	for(const code in KEYBINDS) {
		KEYBOARD_STATE[KEYBINDS[code].action] = false;
	}

	document.addEventListener('keydown', (event) => {
		const bind = KEYBINDS[event.code];
		if (bind) {
			KEYBOARD_STATE[bind.action] = true;
		}
	});

	document.addEventListener('keyup', (event) => {
		const bind = KEYBINDS[event.code];
		if (bind) {
			KEYBOARD_STATE[bind.action] = false;
		}
	});

	CAMERA.position.z = 3;
	CAMERA.position.y = 2;

	const clock = new Clock();

	function animate() {
		const delta = clock.getDelta();

		requestAnimationFrame(animate);

		// Determine player state from keyboard
		if (KEYBOARD_STATE.jump) {
			player.setState('jumping', player.direction);
		} else if (KEYBOARD_STATE.punch_heavy) {
			player.setState('punch_heavy', player.direction);
		} else if (KEYBOARD_STATE.punch_medium) {
			player.setState('punch_medium', player.direction);
		} else if (KEYBOARD_STATE.punch_light) {
			player.setState('punch_light', player.direction);
		} else if (KEYBOARD_STATE.kick_heavy) {
			player.setState('kick_heavy', player.direction);
		} else if (KEYBOARD_STATE.kick_medium) {
			player.setState('kick_medium', player.direction);
		} else if (KEYBOARD_STATE.kick) {
			player.setState('kicking', player.direction);
		} else if (KEYBOARD_STATE.right) {
			player.setState('walking', 1);
		} else if (KEYBOARD_STATE.left) {
			player.setState('walking', -1);
		} else {
			player.setState('idle', player.direction);
		}

		player.sprite.then = Date.now()

		player.update(delta);
		ground.update(delta);

		// Update controls target and camera position AFTER player updates
		controls.target.copy(player.sprite.sprite.position);
		controls.target.y = ( player.sprite.sprite.position.y / 2 ) + 1
		controls.update();
		CAMERA.position.x = player.sprite.sprite.position.x;
		
		RENDERER.render(SCENE, CAMERA);
	}
	animate();

	player.sprite.width = player.sprite.widths[ 'idle' ]
	player.sprite.scaleToSize()

	player.setState('idling', 1)

}

init();