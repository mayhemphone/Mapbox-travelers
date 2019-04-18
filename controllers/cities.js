require('dotenv').config()

let express = require('express')
let router = express.Router()
let mbClient= require('@mapbox/mapbox-sdk')
let mbGeocode = require('@mapbox/mapbox-sdk/services/geocoding')
let db = require('../models')
// Give mapbox our key
const mapboxKey = process.env.MAPBOX_KEY
const mb = mbClient({accessToken: mapboxKey})
const geocode = mbGeocode(mb)

// GETS

router.get('/results', (req,res)=>{
	if (req.query.name) {
		console.log(req.query.name)

		// TODO forward Geocode with req.query.name and req.query.state
		geocode.forwardGeocode({
			query: req.query.name + ', ' + req.query.state,
			types:['place'],
			countries: ['us']
		}).send()
			.then(response=> {
				let results = response.body.features.map(city=>{
					let placeNameArray = city.place_name.split(', ')
					return {
						name: placeNameArray[0],
						state: placeNameArray[1],
						lat: city.center[1],
						long: city.center[0],
					}
				})
				res.render('cities/results', {results})

			})
			.catch((err) => {
			    console.log('Error in POST /reviews', err)
			    res.render('404')
			  })
	}else{
		// res.send('no results sent')
	}
})

router.get('/search', (req,res)=>{
	res.render('cities/search')
})

router.get('/cities/faves', (req, res)=>{
	//TODO call database and get all da faves
	db.city.findAll()
	.then(faves=>{
		res.render('cities/faves', {faves})
	})
	.catch((err) => {
	    console.log('Error in POST /reviews', err)
	    res.render('main/404')
	})
})

// POSTS
router.post('/faves', (req,res)=>{
	db.city.findOrCreate({
		where: { name: req.body.name },
		defaults: req.body
	})
	.spread((city, created)=>{
		if(created){
			console.log('craeted: '+city.name)
		}
		res.redirect('/cities/faves')
	})
	.catch((err) => {
	    console.log('Error in POST /reviews', err)
	    res.render('404')
	  })
})

module.exports = router