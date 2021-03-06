# LogbookJS - Console Logging Utility

Utility for creating custom console logging functions.

## Features

* Create unlimited logging functions, all attached to `console`
* Preserves call location (file, line number)
* Create different log styles with CSS (background, foreground, font size, etc)
* Filter which log messages to print to console
* Enable quick access to console loggers (e.g. \_log()), enabled in the global scope (optional, very useful for development)
* Compatible with both Typescript and vanilla Javascript

## How to use

See [src/logbook.js](./src/logbook.js).

## Screenshot

![image](logbook_preview.jpg)
<br>
## eslint

To avoid 'not defined' (`no-undef`) problems, include the following in `.eslintrc`:
<br>
```
{
    extend: ["node_modules/logbookjs/.eslintrc"]
}
```

## Typescript

This project includes global typings for custom `console` functions.

In case they need to be included in `tsconfig.js` or `jsconfig.js`, default type definitions are located in [@types/index.d.ts](@types/index.d.ts) (or when locally installed, probably [node\_modules/logbookjs/@types/index.d.ts](./node_modules/logbookjs/@types/index.d.ts)).

## License
<br>
MIT License

Copyright (c) 2021 Bjornar Egede-Nissen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.