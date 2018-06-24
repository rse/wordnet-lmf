--
--  WordNet-LMF -- WordNet Lexical Markup Framework (LMF)
--  Copyright (c) 2018 Ralf S. Engelschall <rse@engelschall.com>
--
--  Permission is hereby granted, free of charge, to any person obtaining
--  a copy of this software and associated documentation files (the
--  "Software"), to deal in the Software without restriction, including
--  without limitation the rights to use, copy, modify, merge, publish,
--  distribute, sublicense, and/or sell copies of the Software, and to
--  permit persons to whom the Software is furnished to do so, subject to
--  the following conditions:
--
--  The above copyright notice and this permission notice shall be included
--  in all copies or substantial portions of the Software.
--
--  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
--  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
--  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
--  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
--  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
--  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
--  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
--

CREATE TABLE LMF (
    created                DATE
);

CREATE TABLE Lexicon (
    id                     TEXT,
    label                  TEXT,
    language               TEXT,
    email                  TEXT,
    license                TEXT,
    version                TEXT
);

CREATE TABLE LexicalEntry (
    id                     TEXT NOT NULL
);

CREATE TABLE Lemma (
    lexicalEntryId         TEXT NOT NULL,
    writtenForm            TEXT NOT NULL,
    partOfSpeech           VARCHAR(1) NOT NULL
);

CREATE TABLE Sense (
    lexicalEntryId         TEXT NOT NULL,
    id                     TEXT,
    synset                 TEXT NOT NULL
);

CREATE TABLE Form (
    lexicalEntryId         TEXT NOT NULL,
    writtenForm            TEXT NOT NULL
);

CREATE TABLE SyntacticalBehaviour (
    lexicalEntryId         TEXT NOT NULL,
    subcategorizationFrame TEXT NOT NULL
);

CREATE TABLE Synset (
    id                     TEXT NOT NULL,
    partOfSpeech           VARCHAR(1)
);

CREATE TABLE Definition (
    synsetId               TEXT,
    language               TEXT,
    sourceSense            TEXT
);

CREATE TABLE ILIDefinition (
    synsetId               TEXT,
    status                 TEXT,
    note                   TEXT,
    confidenceScore        TEXT
);

CREATE TABLE SynsetRelation (
    synsetId               TEXT,
    target                 TEXT,
    relType                TEXT
);

CREATE TABLE Example (
    synsetId               TEXT,
    senseId                TEXT,
    language               TEXT,
    note                   TEXT,
    confidenceScore        TEXT
);

CREATE TABLE Count (
    senseId                TEXT,
    status                 TEXT,
    note                   TEXT,
    confidenceScore        TEXT
);

CREATE TABLE SenseRelation (
    senseId                TEXT,
    target                 TEXT,
    relType                TEXT NOT NULL
);

CREATE TABLE Tag (
    senseId                TEXT,
    tagId                  TEXT,
    category               TEXT NOT NULL
);

