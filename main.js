/* global global, require, process */

const puppeteer = require('puppeteer')
const fastify = require('fastify')({
	// logger: true,
})
const bearerAuthPlugin = require('fastify-bearer-auth')

/**
 * Created on 1398/12/4 (2020/2/23).
 * @author {@link https://mirismaili.github.io S. Mahdi Mir-Ismaili}
 */
'use strict'

global.browser = null

const options = {
	// headless: false,
	// devtools: true,
	// slowMo : 500,
	args: ['--no-sandbox'],   // https://github.com/jashkenas/puppeteer-heroku-buildpack#puppeteer-heroku-buildpack
}
global['browserPromise'] = puppeteer.launch(options)

browserPromise.then(browser => {
	global['browser'] = browser
	console.log('Browser lunched with', options)
}).catch(err => {
	console.error(err)
	process.exit(1)
})
//****************************************************************************/

fastify.register(bearerAuthPlugin, {
	keys: new Set([process.env.BEARER_KEY_1])
})

require('./api/bashgah-competition-photo')(fastify)

// Run the server!
const start = async () => {
	fastify.listen(process.env.PORT || 3000, '0.0.0.0').then(() =>
			console.log('Server listening on', fastify.server.address().port)
	).catch(err => {
		console.error(err)
		process.exit(1)
	})
}
start().then()
