'use strict';

module.exports.log = console.log.bind(console);
module.exports.info = (console.info || console.log).bind(console);
module.exports.warning = (console.warn || console.log).bind(console);
module.exports.error = (console.error || console.log).bind(console);
