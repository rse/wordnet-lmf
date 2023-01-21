
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

This NPM module comes with just the LMF CLI and API for processing LMF
XML files and does not ship with any particular LMF XML files. See the
companion modules [wordnet-lmf-en](https://npmjs.com/wordnet-lmf-en)
and [wordnet-lmf-de](https://npmjs.com/wordnet-lmf-de) for English and
German WordNets in LMF XML/SQLite format.

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
$ wordnet-lmf -d wordnet-lmf-en.db import -f easysax -e 2 wordnet-lmf-en.xml
$ wordnet-lmf -d wordnet-lmf-en.db query "SELECT * FROM Lemma WHERE writtenForm LIKE '%speaker%';"
┌────────────────┬────────────────────────┬──────────────┐
│ lexicalEntryId │ writtenForm            │ partOfSpeech │
├────────────────┼────────────────────────┼──────────────┤
│ w116312        │ Speaker                │ n            │
│ w74130         │ speakerphone           │ n            │
│ w84953         │ speaker identification │ n            │
│ w69725         │ speaker system         │ n            │
│ w42001         │ speakership            │ n            │
│ w116311        │ native speaker         │ n            │
│ w74274         │ intercom speaker       │ n            │
│ w69721         │ loudspeaker            │ n            │
│ w69724         │ loudspeaker system     │ n            │
│ w69722         │ speaker                │ n            │
│ w114606        │ public speaker         │ n            │
│ w69723         │ speaker unit           │ n            │
│ w115745        │ salutatory speaker     │ n            │
│ w117119        │ valedictory speaker    │ n            │
└────────────────┴────────────────────────┴──────────────┘
```

Application Programming Interface (API)
---------------------------------------

```js
(async () => {

    const LMF   = require("wordnet-lmf")
    const LMFen = require("wordnet-lmf-en")

    console.log(LMFen.name)

    let lmf = new LMF({ database: LMFen.db })
    await lmf.open()

    let results = await lmf.query(
        "SELECT * FROM Lemma WHERE writtenForm LIKE '%speaker%';",
        { format: "table" }
    )
    console.log(results)

    results = await lmf.query(`
        SELECT    l.writtenForm  AS writtenForm,
                  l.partOfSpeech AS partOfSpeech,
                  GROUP_CONCAT(s.synset, ";") AS synset
        FROM      Lemma l
        LEFT JOIN Sense s
        ON        s.lexicalEntryId = l.lexicalEntryId
        WHERE     l.writtenForm LIKE '%speaker%'
        GROUP BY  l.writtenForm
    `, { format: "table" })
    console.log(results)

    await lmf.close()

})().catch((err) => {
    console.log(`ERROR: ${err}`)
})
```

```
OMW Princeton WordNet 3.1 (2011-05-26) [156K words, MIT-style]
┌────────────────┬────────────────────────┬──────────────┐
│ lexicalEntryId │ writtenForm            │ partOfSpeech │
├────────────────┼────────────────────────┼──────────────┤
│ w116312        │ Speaker                │ n            │
│ w74130         │ speakerphone           │ n            │
│ w84953         │ speaker identification │ n            │
│ w69725         │ speaker system         │ n            │
│ w42001         │ speakership            │ n            │
│ w116311        │ native speaker         │ n            │
│ w74274         │ intercom speaker       │ n            │
│ w69721         │ loudspeaker            │ n            │
│ w69724         │ loudspeaker system     │ n            │
│ w69722         │ speaker                │ n            │
│ w114606        │ public speaker         │ n            │
│ w69723         │ speaker unit           │ n            │
│ w115745        │ salutatory speaker     │ n            │
│ w117119        │ valedictory speaker    │ n            │
└────────────────┴────────────────────────┴──────────────┘
┌────────────────────────┬──────────────┬─────────────────────────────────────┐
│ writtenForm            │ partOfSpeech │ synset                              │
├────────────────────────┼──────────────┼─────────────────────────────────────┤
│ Speaker                │ n            │ eng-10-10631309-n                   │
│ intercom speaker       │ n            │ eng-10-04292572-n                   │
│ loudspeaker            │ n            │ eng-10-03691459-n                   │
│ loudspeaker system     │ n            │ eng-10-03691459-n                   │
│ native speaker         │ n            │ eng-10-10631131-n                   │
│ public speaker         │ n            │ eng-10-10380672-n                   │
│ salutatory speaker     │ n            │ eng-10-10549315-n                   │
│ speaker                │ n            │ eng-10-03691459-n;eng-10-10630188-n │
│ speaker identification │ n            │ eng-10-05763767-n                   │
│ speaker system         │ n            │ eng-10-03691459-n                   │
│ speaker unit           │ n            │ eng-10-03691459-n                   │
│ speakerphone           │ n            │ eng-10-04270371-n                   │
│ speakership            │ n            │ eng-10-00604424-n                   │
│ valedictory speaker    │ n            │ eng-10-10745006-n                   │
└────────────────────────┴──────────────┴─────────────────────────────────────┘
```

License
-------

Copyright (c) 2018-2023 Dr. Ralf S. Engelschall (http://engelschall.com/)

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

