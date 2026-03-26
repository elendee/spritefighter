// import ui from './ui.js'




let current_fetch



export default async( url, method, body, no_spinner, target_ele, msg, allow_pointer ) => {
	/*
		always expects json !
	*/
	const this_fetch = Math.random()

	// if( !no_spinner ){
	// 	current_fetch = this_fetch
	// 	spinner.show( target_ele, msg, allow_pointer )
	// }

	let res, r 

	if( method.match(/post/i) ){

		res = await fetch( url, {
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify( body )
		})

	}else{

		res = await fetch( url )

	}

	// if( !no_spinner )  
	// if( current_fetch === this_fetch ) spinner.hide()

	r = await res.json()

	return r 

}

