'use strict'
/**
 * Name: Logbook JS - Console Logging Utility
 * Author: Bjornar Egede-Nissen
 * License: MIT
 * Version: 1.0.0
 * Date: 2021-12-12
 *
 * ### INFO ###
 * Logbook is a utility for creating custom console logging functions.
 *
 * Features:
 * - Create unlimited logging functions, all attached to console
 * - Preserves call location (file, line numbers)
 * - Create different log styles with CSS (background, foreground, font size, etc)
 * - Filter which log messages to print to console
 * - Expose console logging functions as globals (optional)
 * - Compatible with both Typescript and vanilla Javascript
 *
 *
 * ### HOW TO USE ###
 *
 * ~ Browser ~
 * `<script src="logger.js"></script>`
 *
 * ~ node ~
 * `import * as Loggers from 'loggers.js'`
 *
 * === Initializing ===
 *
 * `const logger = Loggers()`
 * `const { log, error, warn } = logger.export()`
 *
 * === Further usage instructions ===
 * See JSDoc attached to `Loggers()` function or output of `help()`.
 *
 * === Enable intellisense ===
 *
 * ~ Typescript ~
 * Includes Typescript d.ts typings for default logger functions.
 *
 * ~ eslint ~
 * To enable default global functions, use the included .eslintrc as a plugin.
 *
 * === Logger methods ===
 *
 * `register()` Create new logger or edit an existing one.
 * `help()` Print settings and configured loggers to console.
 * `setLevel()` Change the logging level.
 *
 */

// === Internal types ===
/** @typedef {string|number|boolean} primitive string|number|boolean */
/** @typedef {Object<string, string>} CssStyles */
/** @typedef {Object<string, string>} FontStyles */
/** @typedef {string|Array<string>} StyleItem */
/** @typedef {Object<string, StyleItem>} LogbookStyles */
/** @typedef {function(...string):void} ConsoleMethod window.console method */
/** @typedef {{ fn: ConsoleMethod, level?: validLogLevels, style?: StyleItem }} LogbookItem */
/** @typedef  {Object<string, LogbookItem>} LogbookConfigList */
/** @typedef  {Object<string, ConsoleMethod>} LogbookList */
/** @typedef {keyof typeof LogLevels} validLogLevels */

/**
 * Default config.
 *
 * @readonly
 * @enum {any}
 */
const Settings = {
	/** @type {validLogLevels} */
	minLevel: 'all',
	/** Name to use if the Logbook is attached to the window object */
	name: 'Logbook',
	overwriteConsole: false,
	globalPrefix: '',
	global: false,
}

/**
 * Default log levels.
 *
 * @readonly
 * @enum {number}
 */
const LogLevels = {
	all: 1,
	log: 2,
	trace: 3,
	debug: 4,
	info: 5,
	warn: 6,
	error: 7,
	disable: 8,
	disabled: 8,
	off: 8,
}

/** @type {CssStyles} */
const style = {
	badge: 'padding: 2px 4px; border-radius: 3px;',
	block: 'display: inline-block; width: 100%; padding: 2px 4px; margin: 2px 0;',
	paddingXl: 'padding: 3px 15px;',
	paddingLg: 'padding: 3px 10px;',
	paddingSm: 'padding: 2px 5px;',
}

/** @type {FontStyles} */
const font = {
	black: 'color: black;',
	white: 'color: white;',
	lg: 'font-size: 1.2em;',
	xl: 'font-size: 1.4em;',
	bold: 'font-weight: bold;',
}

/**
 * Default Logbook CSS styling.
 *
 * @type {LogbookStyles}
 */
const defaultLogbookStyles = {
	L1: [ style.badge, style.paddingXl, font.black, font.bold, `background: orange;` ],
	L2: [ style.badge, style.paddingXl, font.black, `background: #90e5fe;` ],
	L3: [ style.badge, style.paddingXl, font.black, ` background-color: lemonchiffon;` ],
	L4: [ style.badge, style.paddingXl, font.black, `background-color: lavender;` ],

	note: [ style.paddingSm, 'color: #FFDEAD;' ],
	blue: [ style.block, style.paddingSm, font.black, 'background: deepskyblue;' ],
	red: [ style.block, style.paddingSm, font.white, `background: darkred;` ],
	purple: [ style.block, style.paddingSm, font.white, 'background: purple;' ],
	yellow: [ style.block, style.paddingSm, font.black, `background: yellow;` ],
	green: [ style.paddingSm, font.black, `display: inline-block; width: 90%; background: springgreen;` ],
	bigYellow: [ style.block, style.paddingLg, font.lg, font.bold, font.black, `background: gold;` ],

	warn: 'padding: 3px 10px;',
	error: 'padding: 3px 10px;',
	success: `color: #B1FB17;`,
	info: 'color: #7DFDFE;',
	debug: 'color: #FFDEAD;',
	group: 'color: #FFDEAD;',
	groupEnd: '',
}

/**
 * @type {LogbookConfigList}
 */
const defaultLoggers = {
	log: { fn: console.log },
	warn: { fn: console.warn },
	error: { fn: console.error },
	info: { fn: console.info },
	debug: { fn: console.debug },

	group: { fn: console.group, level: 'log' },
	groupEnd: { fn: console.groupEnd, level: 'log' },

	L1: { fn: console.log, level: 'log' },
	L2: { fn: console.log, level: 'log' },
	L3: { fn: console.log, level: 'log' },
	L4: { fn: console.log, level: 'log' },

	note: { fn: console.log, level: 'debug' },
	blue: { fn: console.log, level: 'debug' },
	red: { fn: console.log, level: 'debug' },
	purple: { fn: console.log, level: 'debug' },
	yellow: { fn: console.log, level: 'debug' },
	green: { fn: console.log, level: 'debug' },
	bigYellow: { fn: console.log, level: 'debug' },
}

/**
 * Cached version of console.log.
 *
 * If the Logbook needs debugging.
 */
const __log = console.log.bind( window.console )

/**
 * This makes it safe for Typescript.
 *
 * @param {...any} data
 */
// eslint-disable-next-line no-unused-vars
const __void = ( ...data ) => null

/**
 * Initialize the Logbook library. Configure settings and loggers. Returns API. To export logger functions, use `logbook.export()`.
 *
 * Providing CSS to a logger function will apply that style to the first argument. Additional arguments will use default style.
 *
 * Note: it's not possible to use objects in arguments that are printed with formatting, it will result in `[object Object]`.
 *
 * 🛠🛠🛠 Arguments 🛠🛠🛠
 *
 * settings:
 * ```
 * {
 * 	minLevel?: string,
 * 	name?: string,
 * 	globalPrefix?: string,
 * 	overwriteConsole?: boolean,
 * 	global?: boolean,
 * }
 * ```
 *
 * Note: If overwriting console, only existing console methods are replaced -- custom loggers are not placed inside console.
 *
 * ```
 * loggers:
 * {
 * 	[name]: {
 * 		level: string, // valid logLevel
 * 		consoleFn?: string, //name of console function, default = log
 * 		style?: string, //CSS rules
 * 	},
 * 	[name]: null //disable logger
 * }
 * ```
 *
 * Logging levels (least to most restrictive):
 * `[ all, log, trace, debug, info, warn, error, disable ]`
 *
 * @param {Settings} settings
 * @param {LogbookConfigList} loggers
 */
function Logbook( settings = Settings, loggers = {} ) {
	const currentConsole = console
	const logbookSettings = Settings
	const logbookStyles = defaultLogbookStyles

	setup( settings )

	// Merge provided loggers uncritically with defaults
	const loggerConfigs = mergeConfigs( defaultLoggers, loggers )

	registerLoggers()

	// === Return public methods ===
	const api = {

		/**
		 * Change level and register/unregister loggers.
		 *
		 * Note: mutates exported loggers.
		 *
		 * @param {validLogLevels} level
		 */
		setLevel( level ) {
			logbookSettings.minLevel = getLevelInt( level ) ? level : 'all'
			registerLoggers()
		},

		/**
		 * Get information about current configuration and available loggers.
		 */
		// eslint-disable-next-line no-shadow
		help( { all = false, loggers = false, loggersVerbose = false, defaults = false, levels = false, settings = false } = {} ) {
			const output = {
				...( loggers || all ) && { loggers: currentConsole },
				...( loggersVerbose || all ) && { loggersVerbose: loggerConfigs },
				...( defaults || all ) && { defaults: defaultLoggers },
				...( levels || all ) && { levels: LogLevels },
				...( settings || all ) && { settings: logbookSettings },
			}

			let i
			for ( i in output ) {}

			if ( ! i ) {
				__log( '*** Example usage: ***\n\nhelp({ all = false, loggers = true, loggersVerbose = false, defaults = false, levels = false, settings = false })' )
				return
			}

			__log( output )
		},

		/**
		 * Create new logger or modify an existing logger.
		 *
		 * @param {string} name
		 * @param {LogbookItem} config
		 */
		register( name, config ) {
			return generateLoggerFn( name, config )
		},

		/**
		 * Export all logger functions wrapped in an object.
		 *
		 * Note: destructured functions will NOT be updated if the configuration or level is changed after export.
		 */
		export() {
			return currentConsole
		},

		/**
		 * Print test message with all registered loggers.
		 */
		test() {
			Object.keys( loggerConfigs ).forEach( ( logger ) => {
				currentConsole[ logger ]( `Test: ${ logger }` )
			} )
		},
	}

	if ( logbookSettings.global ) {
		// eslint-disable-next-line dot-notation
		window[ 'logger' ] = api
		// eslint-disable-next-line dot-notation
		window[ '__log' ] = __log
	}

	// === Private functions ===

	/**
	 * @internal
	 * @param {validLogLevels} levelString
	 */
	function getLevelInt( levelString ) {
		return LogLevels[ levelString ]
	}

	/**
	 * @internal
	 * @param {Settings} _settings
	 */
	function setup( _settings ) {
		const s = _settings || {}
		logbookSettings.minLevel = isValid( getLevelInt( s.minLevel ), logbookSettings.minLevel, 0 )
		logbookSettings.global = isValid( s.global, logbookSettings.global )
		logbookSettings.overwriteConsole = isValid( s.overwriteConsole, logbookSettings.overwriteConsole )
		logbookSettings.globalPrefix = isValid( s.globalPrefix, logbookSettings.globalPrefix, '' )
	}

	/**
	 * Process logger configurations and register loggers based on current level.
	 *
	 * @internal
	 */
	function registerLoggers() {
		const names = Object.keys( loggerConfigs )
		names.forEach( ( name ) => {
			const config = loggerConfigs[ name ]
			config.level = config.level || name
			editLogger( name, config )
		} )
	}

	/**
	 * Generate console method based on config.
	 *
	 * @internal
	 * @param {string} name
	 * @param {LogbookItem} config
	 * @return {ConsoleMethod} Returns a wrapped console method.
	 */
	function generateLoggerFn( name, config ) {
		const { fn: consoleFn, style: loggerStyle } = config

		// ~ The magic happens here ~
		// Prepending the console message array with two items [`%c%s`, CSS] will apply that CSS to the next item added to the array.
		// %c%s is a template string. %c is replaced by the next item in the list, which is the CSS. %s is replaced by the message string, the item that is following the CSS.
		// The CSS will only be applied to one array item
		// Subsequent items added to the array, .e.g. console.log(..., item2, item3, ...)  will revert to default styling
		// Specification: @see https://developer.mozilla.org/en-US/docs/Web/API/Console#outputting_text_to_the_console
		// Note: only primitive values can be styled, objects will be stringified as [object Object]
		// #todo: use %O to output objects
		// ! Note: it is critical for the first params array item to bind console to 'this'
		const params = loggerStyle
			? [ console, `%c%s`, loggerStyle ]
			: [ console ]

		let logger
		try {
			logger = Function.prototype.bind.apply( consoleFn, params )
		}
		catch ( err ) {
			console.error( `Logbook: Failed to register logger, invalid console function provided (name: ${ name }).` )
			logger = undefined
		}

		return logger
	}

	/**
	 * Add new logger or reconfigure an existing one. New settings are merged with old.
	 *
	 * @internal
	 * @param {string} name
	 * @param {LogbookItem} config
	 */
	function editLogger( name, config ) {
		const { level, style: loggerStyle } = config

		let levelN = getLevelInt( level )
		if ( ! levelN ) {
			config.level = 'all'
			levelN = 1
		}

		config.style = loggerStyle
		if ( ! loggerStyle ) {
			config.style = logbookStyles[ name ]
			if ( Array.isArray( config.style ) ) {
				config.style = config.style.join( '' )
			}
		}

		if ( loggerConfigs[ name ] ) {
			loggerConfigs[ name ] = { ...loggerConfigs[ name ], ...config }
		}
		else {
			loggerConfigs[ name ] = config
		}

		const logger = generateLoggerFn( name, config )

		if ( ! logger ) {
			return
		}

		const fn = levelN >= getLevelInt( logbookSettings.minLevel ) ? logger : __void

		if ( logbookSettings.overwriteConsole && window.console[ name ] ) {
			window.console[ name ] = fn
		}

		currentConsole[ name ] = fn

		// Add logger to window?
		if ( logbookSettings.global ) {
			const globalName = logbookSettings.globalPrefix ? logbookSettings.globalPrefix + name : name
			window[ globalName ] = fn
		}
	}

	return api
}

/**
 * Simple merge function for two objects with two levels, with minimal guards.
 *
 * Provide target to merge objects by mutation.
 *
 * @param {Object<string, any>} obj1 - Object to merge into.
 * @param {Object<string, any>} obj2 - Obj2 props will overwrite obj1 props, recursively.
 * @param {Object<string, any>} target - Optional. If provided, objects will be merged with target by mutation.
 * @return {Object<string, any>} Merged object
 */
function mergeConfigs( obj1, obj2, target = {} ) {
	const obj1Keys = Object.keys( obj1 )
	const obj2Keys = Object.keys( obj2 )

	obj1Keys.concat( obj2Keys ).forEach( ( key ) => {
		target[ key ] = Object.assign( obj1[ key ] || {}, obj2[ key ] || {} )
	} )
	return target
}

function isValid( value, fallback, compare = undefined ) {
	return value !== compare && value !== undefined ? value : fallback
}

export default Logbook
export { __log }
