(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["pages-reports-reports-module"],{

/***/ "./node_modules/accounting/accounting.js":
/*!***********************************************!*\
  !*** ./node_modules/accounting/accounting.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/*!
 * accounting.js v0.4.1
 * Copyright 2014 Open Exchange Rates
 *
 * Freely distributable under the MIT license.
 * Portions of accounting.js are inspired or borrowed from underscore.js
 *
 * Full details and documentation:
 * http://openexchangerates.github.io/accounting.js/
 */

(function(root, undefined) {

	/* --- Setup --- */

	// Create the local library object, to be exported or referenced globally later
	var lib = {};

	// Current version
	lib.version = '0.4.1';


	/* --- Exposed settings --- */

	// The library's settings configuration object. Contains default parameters for
	// currency and number formatting
	lib.settings = {
		currency: {
			symbol : "$",		// default currency symbol is '$'
			format : "%s%v",	// controls output: %s = symbol, %v = value (can be object, see docs)
			decimal : ".",		// decimal point separator
			thousand : ",",		// thousands separator
			precision : 2,		// decimal places
			grouping : 3		// digit grouping (not implemented yet)
		},
		number: {
			precision : 0,		// default precision on numbers is 0
			grouping : 3,		// digit grouping (not implemented yet)
			thousand : ",",
			decimal : "."
		}
	};


	/* --- Internal Helper Methods --- */

	// Store reference to possibly-available ECMAScript 5 methods for later
	var nativeMap = Array.prototype.map,
		nativeIsArray = Array.isArray,
		toString = Object.prototype.toString;

	/**
	 * Tests whether supplied parameter is a string
	 * from underscore.js
	 */
	function isString(obj) {
		return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
	}

	/**
	 * Tests whether supplied parameter is a string
	 * from underscore.js, delegates to ECMA5's native Array.isArray
	 */
	function isArray(obj) {
		return nativeIsArray ? nativeIsArray(obj) : toString.call(obj) === '[object Array]';
	}

	/**
	 * Tests whether supplied parameter is a true object
	 */
	function isObject(obj) {
		return obj && toString.call(obj) === '[object Object]';
	}

	/**
	 * Extends an object with a defaults object, similar to underscore's _.defaults
	 *
	 * Used for abstracting parameter handling from API methods
	 */
	function defaults(object, defs) {
		var key;
		object = object || {};
		defs = defs || {};
		// Iterate over object non-prototype properties:
		for (key in defs) {
			if (defs.hasOwnProperty(key)) {
				// Replace values with defaults only if undefined (allow empty/zero values):
				if (object[key] == null) object[key] = defs[key];
			}
		}
		return object;
	}

	/**
	 * Implementation of `Array.map()` for iteration loops
	 *
	 * Returns a new Array as a result of calling `iterator` on each array value.
	 * Defers to native Array.map if available
	 */
	function map(obj, iterator, context) {
		var results = [], i, j;

		if (!obj) return results;

		// Use native .map method if it exists:
		if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);

		// Fallback for native .map:
		for (i = 0, j = obj.length; i < j; i++ ) {
			results[i] = iterator.call(context, obj[i], i, obj);
		}
		return results;
	}

	/**
	 * Check and normalise the value of precision (must be positive integer)
	 */
	function checkPrecision(val, base) {
		val = Math.round(Math.abs(val));
		return isNaN(val)? base : val;
	}


	/**
	 * Parses a format string or object and returns format obj for use in rendering
	 *
	 * `format` is either a string with the default (positive) format, or object
	 * containing `pos` (required), `neg` and `zero` values (or a function returning
	 * either a string or object)
	 *
	 * Either string or format.pos must contain "%v" (value) to be valid
	 */
	function checkCurrencyFormat(format) {
		var defaults = lib.settings.currency.format;

		// Allow function as format parameter (should return string or object):
		if ( typeof format === "function" ) format = format();

		// Format can be a string, in which case `value` ("%v") must be present:
		if ( isString( format ) && format.match("%v") ) {

			// Create and return positive, negative and zero formats:
			return {
				pos : format,
				neg : format.replace("-", "").replace("%v", "-%v"),
				zero : format
			};

		// If no format, or object is missing valid positive value, use defaults:
		} else if ( !format || !format.pos || !format.pos.match("%v") ) {

			// If defaults is a string, casts it to an object for faster checking next time:
			return ( !isString( defaults ) ) ? defaults : lib.settings.currency.format = {
				pos : defaults,
				neg : defaults.replace("%v", "-%v"),
				zero : defaults
			};

		}
		// Otherwise, assume format was fine:
		return format;
	}


	/* --- API Methods --- */

	/**
	 * Takes a string/array of strings, removes all formatting/cruft and returns the raw float value
	 * Alias: `accounting.parse(string)`
	 *
	 * Decimal must be included in the regular expression to match floats (defaults to
	 * accounting.settings.number.decimal), so if the number uses a non-standard decimal 
	 * separator, provide it as the second argument.
	 *
	 * Also matches bracketed negatives (eg. "$ (1.99)" => -1.99)
	 *
	 * Doesn't throw any errors (`NaN`s become 0) but this may change in future
	 */
	var unformat = lib.unformat = lib.parse = function(value, decimal) {
		// Recursively unformat arrays:
		if (isArray(value)) {
			return map(value, function(val) {
				return unformat(val, decimal);
			});
		}

		// Fails silently (need decent errors):
		value = value || 0;

		// Return the value as-is if it's already a number:
		if (typeof value === "number") return value;

		// Default decimal point comes from settings, but could be set to eg. "," in opts:
		decimal = decimal || lib.settings.number.decimal;

		 // Build regex to strip out everything except digits, decimal point and minus sign:
		var regex = new RegExp("[^0-9-" + decimal + "]", ["g"]),
			unformatted = parseFloat(
				("" + value)
				.replace(/\((.*)\)/, "-$1") // replace bracketed values with negatives
				.replace(regex, '')         // strip out any cruft
				.replace(decimal, '.')      // make sure decimal point is standard
			);

		// This will fail silently which may cause trouble, let's wait and see:
		return !isNaN(unformatted) ? unformatted : 0;
	};


	/**
	 * Implementation of toFixed() that treats floats more like decimals
	 *
	 * Fixes binary rounding issues (eg. (0.615).toFixed(2) === "0.61") that present
	 * problems for accounting- and finance-related software.
	 */
	var toFixed = lib.toFixed = function(value, precision) {
		precision = checkPrecision(precision, lib.settings.number.precision);
		var power = Math.pow(10, precision);

		// Multiply up by precision, round accurately, then divide and use native toFixed():
		return (Math.round(lib.unformat(value) * power) / power).toFixed(precision);
	};


	/**
	 * Format a number, with comma-separated thousands and custom precision/decimal places
	 * Alias: `accounting.format()`
	 *
	 * Localise by overriding the precision and thousand / decimal separators
	 * 2nd parameter `precision` can be an object matching `settings.number`
	 */
	var formatNumber = lib.formatNumber = lib.format = function(number, precision, thousand, decimal) {
		// Resursively format arrays:
		if (isArray(number)) {
			return map(number, function(val) {
				return formatNumber(val, precision, thousand, decimal);
			});
		}

		// Clean up number:
		number = unformat(number);

		// Build options object from second param (if object) or all params, extending defaults:
		var opts = defaults(
				(isObject(precision) ? precision : {
					precision : precision,
					thousand : thousand,
					decimal : decimal
				}),
				lib.settings.number
			),

			// Clean up precision
			usePrecision = checkPrecision(opts.precision),

			// Do some calc:
			negative = number < 0 ? "-" : "",
			base = parseInt(toFixed(Math.abs(number || 0), usePrecision), 10) + "",
			mod = base.length > 3 ? base.length % 3 : 0;

		// Format the number:
		return negative + (mod ? base.substr(0, mod) + opts.thousand : "") + base.substr(mod).replace(/(\d{3})(?=\d)/g, "$1" + opts.thousand) + (usePrecision ? opts.decimal + toFixed(Math.abs(number), usePrecision).split('.')[1] : "");
	};


	/**
	 * Format a number into currency
	 *
	 * Usage: accounting.formatMoney(number, symbol, precision, thousandsSep, decimalSep, format)
	 * defaults: (0, "$", 2, ",", ".", "%s%v")
	 *
	 * Localise by overriding the symbol, precision, thousand / decimal separators and format
	 * Second param can be an object matching `settings.currency` which is the easiest way.
	 *
	 * To do: tidy up the parameters
	 */
	var formatMoney = lib.formatMoney = function(number, symbol, precision, thousand, decimal, format) {
		// Resursively format arrays:
		if (isArray(number)) {
			return map(number, function(val){
				return formatMoney(val, symbol, precision, thousand, decimal, format);
			});
		}

		// Clean up number:
		number = unformat(number);

		// Build options object from second param (if object) or all params, extending defaults:
		var opts = defaults(
				(isObject(symbol) ? symbol : {
					symbol : symbol,
					precision : precision,
					thousand : thousand,
					decimal : decimal,
					format : format
				}),
				lib.settings.currency
			),

			// Check format (returns object with pos, neg and zero):
			formats = checkCurrencyFormat(opts.format),

			// Choose which format to use for this value:
			useFormat = number > 0 ? formats.pos : number < 0 ? formats.neg : formats.zero;

		// Return with currency symbol added:
		return useFormat.replace('%s', opts.symbol).replace('%v', formatNumber(Math.abs(number), checkPrecision(opts.precision), opts.thousand, opts.decimal));
	};


	/**
	 * Format a list of numbers into an accounting column, padding with whitespace
	 * to line up currency symbols, thousand separators and decimals places
	 *
	 * List should be an array of numbers
	 * Second parameter can be an object containing keys that match the params
	 *
	 * Returns array of accouting-formatted number strings of same length
	 *
	 * NB: `white-space:pre` CSS rule is required on the list container to prevent
	 * browsers from collapsing the whitespace in the output strings.
	 */
	lib.formatColumn = function(list, symbol, precision, thousand, decimal, format) {
		if (!list) return [];

		// Build options object from second param (if object) or all params, extending defaults:
		var opts = defaults(
				(isObject(symbol) ? symbol : {
					symbol : symbol,
					precision : precision,
					thousand : thousand,
					decimal : decimal,
					format : format
				}),
				lib.settings.currency
			),

			// Check format (returns object with pos, neg and zero), only need pos for now:
			formats = checkCurrencyFormat(opts.format),

			// Whether to pad at start of string or after currency symbol:
			padAfterSymbol = formats.pos.indexOf("%s") < formats.pos.indexOf("%v") ? true : false,

			// Store value for the length of the longest string in the column:
			maxLength = 0,

			// Format the list according to options, store the length of the longest string:
			formatted = map(list, function(val, i) {
				if (isArray(val)) {
					// Recursively format columns if list is a multi-dimensional array:
					return lib.formatColumn(val, opts);
				} else {
					// Clean up the value
					val = unformat(val);

					// Choose which format to use for this value (pos, neg or zero):
					var useFormat = val > 0 ? formats.pos : val < 0 ? formats.neg : formats.zero,

						// Format this value, push into formatted list and save the length:
						fVal = useFormat.replace('%s', opts.symbol).replace('%v', formatNumber(Math.abs(val), checkPrecision(opts.precision), opts.thousand, opts.decimal));

					if (fVal.length > maxLength) maxLength = fVal.length;
					return fVal;
				}
			});

		// Pad each number in the list and send back the column of numbers:
		return map(formatted, function(val, i) {
			// Only if this is a string (not a nested array, which would have already been padded):
			if (isString(val) && val.length < maxLength) {
				// Depending on symbol position, pad after symbol or at index 0:
				return padAfterSymbol ? val.replace(opts.symbol, opts.symbol+(new Array(maxLength - val.length + 1).join(" "))) : (new Array(maxLength - val.length + 1).join(" ")) + val;
			}
			return val;
		});
	};


	/* --- Module Definition --- */

	// Export accounting for CommonJS. If being loaded as an AMD module, define it as such.
	// Otherwise, just add `accounting` to the global object
	if (true) {
		if ( true && module.exports) {
			exports = module.exports = lib;
		}
		exports.accounting = lib;
	} else {}

	// Root will be `window` in browser or `global` on the server:
}(this));


/***/ }),

/***/ "./node_modules/currency-formatter/currencies.json":
/*!*********************************************************!*\
  !*** ./node_modules/currency-formatter/currencies.json ***!
  \*********************************************************/
/*! exports provided: AED, AFN, ALL, AMD, ANG, AOA, ARS, AUD, AWG, AZN, BAM, BBD, BDT, BGN, BHD, BIF, BMD, BND, BOB, BRL, BSD, BTC, BTN, BWP, BYR, BZD, CAD, CDF, CHF, CLP, CNY, COP, CRC, CUC, CUP, CVE, CZK, DJF, DKK, DOP, DZD, EGP, ERN, ETB, EUR, FJD, FKP, GBP, GEL, GHS, GIP, GMD, GNF, GTQ, GYD, HKD, HNL, HRK, HTG, HUF, IDR, ILS, INR, IQD, IRR, ISK, JMD, JOD, JPY, KES, KGS, KHR, KMF, KPW, KRW, KWD, KYD, KZT, LAK, LBP, LKR, LRD, LSL, LYD, MAD, MDL, MGA, MKD, MMK, MNT, MOP, MRO, MTL, MUR, MVR, MWK, MXN, MYR, MZN, NAD, NGN, NIO, NOK, NPR, NZD, OMR, PAB, PEN, PGK, PHP, PKR, PLN, PYG, QAR, RON, RSD, RUB, RWF, SAR, SBD, SCR, SDD, SDG, SEK, SGD, SHP, SLL, SOS, SRD, STD, SVC, SYP, SZL, THB, TJS, TMT, TND, TOP, TRY, TTD, TVD, TWD, TZS, UAH, UGX, USD, UYU, UZS, VEB, VEF, VND, VUV, WST, XAF, XCD, XBT, XOF, XPF, YER, ZAR, ZMW, WON, default */
/***/ (function(module) {

module.exports = {"AED":{"code":"AED","symbol":"د.إ.‏","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"AFN":{"code":"AFN","symbol":"؋","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"ALL":{"code":"ALL","symbol":"Lek","thousandsSeparator":".","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"AMD":{"code":"AMD","symbol":"֏","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"ANG":{"code":"ANG","symbol":"ƒ","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"AOA":{"code":"AOA","symbol":"Kz","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"ARS":{"code":"ARS","symbol":"$","thousandsSeparator":".","decimalSeparator":",","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"AUD":{"code":"AUD","symbol":"$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"AWG":{"code":"AWG","symbol":"ƒ","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"AZN":{"code":"AZN","symbol":"₼","thousandsSeparator":" ","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"BAM":{"code":"BAM","symbol":"КМ","thousandsSeparator":".","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"BBD":{"code":"BBD","symbol":"$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"BDT":{"code":"BDT","symbol":"৳","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":0},"BGN":{"code":"BGN","symbol":"лв.","thousandsSeparator":" ","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"BHD":{"code":"BHD","symbol":"د.ب.‏","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":3},"BIF":{"code":"BIF","symbol":"FBu","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":false,"decimalDigits":0},"BMD":{"code":"BMD","symbol":"$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"BND":{"code":"BND","symbol":"$","thousandsSeparator":".","decimalSeparator":",","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":0},"BOB":{"code":"BOB","symbol":"Bs","thousandsSeparator":".","decimalSeparator":",","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"BRL":{"code":"BRL","symbol":"R$","thousandsSeparator":".","decimalSeparator":",","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"BSD":{"code":"BSD","symbol":"$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"BTC":{"code":"BTC","symbol":"Ƀ","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":false,"decimalDigits":8},"BTN":{"code":"BTN","symbol":"Nu.","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":1},"BWP":{"code":"BWP","symbol":"P","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"BYR":{"code":"BYR","symbol":"р.","thousandsSeparator":" ","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"BZD":{"code":"BZD","symbol":"BZ$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"CAD":{"code":"CAD","symbol":"$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"CDF":{"code":"CDF","symbol":"FC","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"CHF":{"code":"CHF","symbol":"Fr","thousandsSeparator":"'","decimalSeparator":".","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"CLP":{"code":"CLP","symbol":"$","thousandsSeparator":".","decimalSeparator":",","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"CNY":{"code":"CNY","symbol":"¥","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"COP":{"code":"COP","symbol":"$","thousandsSeparator":".","decimalSeparator":",","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"CRC":{"code":"CRC","symbol":"₡","thousandsSeparator":".","decimalSeparator":",","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"CUC":{"code":"CUC","symbol":"CUC","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"CUP":{"code":"CUP","symbol":"$MN","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"CVE":{"code":"CVE","symbol":"$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"CZK":{"code":"CZK","symbol":"Kč","thousandsSeparator":" ","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"DJF":{"code":"DJF","symbol":"Fdj","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":false,"decimalDigits":0},"DKK":{"code":"DKK","symbol":"kr.","thousandsSeparator":"","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"DOP":{"code":"DOP","symbol":"RD$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"DZD":{"code":"DZD","symbol":"د.ج.‏","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"EGP":{"code":"EGP","symbol":"ج.م.‏","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"ERN":{"code":"ERN","symbol":"Nfk","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"ETB":{"code":"ETB","symbol":"ETB","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"EUR":{"code":"EUR","symbol":"€","thousandsSeparator":" ","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"FJD":{"code":"FJD","symbol":"$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"FKP":{"code":"FKP","symbol":"£","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"GBP":{"code":"GBP","symbol":"£","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"GEL":{"code":"GEL","symbol":"Lari","thousandsSeparator":" ","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"GHS":{"code":"GHS","symbol":"₵","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"GIP":{"code":"GIP","symbol":"£","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"GMD":{"code":"GMD","symbol":"D","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"GNF":{"code":"GNF","symbol":"FG","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":false,"decimalDigits":0},"GTQ":{"code":"GTQ","symbol":"Q","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"GYD":{"code":"GYD","symbol":"$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"HKD":{"code":"HKD","symbol":"HK$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"HNL":{"code":"HNL","symbol":"L.","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"HRK":{"code":"HRK","symbol":"kn","thousandsSeparator":".","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"HTG":{"code":"HTG","symbol":"G","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"HUF":{"code":"HUF","symbol":"Ft","thousandsSeparator":" ","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"IDR":{"code":"IDR","symbol":"Rp","thousandsSeparator":".","decimalSeparator":",","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":0},"ILS":{"code":"ILS","symbol":"₪","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"INR":{"code":"INR","symbol":"₹","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"IQD":{"code":"IQD","symbol":"د.ع.‏","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"IRR":{"code":"IRR","symbol":"﷼","thousandsSeparator":",","decimalSeparator":"/","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"ISK":{"code":"ISK","symbol":"kr.","thousandsSeparator":".","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":0},"JMD":{"code":"JMD","symbol":"J$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"JOD":{"code":"JOD","symbol":"د.ا.‏","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":3},"JPY":{"code":"JPY","symbol":"¥","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":0},"KES":{"code":"KES","symbol":"KSh","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"KGS":{"code":"KGS","symbol":"сом","thousandsSeparator":" ","decimalSeparator":"-","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"KHR":{"code":"KHR","symbol":"៛","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":false,"decimalDigits":0},"KMF":{"code":"KMF","symbol":"CF","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"KPW":{"code":"KPW","symbol":"₩","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":0},"KRW":{"code":"KRW","symbol":"₩","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":0},"KWD":{"code":"KWD","symbol":"د.ك.‏","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":3},"KYD":{"code":"KYD","symbol":"$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"KZT":{"code":"KZT","symbol":"₸","thousandsSeparator":" ","decimalSeparator":"-","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"LAK":{"code":"LAK","symbol":"₭","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":false,"decimalDigits":0},"LBP":{"code":"LBP","symbol":"ل.ل.‏","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"LKR":{"code":"LKR","symbol":"₨","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":0},"LRD":{"code":"LRD","symbol":"$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"LSL":{"code":"LSL","symbol":"M","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"LYD":{"code":"LYD","symbol":"د.ل.‏","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":3},"MAD":{"code":"MAD","symbol":"د.م.‏","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"MDL":{"code":"MDL","symbol":"lei","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"MGA":{"code":"MGA","symbol":"Ar","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":0},"MKD":{"code":"MKD","symbol":"ден.","thousandsSeparator":".","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"MMK":{"code":"MMK","symbol":"K","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"MNT":{"code":"MNT","symbol":"₮","thousandsSeparator":" ","decimalSeparator":",","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"MOP":{"code":"MOP","symbol":"MOP$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"MRO":{"code":"MRO","symbol":"UM","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"MTL":{"code":"MTL","symbol":"₤","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"MUR":{"code":"MUR","symbol":"₨","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"MVR":{"code":"MVR","symbol":"MVR","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":1},"MWK":{"code":"MWK","symbol":"MK","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"MXN":{"code":"MXN","symbol":"$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"MYR":{"code":"MYR","symbol":"RM","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"MZN":{"code":"MZN","symbol":"MT","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":0},"NAD":{"code":"NAD","symbol":"$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"NGN":{"code":"NGN","symbol":"₦","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"NIO":{"code":"NIO","symbol":"C$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"NOK":{"code":"NOK","symbol":"kr","thousandsSeparator":" ","decimalSeparator":",","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"NPR":{"code":"NPR","symbol":"₨","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"NZD":{"code":"NZD","symbol":"$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"OMR":{"code":"OMR","symbol":"﷼","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":3},"PAB":{"code":"PAB","symbol":"B/.","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"PEN":{"code":"PEN","symbol":"S/.","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"PGK":{"code":"PGK","symbol":"K","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"PHP":{"code":"PHP","symbol":"₱","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"PKR":{"code":"PKR","symbol":"₨","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"PLN":{"code":"PLN","symbol":"zł","thousandsSeparator":" ","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"PYG":{"code":"PYG","symbol":"₲","thousandsSeparator":".","decimalSeparator":",","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"QAR":{"code":"QAR","symbol":"﷼","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"RON":{"code":"RON","symbol":"lei","thousandsSeparator":".","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"RSD":{"code":"RSD","symbol":"Дин.","thousandsSeparator":".","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"RUB":{"code":"RUB","symbol":"₽","thousandsSeparator":" ","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"RWF":{"code":"RWF","symbol":"RWF","thousandsSeparator":" ","decimalSeparator":",","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"SAR":{"code":"SAR","symbol":"﷼","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"SBD":{"code":"SBD","symbol":"$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"SCR":{"code":"SCR","symbol":"₨","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"SDD":{"code":"SDD","symbol":"LSd","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"SDG":{"code":"SDG","symbol":"£‏","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"SEK":{"code":"SEK","symbol":"kr","thousandsSeparator":".","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"SGD":{"code":"SGD","symbol":"$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"SHP":{"code":"SHP","symbol":"£","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"SLL":{"code":"SLL","symbol":"Le","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"SOS":{"code":"SOS","symbol":"S","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"SRD":{"code":"SRD","symbol":"$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"STD":{"code":"STD","symbol":"Db","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"SVC":{"code":"SVC","symbol":"₡","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"SYP":{"code":"SYP","symbol":"£","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"SZL":{"code":"SZL","symbol":"E","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"THB":{"code":"THB","symbol":"฿","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"TJS":{"code":"TJS","symbol":"TJS","thousandsSeparator":" ","decimalSeparator":";","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"TMT":{"code":"TMT","symbol":"m","thousandsSeparator":" ","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":false,"decimalDigits":0},"TND":{"code":"TND","symbol":"د.ت.‏","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":3},"TOP":{"code":"TOP","symbol":"T$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"TRY":{"code":"TRY","symbol":"TL","thousandsSeparator":".","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"TTD":{"code":"TTD","symbol":"TT$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"TVD":{"code":"TVD","symbol":"$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"TWD":{"code":"TWD","symbol":"NT$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"TZS":{"code":"TZS","symbol":"TSh","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"UAH":{"code":"UAH","symbol":"₴","thousandsSeparator":" ","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"UGX":{"code":"UGX","symbol":"USh","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"USD":{"code":"USD","symbol":"$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"UYU":{"code":"UYU","symbol":"$U","thousandsSeparator":".","decimalSeparator":",","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"UZS":{"code":"UZS","symbol":"сўм","thousandsSeparator":" ","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"VEB":{"code":"VEB","symbol":"Bs.","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"VEF":{"code":"VEF","symbol":"Bs. F.","thousandsSeparator":".","decimalSeparator":",","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"VND":{"code":"VND","symbol":"₫","thousandsSeparator":".","decimalSeparator":".","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":0},"VUV":{"code":"VUV","symbol":"VT","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":false,"decimalDigits":0},"WST":{"code":"WST","symbol":"WS$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"XAF":{"code":"XAF","symbol":"F","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"XCD":{"code":"XCD","symbol":"$","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"XBT":{"code":"XBT","symbol":"Ƀ","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"XOF":{"code":"XOF","symbol":"F","thousandsSeparator":" ","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"XPF":{"code":"XPF","symbol":"F","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"YER":{"code":"YER","symbol":"﷼","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"ZAR":{"code":"ZAR","symbol":"R","thousandsSeparator":" ","decimalSeparator":",","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"ZMW":{"code":"ZMW","symbol":"ZK","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"WON":{"code":"WON","symbol":"₩","thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2}};

/***/ }),

/***/ "./node_modules/currency-formatter/index.js":
/*!**************************************************!*\
  !*** ./node_modules/currency-formatter/index.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var accounting = __webpack_require__(/*! accounting */ "./node_modules/accounting/accounting.js")
var assign = __webpack_require__(/*! object-assign */ "./node_modules/object-assign/index.js")
var localeCurrency = __webpack_require__(/*! locale-currency */ "./node_modules/locale-currency/index.js")
var currencies = __webpack_require__(/*! ./currencies.json */ "./node_modules/currency-formatter/currencies.json")
var localeFormats = __webpack_require__(/*! ./localeFormats.json */ "./node_modules/currency-formatter/localeFormats.json")

var defaultCurrency = {
  symbol: '',
  thousandsSeparator: ',',
  decimalSeparator: '.',
  symbolOnLeft: true,
  spaceBetweenAmountAndSymbol: false,
  decimalDigits: 2
}

var defaultLocaleFormat = {}

var formatMapping = [
  {
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    format: {
      pos: '%s%v',
      neg: '-%s%v',
      zero: '%s%v'
    }
  },
  {
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    format: {
      pos: '%s %v',
      neg: '-%s %v',
      zero: '%s %v'
    }
  },
  {
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    format: {
      pos: '%v%s',
      neg: '-%v%s',
      zero: '%v%s'
    }
  },
  {
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    format: {
      pos: '%v %s',
      neg: '-%v %s',
      zero: '%v %s'
    }
  }
]

function format(value, options) {
  var code = options.code || (options.locale && localeCurrency.getCurrency(options.locale))
  var localeMatch = /^([a-z]+)([_-]([a-z]+))?$/i.exec(options.locale) || []
  var language = localeMatch[1]
  var region = localeMatch[3]
  var localeFormat = assign({}, defaultLocaleFormat,
                            localeFormats[language] || {},
                            localeFormats[language + '-' + region] || {})
  var currency = assign({}, defaultCurrency, findCurrency(code), localeFormat)
  
  var symbolOnLeft = currency.symbolOnLeft
  var spaceBetweenAmountAndSymbol = currency.spaceBetweenAmountAndSymbol

  var format = formatMapping.filter(function(f) {
    return f.symbolOnLeft == symbolOnLeft && f.spaceBetweenAmountAndSymbol == spaceBetweenAmountAndSymbol
  })[0].format

  return accounting.formatMoney(value, {
    symbol: isUndefined(options.symbol)
              ? currency.symbol
              : options.symbol,

    decimal: isUndefined(options.decimal)
              ? currency.decimalSeparator
              : options.decimal,

    thousand: isUndefined(options.thousand)
              ? currency.thousandsSeparator
              : options.thousand,

    precision: typeof options.precision === 'number'
              ? options.precision
              : currency.decimalDigits,

    format: ['string', 'object'].indexOf(typeof options.format) > -1
              ? options.format
              : format
  })
}

function findCurrency (currencyCode) {
  return currencies[currencyCode]
}

function isUndefined (val) {
  return typeof val === 'undefined'
}

function unformat(value, options) {
  var code = options.code || (options.locale && localeCurrency.getCurrency(options.locale))
  var localeFormat = localeFormats[options.locale] || defaultLocaleFormat
  var currency = assign({}, defaultCurrency, findCurrency(code), localeFormat)
  var decimal = isUndefined(options.decimal) ? currency.decimalSeparator : options.decimal
  return accounting.unformat(value, decimal)
}

module.exports = {
  defaultCurrency: defaultCurrency,
  get currencies() {
    // In favor of backwards compatibility, the currencies map is converted to an array here
    return Object.keys(currencies).map(function(key) {
      return currencies[key]
    })
  },
  findCurrency: findCurrency,
  format: format,
  unformat: unformat
}

/***/ }),

/***/ "./node_modules/currency-formatter/localeFormats.json":
/*!************************************************************!*\
  !*** ./node_modules/currency-formatter/localeFormats.json ***!
  \************************************************************/
/*! exports provided: de, el, en-US, en-IE, zh-CN, es, it, nl, default */
/***/ (function(module) {

module.exports = {"de":{"thousandsSeparator":".","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"el":{"symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"thousandsSeparator":".","decimalSeparator":",","decimalDigits":2},"en-US":{"thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"en-IE":{"symbolOnLeft":true,"thousandsSeparator":",","decimalSeparator":".","spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"zh-CN":{"thousandsSeparator":",","decimalSeparator":".","symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"decimalDigits":2},"es":{"thousandsSeparator":".","decimalSeparator":",","symbolOnLeft":false,"spaceBetweenAmountAndSymbol":true,"decimalDigits":2},"it":{"symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"thousandsSeparator":".","decimalSeparator":",","decimalDigits":2},"nl":{"symbolOnLeft":true,"spaceBetweenAmountAndSymbol":false,"thousandsSeparator":".","decimalSeparator":",","decimalDigits":2}};

/***/ }),

/***/ "./node_modules/locale-currency/index.js":
/*!***********************************************!*\
  !*** ./node_modules/locale-currency/index.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var map = __webpack_require__(/*! ./map */ "./node_modules/locale-currency/map.js");

var getCountryCode = function(localeString) {
    var components = localeString.split("_");
    if (components.length == 2) {
        return components.pop();
    }
    components = localeString.split("-");
    if (components.length == 2) {
        return components.pop();
    }
    return localeString;
}

exports.getCurrency = function(locale) {
    var countryCode = getCountryCode(locale).toUpperCase();
    if (countryCode in map) {
        return map[countryCode];
    }
    return null;
}

exports.getLocales = function(currencyCode) {
    currencyCode = currencyCode.toUpperCase();
    var locales = [];
    for (countryCode in map) {
        if (map[countryCode] === currencyCode) {
            locales.push(countryCode);
        }
    }
    return locales;
}

/***/ }),

/***/ "./node_modules/locale-currency/map.js":
/*!*********************************************!*\
  !*** ./node_modules/locale-currency/map.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// Generated using ShowCurrencies.java
var map = {
AD: 'EUR',
AE: 'AED',
AF: 'AFN',
AG: 'XCD',
AI: 'XCD',
AL: 'ALL',
AM: 'AMD',
AN: 'ANG',
AO: 'AOA',
AR: 'ARS',
AS: 'USD',
AT: 'EUR',
AU: 'AUD',
AW: 'AWG',
AX: 'EUR',
AZ: 'AZN',
BA: 'BAM',
BB: 'BBD',
BD: 'BDT',
BE: 'EUR',
BF: 'XOF',
BG: 'BGN',
BH: 'BHD',
BI: 'BIF',
BJ: 'XOF',
BL: 'EUR',
BM: 'BMD',
BN: 'BND',
BO: 'BOB',
BQ: 'USD',
BR: 'BRL',
BS: 'BSD',
BT: 'BTN',
BV: 'NOK',
BW: 'BWP',
BY: 'BYR',
BZ: 'BZD',
CA: 'CAD',
CC: 'AUD',
CD: 'CDF',
CF: 'XAF',
CG: 'XAF',
CH: 'CHF',
CI: 'XOF',
CK: 'NZD',
CL: 'CLP',
CM: 'XAF',
CN: 'CNY',
CO: 'COP',
CR: 'CRC',
CU: 'CUP',
CV: 'CVE',
CW: 'ANG',
CX: 'AUD',
CY: 'EUR',
CZ: 'CZK',
DE: 'EUR',
DJ: 'DJF',
DK: 'DKK',
DM: 'XCD',
DO: 'DOP',
DZ: 'DZD',
EC: 'USD',
EE: 'EUR',
EG: 'EGP',
EH: 'MAD',
ER: 'ERN',
ES: 'EUR',
ET: 'ETB',
FI: 'EUR',
FJ: 'FJD',
FK: 'FKP',
FM: 'USD',
FO: 'DKK',
FR: 'EUR',
GA: 'XAF',
GB: 'GBP',
GD: 'XCD',
GE: 'GEL',
GF: 'EUR',
GG: 'GBP',
GH: 'GHS',
GI: 'GIP',
GL: 'DKK',
GM: 'GMD',
GN: 'GNF',
GP: 'EUR',
GQ: 'XAF',
GR: 'EUR',
GS: 'GBP',
GT: 'GTQ',
GU: 'USD',
GW: 'XOF',
GY: 'GYD',
HK: 'HKD',
HM: 'AUD',
HN: 'HNL',
HR: 'HRK',
HT: 'HTG',
HU: 'HUF',
ID: 'IDR',
IE: 'EUR',
IL: 'ILS',
IM: 'GBP',
IN: 'INR',
IO: 'USD',
IQ: 'IQD',
IR: 'IRR',
IS: 'ISK',
IT: 'EUR',
JE: 'GBP',
JM: 'JMD',
JO: 'JOD',
JP: 'JPY',
KE: 'KES',
KG: 'KGS',
KH: 'KHR',
KI: 'AUD',
KM: 'KMF',
KN: 'XCD',
KP: 'KPW',
KR: 'KRW',
KW: 'KWD',
KY: 'KYD',
KZ: 'KZT',
LA: 'LAK',
LB: 'LBP',
LC: 'XCD',
LI: 'CHF',
LK: 'LKR',
LR: 'LRD',
LS: 'LSL',
LT: 'LTL',
LU: 'EUR',
LV: 'LVL',
LY: 'LYD',
MA: 'MAD',
MC: 'EUR',
MD: 'MDL',
ME: 'EUR',
MF: 'EUR',
MG: 'MGA',
MH: 'USD',
MK: 'MKD',
ML: 'XOF',
MM: 'MMK',
MN: 'MNT',
MO: 'MOP',
MP: 'USD',
MQ: 'EUR',
MR: 'MRO',
MS: 'XCD',
MT: 'EUR',
MU: 'MUR',
MV: 'MVR',
MW: 'MWK',
MX: 'MXN',
MY: 'MYR',
MZ: 'MZN',
NA: 'NAD',
NC: 'XPF',
NE: 'XOF',
NF: 'AUD',
NG: 'NGN',
NI: 'NIO',
NL: 'EUR',
NO: 'NOK',
NP: 'NPR',
NR: 'AUD',
NU: 'NZD',
NZ: 'NZD',
OM: 'OMR',
PA: 'PAB',
PE: 'PEN',
PF: 'XPF',
PG: 'PGK',
PH: 'PHP',
PK: 'PKR',
PL: 'PLN',
PM: 'EUR',
PN: 'NZD',
PR: 'USD',
PS: 'ILS',
PT: 'EUR',
PW: 'USD',
PY: 'PYG',
QA: 'QAR',
RE: 'EUR',
RO: 'RON',
RS: 'RSD',
RU: 'RUB',
RW: 'RWF',
SA: 'SAR',
SB: 'SBD',
SC: 'SCR',
SD: 'SDG',
SE: 'SEK',
SG: 'SGD',
SH: 'SHP',
SI: 'EUR',
SJ: 'NOK',
SK: 'EUR',
SL: 'SLL',
SM: 'EUR',
SN: 'XOF',
SO: 'SOS',
SR: 'SRD',
ST: 'STD',
SV: 'SVC',
SX: 'ANG',
SY: 'SYP',
SZ: 'SZL',
TC: 'USD',
TD: 'XAF',
TF: 'EUR',
TG: 'XOF',
TH: 'THB',
TJ: 'TJS',
TK: 'NZD',
TL: 'USD',
TM: 'TMT',
TN: 'TND',
TO: 'TOP',
TR: 'TRY',
TT: 'TTD',
TV: 'AUD',
TW: 'TWD',
TZ: 'TZS',
UA: 'UAH',
UG: 'UGX',
UM: 'USD',
US: 'USD',
UY: 'UYU',
UZ: 'UZS',
VA: 'EUR',
VC: 'XCD',
VE: 'VEF',
VG: 'USD',
VI: 'USD',
VN: 'VND',
VU: 'VUV',
WF: 'XPF',
WS: 'WST',
YE: 'YER',
YT: 'EUR',
ZA: 'ZAR',
ZM: 'ZMK',
ZW: 'ZWL'
};

module.exports = map;

/***/ }),

/***/ "./node_modules/object-assign/index.js":
/*!*********************************************!*\
  !*** ./node_modules/object-assign/index.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/


/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};


/***/ }),

/***/ "./node_modules/primeng/chart.js":
/*!***************************************!*\
  !*** ./node_modules/primeng/chart.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* Shorthand */

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./components/chart/chart */ "./node_modules/primeng/components/chart/chart.js"));

/***/ }),

/***/ "./node_modules/primeng/components/chart/chart.js":
/*!********************************************************!*\
  !*** ./node_modules/primeng/components/chart/chart.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var common_1 = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
var UIChart = /** @class */ (function () {
    function UIChart(el) {
        this.el = el;
        this.options = {};
        this.plugins = [];
        this.responsive = true;
        this.onDataSelect = new core_1.EventEmitter();
    }
    Object.defineProperty(UIChart.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (val) {
            this._data = val;
            this.reinit();
        },
        enumerable: true,
        configurable: true
    });
    UIChart.prototype.ngAfterViewInit = function () {
        this.initChart();
        this.initialized = true;
    };
    UIChart.prototype.onCanvasClick = function (event) {
        if (this.chart) {
            var element = this.chart.getElementAtEvent(event);
            var dataset = this.chart.getDatasetAtEvent(event);
            if (element && element[0] && dataset) {
                this.onDataSelect.emit({ originalEvent: event, element: element[0], dataset: dataset });
            }
        }
    };
    UIChart.prototype.initChart = function () {
        var opts = this.options || {};
        opts.responsive = this.responsive;
        // allows chart to resize in responsive mode
        if (opts.responsive && (this.height || this.width)) {
            opts.maintainAspectRatio = false;
        }
        this.chart = new Chart(this.el.nativeElement.children[0].children[0], {
            type: this.type,
            data: this.data,
            options: this.options,
            plugins: this.plugins
        });
    };
    UIChart.prototype.getCanvas = function () {
        return this.el.nativeElement.children[0].children[0];
    };
    UIChart.prototype.getBase64Image = function () {
        return this.chart.toBase64Image();
    };
    UIChart.prototype.generateLegend = function () {
        if (this.chart) {
            return this.chart.generateLegend();
        }
    };
    UIChart.prototype.refresh = function () {
        if (this.chart) {
            this.chart.update();
        }
    };
    UIChart.prototype.reinit = function () {
        if (this.chart) {
            this.chart.destroy();
            this.initChart();
        }
    };
    UIChart.prototype.ngOnDestroy = function () {
        if (this.chart) {
            this.chart.destroy();
            this.initialized = false;
            this.chart = null;
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], UIChart.prototype, "type", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], UIChart.prototype, "options", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], UIChart.prototype, "plugins", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], UIChart.prototype, "width", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], UIChart.prototype, "height", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], UIChart.prototype, "responsive", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], UIChart.prototype, "onDataSelect", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Object])
    ], UIChart.prototype, "data", null);
    UIChart = __decorate([
        core_1.Component({
            selector: 'p-chart',
            template: "\n        <div style=\"position:relative\" [style.width]=\"responsive && !width ? null : width\" [style.height]=\"responsive && !height ? null : height\">\n            <canvas [attr.width]=\"responsive && !width ? null : width\" [attr.height]=\"responsive && !height ? null : height\" (click)=\"onCanvasClick($event)\"></canvas>\n        </div>\n    "
        }),
        __metadata("design:paramtypes", [core_1.ElementRef])
    ], UIChart);
    return UIChart;
}());
exports.UIChart = UIChart;
var ChartModule = /** @class */ (function () {
    function ChartModule() {
    }
    ChartModule = __decorate([
        core_1.NgModule({
            imports: [common_1.CommonModule],
            exports: [UIChart],
            declarations: [UIChart]
        })
    ], ChartModule);
    return ChartModule;
}());
exports.ChartModule = ChartModule;
//# sourceMappingURL=chart.js.map

/***/ }),

/***/ "./src/app/pages/reports/reports-routing.module.ts":
/*!*********************************************************!*\
  !*** ./src/app/pages/reports/reports-routing.module.ts ***!
  \*********************************************************/
/*! exports provided: ReportsRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ReportsRoutingModule", function() { return ReportsRoutingModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _reports_reports_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./reports/reports.component */ "./src/app/pages/reports/reports/reports.component.ts");




var routes = [
    { path: '', component: _reports_reports_component__WEBPACK_IMPORTED_MODULE_3__["ReportsComponent"] }
];
var ReportsRoutingModule = /** @class */ (function () {
    function ReportsRoutingModule() {
    }
    ReportsRoutingModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            imports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"].forChild(routes)],
            exports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"]]
        })
    ], ReportsRoutingModule);
    return ReportsRoutingModule;
}());



/***/ }),

/***/ "./src/app/pages/reports/reports.module.ts":
/*!*************************************************!*\
  !*** ./src/app/pages/reports/reports.module.ts ***!
  \*************************************************/
/*! exports provided: ReportsModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ReportsModule", function() { return ReportsModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _shared_shared_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../shared/shared.module */ "./src/app/shared/shared.module.ts");
/* harmony import */ var _reports_routing_module__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./reports-routing.module */ "./src/app/pages/reports/reports-routing.module.ts");
/* harmony import */ var _reports_reports_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./reports/reports.component */ "./src/app/pages/reports/reports/reports.component.ts");
/* harmony import */ var primeng_chart__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! primeng/chart */ "./node_modules/primeng/chart.js");
/* harmony import */ var primeng_chart__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(primeng_chart__WEBPACK_IMPORTED_MODULE_5__);






var ReportsModule = /** @class */ (function () {
    function ReportsModule() {
    }
    ReportsModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            imports: [
                _shared_shared_module__WEBPACK_IMPORTED_MODULE_2__["SharedModule"],
                _reports_routing_module__WEBPACK_IMPORTED_MODULE_3__["ReportsRoutingModule"],
                primeng_chart__WEBPACK_IMPORTED_MODULE_5__["ChartModule"]
            ],
            declarations: [_reports_reports_component__WEBPACK_IMPORTED_MODULE_4__["ReportsComponent"]]
        })
    ], ReportsModule);
    return ReportsModule;
}());



/***/ }),

/***/ "./src/app/pages/reports/reports/reports.component.css":
/*!*************************************************************!*\
  !*** ./src/app/pages/reports/reports/reports.component.css ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL3BhZ2VzL3JlcG9ydHMvcmVwb3J0cy9yZXBvcnRzLmNvbXBvbmVudC5jc3MifQ== */"

/***/ }),

/***/ "./src/app/pages/reports/reports/reports.component.html":
/*!**************************************************************!*\
  !*** ./src/app/pages/reports/reports/reports.component.html ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<app-bread-crumb\n  [items]=\"[{text: 'Relatório de Receitas e Despesas'}]\"\n></app-bread-crumb>\n\n<app-page-header\n  page-title=\"Relatório de Receitas e Despesas\"\n  [show-button]=\"false\"\n></app-page-header>\n\n\n<div class=\"card\">\n  <div class=\"card-header\">\n    Selecione o Mês e Ano para gerar os relatórios\n  </div>\n\n  <div class=\"card-body\">\n    <div class=\"form-row\">\n      <div class=\"form-group col-md-7\">\n        <label for=\"month\">Mês</label>\n        <select #month name=\"month\" id=\"month\" class=\"form-control\">\n          <option value=\"\">Selecione um mês</option>\n          <option value=\"1\">Janeiro</option>\n          <option value=\"2\">Fevereiro</option>\n          <option value=\"3\">Março</option>\n          <option value=\"4\">Abril</option>\n          <option value=\"5\">Maio</option>\n          <option value=\"6\">Junho</option>\n          <option value=\"7\">Julho</option>\n          <option value=\"8\">Agosto</option>\n          <option value=\"9\">Setembro</option>\n          <option value=\"10\">Outubro</option>\n          <option value=\"11\">Novembro</option>\n          <option value=\"12\">Dezembro</option>\n        </select>\n      </div>\n\n      <div class=\"form-group col-md-5\">\n        <label for=\"year\">Ano</label>\n        <select #year name=\"year\" id=\"year\" class=\"form-control\">\n          <option value=\"\">Selecione um ano</option>\n          <option value=\"2016\">2016</option>\n          <option value=\"2017\">2017</option>\n          <option value=\"2018\">2018</option>\n          <option value=\"2019\">2019</option>\n          <option value=\"2020\">2020</option>\n        </select>\n      </div>\n    </div>\n\n    <div class=\"form-row\">\n      <div class=\"col-md text-right\">\n        <button type=\"button\" (click)=\"generateReports()\" class=\"btn btn-primary\">\n          Gerar Relatórios\n        </button>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"card-deck mt-5 mb-5\">\n  <div class=\"card text-center text-white bg-success\">\n    <div class=\"card-header\">\n      TOTAL DE RECEITAS\n    </div>\n    <div class=\"card-body\">\n      <h3 class=\"card-title\">\n        {{revenueTotal}}\n      </h3>\n    </div>\n  </div>\n\n  <div class=\"card text-center text-white bg-danger\">\n    <div class=\"card-header\">\n      TOTAL DE DESPESAS\n    </div>\n    <div class=\"card-body\">\n      <h3 class=\"card-title\">\n        {{expenseTotal}}\n      </h3>\n    </div>\n  </div>\n\n  <div class=\"card text-center text-white bg-info\">\n    <div class=\"card-header\">\n      SALDO\n    </div>\n    <div class=\"card-body\">\n      <h3 class=\"card-title\">\n        {{balance}}\n      </h3>\n    </div>\n  </div>\n</div>\n\n<hr>\n\n<div class=\"row mt-5 mb-4\">\n  <div class=\"col-md-6\">\n    <p-chart type=\"bar\" [data]=\"revenueChartData\" [options]=\"chartOptions\"></p-chart>\n  </div>\n\n  <div class=\"col-md-6\">\n    <p-chart type=\"bar\" [data]=\"expenseChartData\" [options]=\"chartOptions\"></p-chart>\n  </div>\n</div>"

/***/ }),

/***/ "./src/app/pages/reports/reports/reports.component.ts":
/*!************************************************************!*\
  !*** ./src/app/pages/reports/reports/reports.component.ts ***!
  \************************************************************/
/*! exports provided: ReportsComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ReportsComponent", function() { return ReportsComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _categories_shared_category_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../categories/shared/category.service */ "./src/app/pages/categories/shared/category.service.ts");
/* harmony import */ var _entries_shared_entry_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../entries/shared/entry.service */ "./src/app/pages/entries/shared/entry.service.ts");
/* harmony import */ var currency_formatter__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! currency-formatter */ "./node_modules/currency-formatter/index.js");
/* harmony import */ var currency_formatter__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(currency_formatter__WEBPACK_IMPORTED_MODULE_4__);





var ReportsComponent = /** @class */ (function () {
    function ReportsComponent(entryService, categoryService) {
        this.entryService = entryService;
        this.categoryService = categoryService;
        this.expenseTotal = 0;
        this.revenueTotal = 0;
        this.balance = 0;
        this.chartOptions = {
            scales: {
                yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
            }
        };
        this.categories = [];
        this.entries = [];
        this.month = null;
        this.year = null;
    }
    ReportsComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.categoryService.getAll()
            .subscribe(function (categories) { return _this.categories = categories; });
    };
    ReportsComponent.prototype.generateReports = function () {
        var month = this.month.nativeElement.value;
        var year = this.year.nativeElement.value;
        if (!month || !year)
            alert('Você precisa selecionar o Mês e o Ano para gerar os relatórios');
        else
            this.entryService.getByMonthAndYear(month, year).subscribe(this.setValues.bind(this));
    };
    ReportsComponent.prototype.setValues = function (entries) {
        this.entries = entries;
        this.calculateBalance();
        this.setChartData();
    };
    ReportsComponent.prototype.calculateBalance = function () {
        var expenseTotal = 0;
        var revenueTotal = 0;
        this.entries.forEach(function (entry) {
            if (entry.type == 'revenue')
                revenueTotal += currency_formatter__WEBPACK_IMPORTED_MODULE_4___default.a.unformat(entry.amount, { code: 'BRL' });
            else
                expenseTotal += currency_formatter__WEBPACK_IMPORTED_MODULE_4___default.a.unformat(entry.amount, { code: 'BRL' });
        });
        this.expenseTotal = currency_formatter__WEBPACK_IMPORTED_MODULE_4___default.a.format(expenseTotal, { code: 'BRL' });
        this.revenueTotal = currency_formatter__WEBPACK_IMPORTED_MODULE_4___default.a.format(revenueTotal, { code: 'BRL' });
        this.balance = currency_formatter__WEBPACK_IMPORTED_MODULE_4___default.a.format(revenueTotal - expenseTotal, { code: 'BRL' });
    };
    ReportsComponent.prototype.setChartData = function () {
        this.revenueChartData = this.getChartData('revenue', 'Gráfico de Receitas', '#9CCC65');
        this.expenseChartData = this.getChartData('expense', 'Gráfico de Despesas', '#e03131');
    };
    ReportsComponent.prototype.getChartData = function (entryType, title, color) {
        var _this = this;
        var chartData = [];
        this.categories.forEach(function (category) {
            // filtering entries by category and type
            var filteredEntries = _this.entries.filter(function (entry) { return (entry.categoryId == category.id) && (entry.type == entryType); });
            // if found entries, then sum entries amount and add to chartData
            if (filteredEntries.length > 0) {
                var totalAmount = filteredEntries.reduce(function (total, entry) { return total + currency_formatter__WEBPACK_IMPORTED_MODULE_4___default.a.unformat(entry.amount, { code: 'BRL' }); }, 0);
                chartData.push({
                    categoryName: category.name,
                    totalAmount: totalAmount
                });
            }
        });
        return {
            labels: chartData.map(function (item) { return item.categoryName; }),
            datasets: [{
                    label: title,
                    backgroundColor: color,
                    data: chartData.map(function (item) { return item.totalAmount; })
                }]
        };
    };
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])('month'),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ElementRef"])
    ], ReportsComponent.prototype, "month", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])('year'),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ElementRef"])
    ], ReportsComponent.prototype, "year", void 0);
    ReportsComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-reports',
            template: __webpack_require__(/*! ./reports.component.html */ "./src/app/pages/reports/reports/reports.component.html"),
            styles: [__webpack_require__(/*! ./reports.component.css */ "./src/app/pages/reports/reports/reports.component.css")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_entries_shared_entry_service__WEBPACK_IMPORTED_MODULE_3__["EntryService"], _categories_shared_category_service__WEBPACK_IMPORTED_MODULE_2__["CategoryService"]])
    ], ReportsComponent);
    return ReportsComponent;
}());



/***/ })

}]);
//# sourceMappingURL=pages-reports-reports-module.js.map