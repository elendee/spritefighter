import env from './env.js'
import fetch_wrap from './fetch_wrap.js'
import * as lib from './lib.js'





const url = env.PUB_ROOT + '/ajax.php'

const _toons = {}




const get_name = slug => {
	let text = ''
	const splits = slug.replace(/_/g, ' ').replace(/-/g, ' ').split(' ')
	for( const s of splits ){
		text += lib.capitalize( s )
	}
	return text
}


const init = async() => {

	let res = await fetch_wrap( url, 'post', {
		action: 'read_toons',
		p: localStorage.getItem('sprite-pw')
	})
	
	if( !res?.success ) return hal('error', res?.msg || 'error reading toons', 15000)
	console.log( res )
	for( const slug in res.toons ){
		const name = get_name( slug )
		_toons[ slug ]= {
			name: get_name( slug ),
			og: slug,
		}
	}

}

const data = _toons

export {
	init,
	data,
}