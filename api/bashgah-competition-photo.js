/* global global, require, process, browserPromise, browser */
const {HTTP_STATUS} = require('../constants')
const {snooze} = require('../util')

/**
 * Created on 1398/12/4 (2020/2/23).
 * @author {@link https://mirismaili.github.io S. Mahdi Mir-Ismaili}
 */
'use strict'

const BASHGAH_ORIGIN = 'https://bashgah.com'

const handler = async (request, reply) => {
	console.log(request.body)
	const {competitionCode, viewport} = request.body
	
	if (!browser) global['browser'] = await browserPromise
	let page = null
	
	try {
		page = await browser.newPage()
		console.log('10')
		
		if (viewport) try {
			await page.setViewport(viewport)
		} catch (e) {
			return reply.code(HTTP_STATUS.BAD_REQUEST.code)
					.send(`Bad viewport: ${JSON.stringify(viewport)}\n${e.name}: ${e.message}`)
		}
		console.log('20')
		
		page.goto(new URL(`${BASHGAH_ORIGIN}/Question/${competitionCode}`)).then().catch(err => {
			// Not important errors:
			if (err.message === 'Navigation failed because browser has disconnected!' || err.name === 'TimeoutError')
				return
			
			console.log(err)
		})
		console.log('30')
		
		
		const nonsignificantPromises = [
			{
				selector: '#header3',
				action: el => el.remove(),
			},
			{
				selector: '#view-container > div.container.ng-scope > div.form-body div.col-md-4:not(.ng-hide)',  // جدول تعداد شرکت‌کنندگان بر اساس سطح
				action: el => el.remove(),
			},
			{
				selector: '#view-container > div.container.ng-scope > div.form-footer',                           // گزینه‌ها («ارسال پاسخ»، ...)
				action: el => el.remove(),
			},
			{
				selector: '#view-container > div.container.ng-scope > div.form-header > span:nth-child(2)',       // بخش «طراح سؤال: ...»
				action: el => el.remove(),
			},
			{
				selector: '#view-container > div.container.ng-scope div.questionBody > span:nth-child(2)',     // question text
				action: el => el.style.font = '0.9em BYekan',
			},
			{
				selector: 'div.loading-wrap',
				action: el => el.parentElement.style.display = 'none',   // waiting cover on the whole page
			},
		]
		
		// noinspection JSUnresolvedFunction
		nonsignificantPromises.map(({selector, action}) =>
				page.waitForSelector(selector).then(elHandle => elHandle.evaluate(action))
						.catch(err => console.error(`"${selector}"`, err.name, ':', err.message))  // continue >>>
		)
		
		const div = await page.waitForSelector('#view-container > div.container.ng-scope')
		console.log('40')

		await snooze(1000)  // for caution
		console.log('45')
		
		const imageBuffer = await div.screenshot()
		console.log('50')
		
		/*return*/
		reply.type('image/png').send(imageBuffer)
	} catch (e) {
		console.error(e.name === 'TimeoutError' ? e.name : e)
		if (!reply.sent)
		/*return*/ reply.code(HTTP_STATUS.GATEWAY_TIMEOUT.code).type('text/plain').send(e.message)
	} finally {
		try {
			if (page !== null)
			// noinspection JSUnresolvedFunction
				page.close().then(() => console.log('60')).catch()
		} catch (e) {}
		try {
			if (!reply.sent)
				reply.code(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).type('text/plain').send('No response')
		} catch (e) {}
	}
}

module.exports = fastify => fastify.route({
	method: 'POST',
	url: '/bashgah-competition-photo',
	schema: {
		body: {
			type: 'object',
			required: ['competitionCode'],
			properties: {
				competitionCode: {type: 'number'},
				viewport: {
					type: 'object',
					properties: {
						width: {type: 'number'},
						height: {type: 'number'},
						deviceScaleFactor: {type: 'number'},
						isMobile: {type: 'boolean'},
						hasTouch: {type: 'boolean'},
						isLandscape: {type: 'boolean'},
					}
				},
			}
		},
	},
	handler: handler
})
