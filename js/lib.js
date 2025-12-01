import env from './env.js?v=1'
// import fetch_wrap from './fetch_wrap.js?v=1'
// import hal from './hal.js?v=1'








if( env.CALL ) console.log('lib.js')







const second = 1000
const minute = second * 60
const hour = minute * 60
const day = hour * 24
const week = day * 7
const month = day * 30.5
const year = week * 52

const times = {
	second,
	minute,
	hour,
	day,
	week,
	year,
	month,
}




function parse_concat( concat_string ){
	/*
		just a split() that takes care to trim bounding undefined's
	*/
	
	let vals = []
	if( typeof concat_string !== 'string' ) return vals
	if( concat_string.match('-') ){
		vals = concat_string.split('-')
		for( let i = vals.length - 1; i >= 0; i-- ){
			if( !vals[i] ){
				vals.splice( i, 1 )
			}
		}
		return vals
	}else{
		return [concat_string ]
	}
}





const plaintext_html = text => {
	if( typeof text !== 'string' ){
		return text
	}
	return text.replace(/\n/g, '<br>')
}


const user_html = ( msg, params ) => {

	if( typeof msg !== 'string' )  return msg

	params = params || {}

	let res = msg

	if( params.line_breaks ) res = res.replace(/\<br\/?\>/g, '\n')

	if( params.strip_html ) res = res.replace(/(<([^>]+)>)/gi, '')

	if( params.encode ) res = encodeURIComponent( res ) // or encodeURI for less strict encoding
		
	if( params.links ) res = render_all_links( res )

	return res


}


function random_rgb( ...ranges ){ // ( [0,255], [0,255], [0,255] )

	let inc = 0
	let string = 'rgb('

	for( const range of ranges ){

		if( range[1] < range[0] || range[0] < 0 || range[1] > 255 ) return 'rgb( 0, 0, 0 )'

		string += range[0] + Math.floor( Math.random() * ( range[1] - range[0] )) 

		inc < 2 ? string += ',' : true

		inc++

	}

	return string + ')'

}

const random_entry = ( source, range ) => {
	/*
		source: obj or array
		range: { from: n, to: n } ( referenced for arrays only )
	*/

	if( Array.isArray( source ) ){
		if( range ){
			if( typeof range.from !== 'number' || typeof range.to !== 'number' ){
				range.from = 0
				range.to = 1
			}
			range.from = Math.max( 0, range.from )
			range.to = Math.min( range.to, source.length-1 )
			return source[ random_range( range.from, range.to, true ) ]
		}else{
			return source[ random_range( 0, source.length - 1, true ) ]
		}
	}else if( source && typeof source === 'object'){
		return source[ random_entry( Object.keys( source ) ) ]
	}
	return ''
}


const random_range = ( low, high, int ) => {

	if( low >= high ) return low

	let value = low + ( Math.random() * ( high - low ) ) 
	if( int ){
		value = Math.round( value )
	}
	// if( absolute_input ){
	// 	if( Math.random() > .5 ) value *= -1
	// }
	// if( center ){
	// 	value += center
	// }
	return value

}


function random_bar_color( len ){

	let s = ''
	
	for( let i = 0; i < len; i++){
		s += ( 8 + Math.floor( Math.random() * 8 ) ).toString( 16 )
	}
	
	return s

}


const sort_by_column = function( args ){
	const {
		header,
		container,
		buoy_completed_hei,
	} = args

	let row_objects = []

	const rows = container.querySelectorAll('.results-row')

	const { sibs } = siblings( header )
	sibs.forEach( sibling => {
		sibling.classList.remove('active')
		sibling.classList.remove('descending')
		sibling.classList.remove('ascending')
	})

	header.classList.add('active')

	const i = header.getAttribute('data-column-index')

	let order = 1
	if( header.classList.contains('ascending') ){
		header.classList.add('descending')
		header.classList.remove('ascending')
		order = -1
	}else{
		header.classList.add('ascending')
		header.classList.remove('descending')
		order = 1
	}

	if( !i && i !== 0 ){
		console.log('invalid header')
		return false
	}

	const sort_type = header.getAttribute('data-sort')
	
	let column
	if( sort_type === 'timestamp' ){ 

		for( const row of rows ){
			column = row.querySelector('.results-column:nth-of-type(' + i + ')')
			row_objects.push({
				value: column.innerText.trim(),
				date: column.getAttribute('data-date'),
				dom_obj: row,
			})
		}

	}else{ // save 1000 getAttribute calls per click ...

		let value 
		for( const row of rows ){
			column = row.querySelector('.results-column:nth-of-type(' + i + ')')
			if( sort_type === 'active' ){ // partners
				value = column.parentElement.classList.contains('has-courses')
			}else{ // most of them
				value = column ? column.innerText.trim() : ''
			}
			// console.log('value: ', value )
			row_objects.push({
				value: value,
				dom_obj: row,
			})
		}

	}

	container.querySelectorAll('.results-row').forEach( row => {
		row.remove()
	})


	let val1, val2

	// row_objects.forEach((r)=> { console.log( r.value ) } )

	switch( sort_type ){

		case 'alphabetical':
			row_objects.sort(( a, b ) => {
				val1 = a.value.toUpperCase()
				val2 = b.value.toUpperCase()
				if( val1 > val2 ) return 1 * order
				if( val1 < val2 ) return -1 * order
				return 0
			})
			break;

		case 'numerical':
			row_objects.sort(( a, b ) => {
				val1 = Number( a.value ) //.value.toUpperCase()
				val2 = Number( b.value ) //.value.toUpperCase()
				// console.log( a, b )
				if( val1 > val2 ) return 1 * order
				if( val1 < val2 ) return -1 * order
				return 0
			})
			break;

		case 'active': // (partners)
			row_objects.sort(( a, b ) => {
				val1 = Number( a.value ? true : false ) //.value.toUpperCase()
				val2 = Number( b.value ? true : false ) //.value.toUpperCase()
				// console.log( val1, val2 )
				if( val1 > val2 ) return -1 * order
				if( val1 < val2 ) return 1 * order
				return 0
			})
			break;

		case 'timestamp':
			row_objects.sort(( a, b ) => {
				val1 = Number( a.date ) //.value.toUpperCase()
				val2 = Number( b.date ) //.value.toUpperCase()

				if( val1 > val2 ) return 1 * order
				if( val1 < val2 ) return -1 * order
				return 0
			})
			break;

		default: 
			console.log('unhandled sort type')
			break;

	}

	if( buoy_completed_hei ){

		const remainder = []
		row_objects.forEach( row =>{
			if( row.dom_obj.classList.contains('is-complete') ){
				container.append( row.dom_obj )
			}else{
				remainder.push( row )
			}
		})
		for( const row of remainder ){
			container.append( row.dom_obj )
		}

	}else{
		row_objects.forEach( row =>{
			container.append( row.dom_obj )
		})
	}

}


const get_name = data => {
	// console.log('user: ', data )
	const surname = data?.surname || data._surname
	if( data?.name ){
		if( surname ){
			return data.name + ' ' + surname
		}
		return data.name
	}
	return surname || ''
}

const get_full_id = data => {
	const name = get_name( data )
	return ( name || '(no name)' ) + ', '  + ( data?.email || '(no email)' )
}



const number_rows = ( container ) => { 

	for( const ele of container.querySelectorAll('.element-number') ) ele.remove()
	for( const row of container.querySelectorAll('.row') ){
		row.classList.remove('mod-0', 'mod-1', 'mod-2', 'mod-3', 'mod-4')
	}

	const elements = container.querySelectorAll('.row')

	const countables = []
	for( let i = 0; i < elements.length; i++ ){
		if( elements[i].style.display !== 'none') countables.push( elements[i] )
	}

	let number
	for( let i = 0; i < countables.length; i++ ){
		number = document.createElement('div')
		number.classList.add('element-number')
		number.innerHTML = i + 1
		countables[i].appendChild( number )
		countables[i].classList.add('mod-' + ( i % 8 ) )
	}

}


const count_element_words = element => {
	return ( element.value.trim().split(' ')[0] ? element.value.trim().split(' ').length : 0 )
}

const count_quill_words = element_editor => {
	return element_editor.getText().split(' ').length 
}

const show_limit_count = ( wc, element, limit, is_quill ) => {
	// check too many
	// ( is_quill ? count_quill_words( element ) : element.value?.length

	let count
	if( is_quill ){
		count = count_quill_words( element )
	}else{
		if( element.value ){
			count = element.value.trim().split(' ').length
		}else{
			count = 0
		}
	}

	const remaining = limit.max - count 
	wc.innerText = remaining + ' words remaining'
	if( remaining < 0 ){
		wc.classList.add('overboard')
	}else{
		wc.classList.remove('overboard')
		// check not enough
		if( limit.min ){
			const missing = count - limit.min
			if( missing < 0 ){
				wc.classList.add('overboard')
				wc.innerText = (-missing) + ' words missing'
			}else{
				wc.classList.remove('overboard')
			}	
		}
	}
}

const add_word_count = window.awc = ( wrapper, element, limit, quill ) => {

	if( !quill && element.type !== 'text' && !element.nodeName.match(/textarea/i) ){
		return console.log('invalid word_count node: ', element )
	}
	if( typeof limit !== 'object') return console.error('add_word_count takes object limit')

	if( !element.setAttribute ){
		console.log( 'skipping word count here', element )
	}else{
		element.setAttribute('data-word-limit', limit.max )
	}

	const wc = b('div', false, 'word-count')
	wrapper.appendChild( wc )

	let listening

	if( quill ){

		element.root.addEventListener('focus', e => {
			if( limit ){
				wc.innerText = limit.max - ( count_quill_words( element ) ) + ' words remaining'
			}else{
				wc.innerText = count_quill_words( element ) + ' words'
			}
			wc.classList.remove('hidden')
		})

		element.root.addEventListener('blur', e => {
			wc.innerText = ''
			wc.classList.add('hidden')
		})

		element.root.addEventListener('click', e => {
			if( limit ) show_limit_count( wc, element, limit, true )
		})

		element.root.addEventListener('keyup', e => {
			if( limit ){
				wc.innerText = limit.max - ( count_quill_words( element ) ) + ' words remaining'
				if( !listening ){
					listening = setTimeout(() => {

						show_limit_count( wc, element, limit, true )

						clearTimeout( listening )
						listening = false
					}, 1000 )
				}
			}else{
				wc.innerText = count_quill_words( element ) + ' words'
			}
		})

	}else{

		element.addEventListener('focus', e => {
			// if( limit && limit.block_empty && !element.value ){
			// 	wc.innerText = 'element cannot be empty'
			// 	wc.classList.add('overboard')
			// }else 
			if( limit ){
				// console.log( limit )
				show_limit_count( wc, element, limit, false )
				// wc.innerText = limit.max - ( count_element_words( element ) ) + ' words remaining'
			}else{
				wc.innerText = count_element_words( element ) + ' words'
			}
			wc.classList.remove('hidden')
		})

		element.addEventListener('blur', e => {
			wc.innerText = ''
			wc.classList.add('hidden')
		})

		element.addEventListener('keyup', e => {

			if( !listening ){

				listening = setTimeout(() => {
					// console.log( limit, element.value )

					if( limit && limit.block_empty && !element.value ){

						wc.innerText = 'element cannot be empty'
						wc.classList.add('overboard')

					}else if( limit ){

						show_limit_count( wc, element, limit, false )
						// const remaining = limit.max - ( count_element_words( element ) )
						// wc.innerText = remaining + ' words remaining'
						// if( remaining < 0 ){
						// 	wc.classList.add('overboard')
						// }else{
						// 	wc.classList.remove('overboard')
						// }
					}else{

						wc.innerText = count_element_words( element ) + ' words'

					}

					clearTimeout( listening )
					listening = false

				}, 500 )
			}
		})

	}

			// if( limit ){
			// 	if( !listening ){
			// 		listening = setTimeout(() => {
			// 			const remaining = limit.max - ( count_element_words( element ) )
			// 			wc.innerText = remaining + ' words remaining'
			// 			if( remaining < 0 ){
			// 				wc.classList.add('overboard')
			// 			}else{
			// 				wc.classList.remove('overboard')
			// 			}
			// 			clearTimeout( listening )
			// 			listening = false
			// 		}, 1000 )
			// 	}
			// }else{
			// 	wc.innerText = count_element_words( element ) + ' words'
			// }
			// // if( limit.block_empty && !element.value ){
			// // 	wc.innerText
			// // }
		// })
	// })



}



const render_link = text => {
	// Regular expression to match URLs
	// var urlRegex = /(https?:\/\/[^\s]+)/g;
	var urlRegex = /((?:https?:\/\/|www\.)[^\s]+)/g;

	// Replace URLs with anchor tags
	var replacedText = text.replace(urlRegex, function(url) {
		// Remove query strings from the URL
		var urlWithoutQuery = url.split('?')[0];
		if( urlWithoutQuery.match(/^www/)){
			urlWithoutQuery = `http://${urlWithoutQuery}` // allow it to sort its own https
		}
		// Create the anchor tag with the shortened visible text
		return '<a target="_blank" href="' + urlWithoutQuery + '">' + urlWithoutQuery + '</a>';
	});
	return replacedText;
}




// const render_link = data => {

// 	let value = String( data )

// 	// const exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
// 	// const exp = /^(http\:\/\/|https\:\/\/)?([a-z0-9][a-z0-9\-]*\.)+[a-z0-9][a-z0-9\-]{2,5}\/?.*/ig;
// 	const exp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/ig
// 	const match = value.match( exp )
// 	if( match ){
// 		// console.log('matched: ', value )
// 		if( !value.match(/^https?:\/\//i) ) value = 'http://' + value
// 		let split
// 		if( value.match(/\n/) ){
// 			console.log('spitting link around newline...', value )
// 			split = value.split(/\n/)
// 			value = split[0]
// 		}

// 		value = value.replace( exp, '<a href="' + value + '" target="_blank" rel="nofollow">' + value + '</a>' )

// 		// add back 
// 		if( split ){
// 			console.log('rejoining link around newline')
// 			value = value + '\n' + split[1]
// 		}

// 		// console.log('done link...', value )

// 	}else{
// 		// console.log('did not match: ', value )
// 		// value = value
// 	}

// 	return value
// }




const render_all_links = data => {

	const words = data.split(' ')
	const new_words = []

	for( const word of words ){
		new_words.push( render_link( word ) )
	}

	return new_words.join(' ')

}



const blank_option = () => {
	const option = document.createElement('option')
	option.value = ''
	option.innerText = '(empty)'
	// option.setAttribute('selected' )
	option.setAttribute('selected', true)
	return option
}


const editor_templates = ['single', 'double', 'double_header', 'full', 'stacked']



const output = window.output = ( content, element, classes ) => {
	/*
		this function is the clientside mirror of server IndexEntry.output()
		must be kept updated to match
	*/

	// console.log( 'output', content, element, classes )

	let c = ''

	if( content ){
		if( typeof content !== 'string' ){
			console.log('badly formatted IndexEntry', this )
			return 'zzz'
		}
		const split = content.split('&amp;&amp;&amp;')
		if( split.length === 1 ){
			c = split[0]
		}else{
			if( element ){
				if( element === 'br' ){
					if( classes ){
						console.log('plaintext elements shouldnt have classes', this )
					}
					for( const entry of split ){
						c += `${ entry }<${ element }>`
					}						
				}else{
					for( const entry of split ){
						if( classes ){
							c += `<${ element } class='${ classes }'>${ entry }</${ element }>`
						}else{
							c += `<${ element }>${ entry }</${ element }>`
						}
					}						
				}
			}else{ // no element
				element = 'br'
				for( const entry of split ){
					c += `${ entry }<${ element }>`
				}
			}
		}
	}

	return c

}




const toolbarOptions = [
	{'align': [
		false,
		'center',
		'right',
	]},
	'bold', 
	'italic', 
	'underline', 
	'strike', 
	// false,
	// {'header': '1'},
	// {'header': '2'},
	{
		'header': [1,2,3,4,]
	},
	{'list': 'bullet'}, // ordered
	{'color': [
		"#000000", 
		"#e60000", 
		"#ff9900", 
		"#ffff00", 
		"#008a00", 
		"#0066cc", 
		"#9933ff", 
		"#ffffff", 
		"#facccc", 
		"#ffebcc", 
		"#ffffcc", 
		"#cce8cc", 
		"#cce0f5", 
		"#ebd6ff", 
		"#bbbbbb", 
		"#f06666", 
		"#ffc266", 
		"#ffff66", 
		"#66b966", 
		"#66a3e0", 
		"#c285ff", 
		"#888888", 
		"#a10000", 
		"#b26b00", 
		"#b2b200", 
		"#006100", 
		"#0047b2", 
		"#6b24b2", 
		"#444444", 
		"#5c0000", 
		"#663d00", 
		"#666600", 
		"#003700", 
		"#002966", 
		"#3d1466", 
		// 'custom-color',
		false,
	]},
	{'background': [
		"#000000", 
		"#e60000", 
		"#ff9900", 
		"#ffff00", 
		"#008a00", 
		"#0066cc", 
		"#9933ff", 
		"#ffffff", 
		"#facccc", 
		"#ffebcc", 
		"#ffffcc", 
		"#cce8cc", 
		"#cce0f5", 
		"#ebd6ff", 
		"#bbbbbb", 
		"#f06666", 
		"#ffc266", 
		"#ffff66", 
		"#66b966", 
		"#66a3e0", 
		"#c285ff", 
		"#888888", 
		"#a10000", 
		"#b26b00", 
		"#b2b200", 
		"#006100", 
		"#0047b2", 
		"#6b24b2", 
		"#444444", 
		"#5c0000", 
		"#663d00", 
		"#666600", 
		"#003700", 
		"#002966", 
		"#3d1466", 
		// 'custom-color',
		false,
	]},
	// false,
	'link',
	'image',
]




const orgOptions = [
	{'align': [
		false,
		'center',
		'right',
	]},
	'bold', 
	'italic', 
	'underline', 
	'strike', 
	false,
	{'header': '1'},
	{'header': '2'},
	{'list': 'bullet'}, // ordered
	{'color': [
		"#000000", 
		"#e60000", 
		"#ff9900", 
		"#ffff00", 
		"#008a00", 
		"#0066cc", 
		"#9933ff", 
		"#ffffff", 
		"#facccc", 
		"#ffebcc", 
		"#ffffcc", 
		"#cce8cc", 
		"#cce0f5", 
		"#ebd6ff", 
		"#bbbbbb", 
		"#f06666", 
		"#ffc266", 
		"#ffff66", 
		"#66b966", 
		"#66a3e0", 
		"#c285ff", 
		"#888888", 
		"#a10000", 
		"#b26b00", 
		"#b2b200", 
		"#006100", 
		"#0047b2", 
		"#6b24b2", 
		"#444444", 
		"#5c0000", 
		"#663d00", 
		"#666600", 
		"#003700", 
		"#002966", 
		"#3d1466", 
		// 'custom-color',
		false,
	]},
	{'background': [
		"#000000", 
		"#e60000", 
		"#ff9900", 
		"#ffff00", 
		"#008a00", 
		"#0066cc", 
		"#9933ff", 
		"#ffffff", 
		"#facccc", 
		"#ffebcc", 
		"#ffffcc", 
		"#cce8cc", 
		"#cce0f5", 
		"#ebd6ff", 
		"#bbbbbb", 
		"#f06666", 
		"#ffc266", 
		"#ffff66", 
		"#66b966", 
		"#66a3e0", 
		"#c285ff", 
		"#888888", 
		"#a10000", 
		"#b26b00", 
		"#b2b200", 
		"#006100", 
		"#0047b2", 
		"#6b24b2", 
		"#444444", 
		"#5c0000", 
		"#663d00", 
		"#666600", 
		"#003700", 
		"#002966", 
		"#3d1466", 
		// 'custom-color',
		false,
	]},
	false,
	'link',
	'image',
]



const make_handle = ( name, surname, full ) => {
	if( full ){
		return `${ name }${ surname ? ' ' + surname : '' }`
	}else{
		return `${ name }${ surname ? ' ' + surname.substr(0,1) + '.' : '' }`
	}
}


const random_hex = ( len ) => {
	let s = ''
	for( let i = 0; i < len; i++){
		s += Math.floor( Math.random() * 16 ).toString( 16 )
	}
	return s
}

const abbreviate = ( string, limit, type ) => {
	// abbrev by word

	switch( type ){

	case 'char':
		// console.error('unhandled abbrev by char')
		if( limit && string.length > limit ){
			return string.substr(0, limit) + '...'
		}
		return string

	case 'word':
		// ( yes purposeful fall-through ) -
		
	default:
		const split = string.trim().split(' ')
		let trimmed
		if( string.trim().split(' ').length <= limit ){
			trimmed = string
		}else{
			trimmed = split.splice(0, limit).join(' ') + '...'
		}
		return {
			original: string,
			trimmed: trimmed,
			overflow: split.join(' '),
		}
	}

}



const get_query_values = () => {
	const urlSearchParams = new URLSearchParams(window.location.search);
	const params = Object.fromEntries(urlSearchParams.entries());
	return params
}




const make_debounce = ( fn, time, immediate, ...args ) => {
    let buffer
    return ( a, b ) => {
        if( buffer ) return;
        if( immediate ) fn(...args) // !buffer &&
        // clearTimeout( buffer )
        buffer = setTimeout(() => {
            fn( a, b, ...args)
            clearTimeout( buffer )
            buffer = false
        }, time )
    }
}




const sleep = async( ms ) => {
	return await new Promise( resolve => { 
		setTimeout( resolve, ms ) 
	})
}




const b = ( type, id, ...classes ) => {
	const ele = document.createElement( type || 'div' )
	if( id ) ele.id = id
	if( classes.length ){
		for( const c of classes ){
			ele.classList.add( c )
		}
	}
	return ele
}

function validate_number( ...vals ){
	/*
		remember to provide a default final value
	*/

	for( const num of vals ){
		if( 
			( typeof num === 'number' && !isNaN( num ) ) || 
			( num && typeof Number( num ) === 'number' && !isNaN( num ) ) 
			){
            return Number( num )
        }
	}
	return vals[ vals.length - 1 ]

}




const click_parent = ( start_ele, target_class, target_id, depth ) => {

	if( target_class && start_ele.classList.contains( target_class )){
		return start_ele
	}else if( target_id && start_ele.id === target_id ){
		return start_ele
	}

	let condition
	for( let i = 0; i< depth; i++ ){
		if( !start_ele.parentElement ) return; //console.log('click parent found no parent matching: ', target_class, target_id )
		condition = false
		if( target_class ){
			condition = start_ele.parentElement?.classList.contains( target_class )
		}else if( target_id ){
			condition = start_ele.parentElement?.id === target_id
		}
		if( condition ){
			return start_ele.parentElement
		}else{
			start_ele = start_ele.parentElement
		}
	}

}


const get_ele_parents = ele => {

	const parents = []
	let parentNode = ele
	let c = 0
	while( parentNode && c < 1000 ){
		c++
		parents.push( parentNode )
		parentNode = parentNode.parentElement
	}
	return parents

}





function capitalize( input ){

	if( typeof input !== 'string' ) return undefined

	return input.charAt(0).toUpperCase() + input.slice(1);

}





const unique_array = array => {
	if( !Array.isArray( array )) return []
	return Array.from( new Set( array ) )
}

// const toUnique = (value, index, array) => {
// 	return array.indexOf(value) === index;
// }


const get_page_name = () => {
	const path = location.pathname
	const split = ( path || '' ).split('/')
	return split[ split.length - 1 ]
}

const is_number = value => {
	const coercedValue = Number(value);
	return typeof coercedValue === 'number' && !isNaN(coercedValue) && !isNaN(parseFloat(value));
};



function date_to_datepicker(date) {
	if( !date?.getFullYear ){
		console.error('invalid date value', date )
		return date_to_datepicker( new Date() )
	}
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
}

function datepicker_to_date( value ) {
	if( !value.match(/-/g)?.length === 2 ){
		console.error('invalid datepicker value', value )
		return new Date()
	}
	const [year, month, day] = value.split('-');
	const date = new Date(year, month - 1, day);
	return date
}






const make_dropdown = config => {
	const {
		input, // must always be plain input / text input
		drop_query,	// any async function, must return [{ text, value }]
		buffer, // [ optional ]
		immediate, // [ optional ]
	} = config

	const choose = e => {
		const choice = e.target
		const value = choice.getAttribute('data-value')
		const text = choice.innerText
		input.value = text
		input.setAttribute('data-value', value )
		const choices = document.querySelector('.drop-choices')
		if( choices ) choices.remove()
	}

	const show_results = async() => {

		const results = await drop_query()

		const ex_choices = document.querySelectorAll('.drop-choices')
		if( ex_choices?.length ){
			window.removeEventListener('click', clear_choices )
			for( const c of ex_choices ) c.remove()
		}

		if( !results?.length ) return hal('error', 'no results', 3000 )

		const choices = b('div', false, 'drop-choices')
		for( const r of results || [] ){
			const choice = b('div', false, 'choice')
			choice.innerText = r.text
			choice.setAttribute('data-value', r.value )
			choices.append( choice )
			choice.addEventListener('click', choose )
		}
		const bounds = input.getBoundingClientRect()
		choices.style.top = ( bounds.top + bounds.height ) + 'px'
		choices.style.left = bounds.left + 'px'

		choices.style['max-height'] = ( window.innerHeight - ( bounds.top + 50 ) ) + 'px'

		document.body.append( choices )

		window.addEventListener('click', clear_choices )
	}

	const debounced_show_results = make_debounce( show_results, ( buffer || 500 ), immediate, {} )

	input.addEventListener('keyup', debounced_show_results )

}


const clear_choices = e => {
	const choices = document.querySelectorAll('.drop-choices')
	// is choice
	const choice = click_parent( e.target, 'choice', false, 5 )
	if( choice ){
		if( choices?.length ){
			for( const c of choices ) c.remove()
		}
	}else{
		// just missed drop
		const in_drop = click_parent( e.target, 'drop-choices', false, 5 )
		if( in_drop )return; // ok		
	}
	// somewhere else
	if( choices?.length ){
		for( const c of choices ) c.remove()
	}
	window.removeEventListener('click', clear_choices )
}


const date_days = ms => {
	return new Date( ms ).toLocaleString().split(',')[0]
}
const date_seconds = ms => {
	return new Date( ms ).toLocaleString().split(',')[1]
}


const get_attribute_name = value =>{
	const regex = /[^a-z0-9]+/gi;
	return value.toLowerCase().replace(/ /g, ' ').replace( regex, '-').replace(/^[^a-z0-9]/, '').replace(/[^a-z0-9]$/, '')
}


const make_folder = ( ...sections ) => {

	const returnpack = {
		wrap: false,
		tabs: {},
		contents: {}
	}

	const wrap = b('div', false, 'coil-folder')
	returnpack.wrap = wrap
	const nav = b('div', false, 'coil-folder-nav')
	wrap.append( nav )
	const content = b('div', false, 'coil-folder-container')
	wrap.append( content )

	for( const name of sections ){
		const slug_name = get_attribute_name( name )
		const tab = b('div', false, 'coil-tab', 'coil-button', 'tab-' + slug_name )
		tab.setAttribute('data-name', slug_name )
		tab.innerText = name
		tab.addEventListener('click', set_tab )
		nav.append( tab )
		returnpack.tabs[slug_name] = tab
		const c = b('div', false, 'coil-folder-contents', 'contents-' + slug_name )
		content.append( c )
		returnpack.contents[slug_name] = c
	}
	return returnpack
}

const set_tab = e => {
	const tab = e.target
	const name = tab.getAttribute('data-name')
	const nav = tab.parentElement
	const folder = nav.parentElement
	const content = folder.querySelector('.contents-' + name )
	// css update contents
	for( const c of folder.querySelectorAll('.coil-folder-contents') ){
		if( c.parentElement.parentElement !== folder ){
			// dont affect child folders
			continue
		}
		if( c === content ){
			c.classList.add('selected')
		}else{
			c.classList.remove('selected')
		}
	}
	// css update tabs
	for( const t of nav.querySelectorAll('.coil-tab')){
		if( tab === t ){
			t.classList.add('selected')
		}else{
			t.classList.remove('selected')
		}
	}
	// set child tab active if none
	const active_child = content.querySelector('.coil-tab.selected')
	if( !active_child ){
		const tab = content.querySelector('.coil-tab')
		if( tab ) tab.click()
	}
}




const pie_bg_colors = [
	'rgb(100, 200, 100)',
	'rgb(200, 200, 100)',
	'rgb(100, 200, 200)',
	'rgb(200, 200, 200)',
]


const auto_date = ( value, _part ) => {
	const elapsed = Math.abs( Date.now() - value )
	let part = typeof _part === 'number' ? _part : ( elapsed < day ? 1 : 0 )
	return new Date( value ).toLocaleString().split(',')[part]
}


const get_ping = async( args ) => {
	const {
		duration,
		count,
	} = args

	if( typeof count !== 'number' || typeof duration !== 'number' ) console.error('invalid args get-ping', args )

	const ping = await new Promise((resolve, reject) => {

		const stagger = duration / count
		let received = []
		let ping
		for( let i = 0; i < count; i++ ){
			setTimeout(() => {
				let then = Date.now()
				let elapsed
				fetch_wrap('/ping', 'post', {}, true )
				.then( res => {
					if( !res.success ){
						elapsed = 9999
						console.error('inavlid ping response', res )
					}
					elapsed = Date.now() - then
					received.push( elapsed )
					ping = check_pings( received, count )
					if( typeof ping === 'number' ) resolve( ping )
				})
				.catch( err => {
					console.error('err ping', err )
					// elapsed = Date.now() - then
					received.push( 9999 )
					ping = check_pings( received, count )
					if( typeof ping === 'number' ) resolve( ping )
				})
			}, stagger * i )
		}

	})

	return ping

}


function isInViewport( element, args ) {
	const {
		ease_top,
		ease_bot,
		ease_left,
		ease_right,
		ease_vert,
		ease_horiz,
		ease_all,
	} = args || {}

	const bound_left = ease_left || ease_horiz || ease_all || 0
	const bound_right = ease_right || ease_horiz || ease_all || 0
	const bound_top = ease_top || ease_vert || ease_all || 0
	const bound_bot = ease_bot || ease_vert || ease_all || 0


    const rect = element.getBoundingClientRect();
    const in_view = (
        rect.top >= -bound_top &&
        rect.left >= -bound_left &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + bound_bot &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) + bound_right
    )
    return in_view ;
}


function scry( x, old_min, old_max, new_min, new_max ){

	const first_ratio = ( x - old_min ) / ( old_max - old_min )
	const result = ( first_ratio * ( new_max - new_min ) ) + new_min
	return result
}




let diffX, diffY, dragTarget, dragBounds
let lastX, lastY
let memX, memY
let dragging_storage_key
let DRAG_ELE
const move_draggable = e => {
	if( e.target.nodeName === 'INPUT' ) return
	diffX = e.clientX - lastX
	diffY = e.clientY - lastY

	const l = Number( dragTarget.style.left.replace('px', '') || 0 )
	const t = Number( dragTarget.style.top.replace('px', '') || 0 )

	dragTarget.style.left = ( l + diffX ) + 'px'
	// dragTarget.style.right = ( window.innerWidth - ( l + diffX ) - dragBounds.width ) + 'px'
	dragTarget.style.top = ( t + diffY ) + 'px'

	lastX = e.clientX
	lastY = e.clientY

	if( DRAG_ELE ) DRAG_ELE.classList.add('is-dragging')

	debounced_set_drag_position()

}
const set_drag_position = () => {
	if( !dragging_storage_key ) return;
	localStorage.setItem( dragging_storage_key, JSON.stringify({
		left: dragTarget.style.left,
		top: dragTarget.style.top,
	}))
}
const debounced_set_drag_position = make_debounce( set_drag_position, 500, false, {})
const remove_draggable = e => {
	window.removeEventListener('mousemove', move_draggable )
	window.removeEventListener('mouseup', remove_draggable )
	if( DRAG_ELE ){
		const buffer_ele = DRAG_ELE
		setTimeout(() => {
			// because 'click' event fires AFTER mouseup, it needs this class to still be there
			buffer_ele.classList.remove('is-dragging')
		}, 10 )
		DRAG_ELE  = false
	}
}
const make_draggable = ( ele, storage_key ) => {

	const icon = b('div', false, 'no-select', 'drag-icon')
	icon.innerHTML = `<img ondragstart='return false;' src='/resource/icons/drag.png'>`
	ele.append( icon )

	ele.addEventListener('mousedown', e => {
		if( e.ctrlKey || e.button == 2 ) return;
		// console.log( e )
		if( storage_key ) dragging_storage_key = storage_key

		dragTarget = ele
		dragBounds = ele.getBoundingClientRect()
		lastX = memX = e.clientX
		lastY = memY = e.clientY

		DRAG_ELE = ele

		// memX = e.clientX
		// memY = e.clientY
		window.addEventListener('mousemove', move_draggable )
		window.addEventListener('mouseup', remove_draggable )
	})
}


const get_string_size = value => {
    // Convert the string to bytes
    const bytes = new Blob([value]).size;
    // Convert bytes to megabytes
    const megabytes = bytes / (1024 * 1024);
    return megabytes;
}

const time_24 = value => { // window.time_24 =
	try{
		const first = new Date( value ).toLocaleString()
		const am = first.match(/am/i) ? 'am' : 'pm'
		const split = first.split(',')[1].split(':')
		return split[0] + ':' + split[1] + am
	}catch( err ){
		console.error({
			err,
			value,
		})
	}
}

const full_time_no_seconds = value => {
	const date = new Date( value )
	const string = date.toLocaleString()
	const replaced = string.replace(/:00 (A|P)/, '$1').toLowerCase()
	// console.log({
		// string,
		// replaced,
	// })
	return replaced
}


function insertAfter(newElement, referenceElement) {
    const parentElement = referenceElement.parentNode;
    // If the reference element is the last child, append the new element
    if (referenceElement === parentElement.lastChild) {
        parentElement.appendChild(newElement);
    } else {
        parentElement.insertBefore(newElement, referenceElement.nextSibling);
    }
}


let last_check_click

const add_contiguous_checks = args => {
	const {
		container,
		selector,
	} = args

	if( selector ){
		container.setAttribute('data-selector', selector )
	}

	container.classList.add('contig-click-container')

	container.addEventListener('click', click_contig_check )

}

const click_contig_check = e => {

	const input = e.target

	const container = click_parent( input, 'contig-click-container', false, 5 )

	const selector = container.getAttribute('data-selector')

	const all_inputs = Array.from( container.querySelectorAll( selector || 'input[type=checkbox]') )

	if( e.shiftKey && ( last_check_click && last_check_click !== input ) ){

		const origin_index = all_inputs.indexOf( last_check_click )

		const new_index = all_inputs.indexOf( input )

		const low = Math.min( origin_index, new_index )
		const high = Math.max( origin_index, new_index )

		const _checked = input.checked

		for( let c = 0; c < all_inputs.length; c++ ){
			if( c > low & c < high ){
				all_inputs[c].checked = _checked
			}
		}

		last_check_click = _checked
		
	}else{

		e.checked = !e.checked

	}

	last_check_click = input

}


const adjust_color = args => {
	const {
		alter,
		_color
	} = args || {}

	const _alter = alter || 3

	if( _color && _color.length === 7 ){
 	    const adjusted_color = '#' + _color.substring(1).split('').map(c => {
 	        return Math.min(15, parseInt(c, 16) + _alter).toString(16)
 	    }).join('')
 	    return adjusted_color
 	} 

 	return _color

}


export {
	parse_concat,
	user_html,
	random_bar_color,
	sort_by_column,
	get_name,
	get_full_id,
	number_rows,
	add_word_count,
	render_link,
	render_all_links,
	blank_option,
	count_element_words,
	editor_templates,
	plaintext_html,
	// output,
	toolbarOptions,
	orgOptions,
	output,
	
	random_hex,
	random_rgb,

	make_handle,
	abbreviate,
	get_query_values,

	make_debounce,
	sleep,
	b,
	validate_number,

	click_parent,
	get_ele_parents,
	capitalize,

	// prompt_new_owner,
	get_page_name,

	// toUnique,
	unique_array,
	is_number,
	date_to_datepicker,
	datepicker_to_date,
	make_dropdown,
	// make_dropper,
	date_days,
	date_seconds,
	make_folder,
	get_attribute_name,
	pie_bg_colors,
	auto_date,
	get_ping,
	isInViewport,
	scry,
	make_draggable,
	times,
	get_string_size,
	time_24,
	full_time_no_seconds,
	random_entry,
	random_range,
	insertAfter,
	add_contiguous_checks,
	adjust_color,
}