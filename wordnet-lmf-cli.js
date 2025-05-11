#!/usr/bin/env node
/*!
**  WordNet-LMF -- WordNet Lexical Markup Framework (LMF)
**  Copyright (c) 2018-2025 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*  internal requirements  */
const fs         = require("mz/fs")

/*  external requirements  */
const yargs      = require("yargs")
const chalk      = require("chalk")

/*  local requirements  */
const LMF        = require("./wordnet-lmf-api.js")

;(async () => {
    /*  load my package information  */
    const my = require("./package.json")

    /*  command-line option parsing  */
    const argv = await yargs
        /* eslint indent: off */
        .usage("Usage: $0 [option ...] <command> [option ...] [arg ...]")
        .help("h")
            .alias("h", "help")
            .default("h", false)
            .describe("h", "show usage help")
        .number("v")
            .alias("v", "verbose")
            .default("v", 0)
            .describe("v", "level of displaying verbose messages")
        .boolean("V")
            .alias("V", "version")
            .default("V", false)
            .describe("V", "display program version informaton")
        .string("d")
            .alias("d", "database")
            .nargs("d", 1)
            .default("d", null)
            .describe("d", "LMF DB file")
        .version(false)
        .strict()
        .showHelpOnFail(true)
        .demandCommand(0)
        .command("import <xml-file>", "import LMF XML into LMF DB", (yargs) => {
            yargs
                .positional("xml-file", { describe: "LMF XML input file", type: "string" })
                .choices("p", [ "sax", "saxophone", "easysax" ])
                    .alias("p", "parser")
                    .default("p", "sax")
                    .describe("p", "XML SAX parser to use")
                .number("e")
                    .alias("e", "parse-entities")
                    .nargs("e", 1)
                    .default("e", 1)
                    .describe("e", "number of times to parse and expand XML entities")
        }, async (argv) => {
            try {
                const lmf = new LMF({ database: argv.database })
                await lmf.open()
                await lmf.import(argv.xmlFile, {
                    parser: argv.parser,
                    parseEntities: argv.parseEntities
                })
                await lmf.close()
                process.exit(0)
            }
            catch (err) {
                process.stderr.write(`wordnet-lmf-cli: import: ERROR: ${err.message}\n`)
                process.exit(1)
            }
        })
        .command("query <sql-query>", "query LMF DB", (yargs) => {
            yargs
                .positional("sql-query", { describe: "one SQL query", type: "string" })
                .choices("f", [ "table", "csv", "json", "yaml" ])
                    .alias("f", "format")
                    .default("f", "table")
                    .describe("f", "output format")
                .string("o")
                    .alias("o", "output")
                    .nargs("o", 1)
                    .default("o", "-")
                    .describe("o", "output file")
        }, async (argv) => {
            try {
                const lmf = new LMF({ database: argv.database })
                await lmf.open()
                const result = await lmf.query(argv.sqlQuery, { format: argv.format })
                await lmf.close()
                if (argv.output === "-")
                    process.stdout.write(result)
                else
                    await fs.writeFile(argv.output, result, { encoding: "utf8" })
                process.exit(0)
            }
            catch (err) {
                process.stderr.write(`wordnet-lmf-cli: query: ERROR: ${err.message}\n`)
                process.exit(1)
            }
        })
        .parse(process.argv.slice(2))

    /*  short-circuit processing of "-V" command-line option  */
    if (argv.version) {
        process.stderr.write(`${my.name} ${my.version} <${my.homepage}>\n`)
        process.stderr.write(`${my.description}\n`)
        process.stderr.write(`Copyright (c) 2018-2025 ${my.author.name} <${my.author.url}>\n`)
        process.stderr.write(`Licensed under ${my.license} <http://spdx.org/licenses/${my.license}.html>\n`)
        process.exit(0)
    }

    /*  sanity check usage  */
    if (argv._.length === 0) {
        process.stderr.write("wordnet-lmf-cli: ERROR: missing command\n")
        process.exit(1)
    }
})().catch((err) => {
    /*  fatal error  */
    process.stderr.write(`wordnet-lmf: ${chalk.red("ERROR:")} ${err.message} ${err.stack}\n`)
    process.exit(1)
})

