/**
 * Created on 1398/12/4 (2020/2/23).
 * @author {@link https://mirismaili.github.io S. Mahdi Mir-Ismaili}
 */
'use strict'

const snooze = ms => new Promise(resolve => setTimeout(resolve, ms))  // https://stackoverflow.com/a/13448477/5318303

module.exports = {
	snooze,
}
