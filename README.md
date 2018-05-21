
WordNet-LMF
===========

WordNet Lexical Markup Framework (LMF)

<p/>
<img src="https://nodei.co/npm/wordnet-lmf.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/wordnet-lmf.png" alt=""/>

About
-----

This is a [Node.js](https://nodejs.org) Command-Line Interface (CLI)
and underlying Application Programming Interface (API) for parsing
[WordNet-LMF XML](https://github.com/globalwordnet/schemas) format files
and importing the data into compact SQLite database file.

The motivation for this approach is: a 100MB LMF XML consumes about
1GB of RAM (due to the XML DOM) and is very slow on querying, while
the corresponding SQLite database file is just about 20% of the size
of the LMF XML file and can be queried very fast and with harmless RAM
consumption.

Data Model
----------

Based on the [WordNet-LMF XML](https://github.com/globalwordnet/schemas) DTD,
we derived and documented the [LMF Data Model](wordnet-lmf-dm.pdf) we are using in
this NPM module.

Links
-----

- [Global WordNet](http://globalwordnet.org/)
- [Princeton WordNet (PWN)](https://wordnet.princeton.edu/)
- [Open Multilingual Wordnet](http://compling.hss.ntu.edu.sg/omw/)

Installation
------------

```shell
$ npm install wordnet-lmf
```

Command-Line Interface (CLI)
----------------------------

```sh
FIXME
```

Application Programming Interface (API)
---------------------------------------

```js
FIXME
```

License
-------

Copyright (c) 2018 Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

