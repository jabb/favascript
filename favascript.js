/* Copyright (c) 2012, Michael Patraw
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * The name of Michael Patraw may not be used to endorse or promote
 *       products derived from this software without specific prior written
 *       permission.
 *
 * THIS SOFTWARE IS PROVIDED BY Michael Patraw ''AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL Michael Patraw BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY ,WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
(function (args) {

    "use strict";

    var core, parse, include;

    core = [
        'var _J = {};',
        '_J._S = [];',
        '_J._X = {',
            '"run": function(_J) {',
                'new Function("_J", _J._S.pop()[0])(_J);',
            '},',
            '"_": function(word, type) {',
                'if (type === "number" || type === "string" || type === "block") {',
                    '_J._S.push([word, type]);',
                '}',
                'else if (type === "word") {',
                    '_J._X[word](_J);',
                '}',
                'else {',
                    'console.log("Error: Got type: " + type);',
                '}',
            '}',
        '};',
    ].join('');

    parse = function (str) {
        var word, results, i;
        word = /("[^"]*")|([^\s\n]+)/g;
        results = str.match(word);

        for (i = 0; i < results.length; ++i) {
            word = results[i];

            if (word === '') {
            }
            if (!isNaN(word)) {
                process.stdout.write('_J._X._(' + word + ', "number");');
            }
            else if (word === '[') {
                process.stdout.write('_J._X._(function() {');
            }
            else if (word === ']') {
                process.stdout.write('}, "block");');
            }
            else if (word[0] === '"') {
                process.stdout.write('_J._X._("' + word.slice(1, -1).replace(/\n/g, '\\\n') + '", "string");');
            }
            else if (word[0] === ':') {
                process.stdout.write('_J._X._("' + word.slice(1) + '", "string");');
            }
            else if (word[0] === '#') {
                include(word.slice(1));
            }
            else {
                process.stdout.write('_J._X._("' + word + '", "word");');
            }
        }
    }

    include = function (file) {
        var source;
        if (typeof process !== 'undefined') {
            source = require('fs').readFileSync(require('path').resolve(file), 'utf8');
        }
        else {
            source = require('file').path(require('file').cwd()).join(file).read({charset: 'utf-8'});
        }

        parse(source);
    }

    if (!args[1])
        throw new Error('Usage: ' + args[0] + ' FILE');

    process.stdout.write('(function() {');
    process.stdout.write(core);
    include(args[1]);
    console.log('})(this);');
})(process.argv.slice(1));
