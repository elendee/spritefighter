import * as lib from './lib.js'
import CAMERA from './three/CAMERA.js'
import SCENE from './three/SCENE.js'
import RENDERER from './three/RENDERER.js'
import { OrbitControls } from 'OrbitControls';
import Character from './classes/Character.js';
import Ground from './classes/Ground.js';
import { Clock } from 'three';

function init() {
	const container = document.getElementById('spritefighter');
	container.appendChild(RENDERER.domElement);

	const controls = new OrbitControls(CAMERA, RENDERER.domElement);

	const ground = new Ground();
	window.ground = ground;

	const player = new Character({
		scene: SCENE,
		collidables: ground.collidables,
	});
	window.player = player;

	const KEYBOARD_STATE = {
		left: false,
		right: false,
		jump: false,
		kick: false,
	};

	document.addEventListener('keydown', (event) => {
		switch (event.code) {
			case 'ArrowLeft':
				KEYBOARD_STATE.left = true;
				break;
			case 'ArrowRight':
				KEYBOARD_STATE.right = true;
				break;
			case 'Space':
				KEYBOARD_STATE.jump = true;
				break;
			case 'KeyK':
				KEYBOARD_STATE.kick = true;
				break;
		}
	});

	document.addEventListener('keyup', (event) => {
		switch (event.code) {
			case 'ArrowLeft':
				KEYBOARD_STATE.left = false;
				break;
			case 'ArrowRight':
				KEYBOARD_STATE.right = false;
				break;
			case 'Space':
				KEYBOARD_STATE.jump = false;
				break;
			case 'KeyK':
				KEYBOARD_STATE.kick = false;
				break;
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
			if (KEYBOARD_STATE.right) {
				player.setState('jumping', 1);
			} else if (KEYBOARD_STATE.left) {
				player.setState('jumping', -1);
			} else {
				player.setState('jumping', player.direction);
			}
		} else if (KEYBOARD_STATE.right) {
			player.setState('walking', 1);
		} else if (KEYBOARD_STATE.left) {
			player.setState('walking', -1);
		} else if (KEYBOARD_STATE.kick) {
			player.setState('kicking', player.direction);
		} else {
			player.setState('idle', player.direction);
		}

		player.update(delta);

		// Update controls target and camera position AFTER player updates
		controls.target.copy(player.sprite.sprite.position);
		controls.target.y += 1
		controls.update();
		CAMERA.position.x = player.sprite.sprite.position.x;
		
		RENDERER.render(SCENE, CAMERA);
	}
	animate();
}

init();