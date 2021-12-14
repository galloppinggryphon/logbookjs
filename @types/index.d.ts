//~ Define custom console logger names ~
type CustomLoggers = [
	"L1",
	"L2",
	"L3",
	"L4",
	"yellow",
	"bigYellow",
	"red",
	"purple",
	"green",
	"blue"
];

declare global {
	// ~ Expose console loggers at top level (without console.*) ~
	//Must be defined with the configured prefix

	//Custom functions
	const [
		_L1,
		_L2,
		_L3,
		_L4,
		_yellow,
		_bigYellow,
		_red,
		_purple,
		_green,
		_blue,
	]: LoggerFn[];

	//built-in console functions
	const [_log, _warn, _error, _info]: LoggerFn[];
}

type LoggerFn = (...messages: unknown[]) => void;

type ExtendedConsole = {
	readonly [Key in CustomLoggers[number]]: LoggerFn;
};

interface Console extends ExtendedConsole {}

import Logbook from '../src/logbook.js'

export = Logbook;
