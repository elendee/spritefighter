import env from './env.js'

const alert_contain = document.createElement('div')
alert_contain.id = 'alert-contain'
document.body.append( alert_contain )


function hal( type, msg, time, args ){

	const {
		target_ele,
		float_dist,
	} = args || {}

	let icon = ''

	const alert_wrapper = document.createElement('div')
	alert_wrapper.classList.add('alert-wrapper')
	const alert_msg = document.createElement('div')
	const close = document.createElement('div')

	if( !type ) type = 'standard'

	close.innerHTML = '&times;'
	close.classList.add('alert-close')

	icon = '<div></div>'

	alert_msg.innerHTML = `<div class='alert-icon type-${ type }'>${ icon }</div>${ msg }`
	alert_msg.classList.add('alert-msg', type)
	alert_msg.append( close )
	alert_wrapper.append( alert_msg )

	if( target_ele ){
		const bounds = target_ele.getBoundingClientRect()
		alert_wrapper.classList.add('float-alert')
		document.body.append( alert_wrapper )
		alert_wrapper.style.top = ( bounds.top - 40 ) + 'px'
		alert_wrapper.style.left = bounds.left + 'px'
		alert_wrapper.style.transition = Math.ceil( ( time || 1000 ) / 1000 ) + 's'
		setTimeout(() => {
			alert_wrapper.style.top = ( bounds.top - ( float_dist || 100 ) ) + 'px'
		}, 100 )

		// debugger

	}else{
		alert_contain.append( alert_wrapper )
	}


	close.onclick = function(){
		alert_wrapper.style.opacity = 0
		setTimeout(function(){
			alert_wrapper.remove()
		}, 500)
	}

	if( time ){
		setTimeout(function(){
			alert_wrapper.style.opacity = 0
			setTimeout(function(){
				alert_wrapper.remove()
			}, 500)
		}, time)
	}
	
}

if( env.EXPOSE ){
	window.hal = hal
}

export default hal
