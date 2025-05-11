/*
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
const path          = require("path")
const fs            = require("mz/fs")

/*  external requirements  */
const SQLite        = require("better-sqlite3")
const SAX           = require("sax")
const Saxophone     = require("saxophone")
const EasySAX       = require("easysax")
const sql           = require("sql-bricks")
const YAML          = require("js-yaml")
const csvLine       = require("csv-line")
const Table         = require("cli-table")

/*  define the API class  */
class API {
    constructor (options = {}) {
        this.options = Object.assign({}, {
            database: null
        }, options)
        if (this.options.database === null)
            throw new Error("no database path given")
        this.db = null
    }
    async open () {
        if (this.db !== null)
            throw new Error("database already open")
        const existed = await fs.exists(this.options.database)
        this.db = new SQLite(this.options.database)
        if (!existed) {
            let sql = await fs.readFile(path.join(__dirname, "wordnet-lmf-db.sql"), { encoding: "utf8" })
            sql = sql.replace(/^--.*?\r?\n/mg, "")
            await this.db.exec(sql)
        }
    }
    async import (xmlFile, options = {}) {
        /*  determine options  */
        options = Object.assign({}, {
            parser: "easysax",
            parseEntities: 2
        }, options)

        /*  sanity check usage context  */
        if (this.db === null)
            throw new Error("database still not open")
        if (!options.parser.match(/^(?:easysax|saxophone|sax)$/))
            throw new Error(`invalid parser "${options.parser}"`)

        /*  read LMF XML file  */
        if (!await fs.exists(xmlFile))
            throw new Error(`invalid LMF XML file "${xmlFile}": file not existing`)
        let xmlData = await fs.readFile(xmlFile, { encoding: "utf8" })

        /*  prepare parsing LMF XML file and generating SQL DDL  */
        let ddl = ""
        const stack = [ { name: "LMF", attributes: {} } ]

        /*  common XML node processing function  */
        const orElse = (value, def) => {
            if (value === undefined)
                value = def
            return value
        }
        const processNode = (node) => {
            if (node.name === "Lexicon")
                ddl += sql.insert("Lexicon", {
                    id:                     orElse(node.attributes.id,       null),
                    label:                  orElse(node.attributes.label,    null),
                    language:               orElse(node.attributes.language, null),
                    email:                  orElse(node.attributes.email,    null),
                    license:                orElse(node.attributes.license,  null),
                    version:                orElse(node.attributes.version,  null)
                }) + ";\n"
            else if (node.name === "LexicalEntry")
                ddl += sql.insert("LexicalEntry", {
                    id:                     orElse(node.attributes.id, null)
                }) + ";\n"
            else if (node.name === "Lemma")
                ddl += sql.insert("Lemma", {
                    lexicalEntryId:         orElse(stack[0].attributes.id, null),
                    writtenForm:            orElse(node.attributes.writtenForm,  null),
                    partOfSpeech:           orElse(node.attributes.partOfSpeech, null)
                }) + ";\n"
            else if (node.name === "Sense")
                ddl += sql.insert("Sense", {
                    lexicalEntryId:         orElse(stack[0].attributes.id, null),
                    id:                     orElse(node.attributes.id, null),
                    synset:                 orElse(node.attributes.synset, null)
                }) + ";\n"
            else if (node.name === "Form")
                ddl += sql.insert("Form", {
                    lexicalEntryId:         orElse(stack[0].attributes.id, null),
                    writtenForm:            orElse(node.attributes.writtenForm, null)
                }) + ";\n"
            else if (node.name === "SyntacticalBehaviour")
                ddl += sql.insert("SyntacticalBehaviour", {
                    lexicalEntryId:         orElse(stack[0].attributes.id, null),
                    subcategorizationFrame: orElse(node.attributes.subcategorizationFrame, null)
                }) + ";\n"
            else if (node.name === "Synset")
                ddl += sql.insert("Synset", {
                    id:                     orElse(node.attributes.id, null),
                    partOfSpeech:           orElse(node.attributes.partOfSpeech, null)
                }) + ";\n"
            else if (node.name === "Definition")
                ddl += sql.insert("Definition", {
                    synsetId:               orElse(stack[0].attributes.id, null),
                    language:               orElse(node.attributes.language, null),
                    sourceSense:            orElse(node.attributes.sourceSense, null)
                }) + ";\n"
            else if (node.name === "ILIDefinition")
                ddl += sql.insert("ILIDefinition", {
                    synsetId:               orElse(stack[0].attributes.id, null),
                    status:                 orElse(node.attributes.status, null),
                    note:                   orElse(node.attributes.note, null),
                    confidenceScore:        orElse(node.attributes.confidenceScore, null)
                }) + ";\n"
            else if (node.name === "SynsetRelation")
                ddl += sql.insert("SynsetRelation", {
                    synsetId:               orElse(stack[0].attributes.id, null),
                    target:                 orElse(node.attributes.target, null),
                    relType:                orElse(node.attributes.relType, null)
                }) + ";\n"
        }

        /*  execute XML parser  */
        if (options.parser === "sax") {
            /*  SAX: standard-compliant, slower (16s for 90MB XML)  */
            await new Promise((resolve, reject) => {
                const parser = SAX.parser(true, {
                    trim:      true,
                    normalize: true,
                    xmlns:     false,
                    position:  false
                })
                parser.onopentag = (node) => {
                    if (!(typeof node.attributes === "object" && Object.keys(node.attributes).length > 0))
                        node.attributes = {}
                    Object.keys(node.attributes).forEach((name) => {
                        for (let i = 0; i < options.parseEntities; i++)
                            node.attributes[name] = Saxophone.parseEntities(node.attributes[name])
                    })
                    processNode(node)
                    stack.unshift(node)
                }
                parser.onclosetag = (name) => {
                    stack.shift()
                }
                parser.onerror = (err) => {
                    reject(err)
                }
                parser.onend = () => {
                    resolve()
                }
                parser.write(xmlData).close()
            })
        }
        else if (options.parser === "saxophone") {
            /*  Saxophone: less standard-compliant, faster (10s for 90MB XML) */
            await new Promise((resolve, reject) => {
                const parser = new Saxophone()
                parser.on("tagopen", (tag) => {
                    const node = { name: tag.name, attributes: Saxophone.parseAttrs(tag.attrs) }
                    Object.keys(node.attributes).forEach((name) => {
                        for (let i = 0; i < options.parseEntities; i++)
                            node.attributes[name] = Saxophone.parseEntities(node.attributes[name])
                    })
                    processNode(node)
                    if (!tag.isSelfClosing)
                        stack.unshift(node)
                })
                parser.on("tagclose", (tag) => {
                    if (!tag.isSelfClosing)
                        stack.shift()
                })
                parser.on("error", (err) => {
                    reject(err)
                })
                parser.on("finish", () => {
                    resolve()
                })
                xmlData = xmlData.replace(/<!DOCTYPE.*?>/, "")
                xmlData = xmlData.replace(/([a-z][a-z-])(?:\s+=\s*|\s*=\s+)(["'])/g, "$1=$2")
                parser.parse(xmlData)
            })
        }
        else if (options.parser === "easysax") {
            /*  EasySAX: less standard-compliant, very fast (8s for 90MB XML)  */
            await new Promise((resolve, reject) => {
                const parser = new EasySAX()
                parser.on("startNode", (elementName, getAttr, unEntities, isTagEnd, getStringNode) => {
                    const node = { name: elementName, attributes: getAttr() }
                    if (node.attributes === false)
                        node.attributes = {}
                    Object.keys(node.attributes).forEach((name) => {
                        for (let i = 0; i < options.parseEntities; i++)
                            node.attributes[name] = Saxophone.parseEntities(node.attributes[name])
                    })
                    processNode(node)
                    if (!isTagEnd)
                        stack.unshift(node)
                })
                parser.on("endNode", (elementName, unEntities, isTagStart, getStringNode) => {
                    if (!isTagStart)
                        stack.shift()
                })
                parser.on("error", (err) => {
                    reject(err)
                })
                xmlData = xmlData.replace(/([a-z][a-z-])(?:\s+=\s*|\s*=\s+)(["'])/g, "$1=$2")
                parser.parse(xmlData)
                resolve()
            })
        }

        await this.db.exec("BEGIN TRANSACTION; " + ddl + "COMMIT;")
    }
    async query (query, options = {}) {
        /*  determine options  */
        options = Object.assign({}, {
            format: "table",
            colors: true
        }, options)

        /*  sanity check usage context  */
        if (this.db === null)
            throw new Error("database still not open")
        if (!options.format.match(/^(?:table|csv|json|yaml|raw)$/))
            throw new Error(`invalid format "${options.format}"`)

        /*  execute SQL query  */
        const statement = this.db.prepare(query)
        const results = statement.all()

        /*  post-process results  */
        let output = ""
        if (options.format === "table") {
            const cols = Object.keys(results[0])
            const table = new Table({
                head: cols,
                style: { "padding-left": 1, "padding-right": 1, border: [ ], head: [ ], compact: true },
                colors: false
            })
            results.forEach((row) => {
                const cols = Object.keys(row).map((col) => row[col])
                table.push(cols)
            })
            output = table.toString()
            output += "\n"
        }
        else if (options.format === "csv") {
            const line = Object.keys(results[0])
            output += csvLine.encode(line) + "\n"
            results.forEach((row) => {
                const line = Object.keys(row).map((col) => row[col])
                output += csvLine.encode(line) + "\n"
            })
        }
        else if (options.format === "json")
            output = JSON.stringify(results, null, "    ")
        else if (options.format === "yaml")
            output = YAML.dump(results, { indent: 4 })
        else if (options.format === "raw")
            output = results
        return output
    }
    async close () {
        if (this.db === null)
            throw new Error("database still not open")
        await this.db.close()
        this.db = null
    }
}

/*  export the API class  */
module.exports = API

