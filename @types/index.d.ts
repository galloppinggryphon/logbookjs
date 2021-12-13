type LogbookSettings = {
	IsGlobal: true;
	GlobalPrefix: "_";
	CustomLoggers: [
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
	GlobalizeBuiltinLoggers: [
		"log",
		"debug",
		"info",
		"error",
		"warn",
		"group",
		"groupEnd"
	];
}

type LoggerLogFn = (...messages: unknown[]) => void;

type ExtendedConsole = LogbookSettings['IsGlobal'] extends true
	? {
			readonly [Key in LogbookSettings['CustomLoggers'][number]]: LoggerLogFn;
	  }
	: {};

type CustomGlobalLoggers = LogbookSettings['IsGlobal'] extends true
	? {
			readonly [Key in LogbookSettings['CustomLoggers'][number] as `${LogbookSettings['GlobalPrefix']}${Key}`]: LoggerLogFn;
	  }
	: {};

type GlobalLoggers = LogbookSettings['IsGlobal'] extends true
	? CustomGlobalLoggers & {
			readonly [Key in LogbookSettings['GlobalizeBuiltinLoggers'][number] as `${LogbookSettings['GlobalPrefix']}${Key}`]: LoggerLogFn;
	  }
	: {};

declare global {
	/**
	 * Augment custom loggers to console
	 */
	interface Console extends ExtendedConsole {}

	/**
	 * Augment window - destructure loggers for quick access (if enabled)
	 *
	 * Note: TS does not accept accessing globals without window.*
	 */
	interface Window extends GlobalLoggers {}
}

export {};
