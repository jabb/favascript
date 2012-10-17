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

    var core, parse, include;

    core = [
        'var F = {};',
        'F.C = null;',
        'F.S = [];',
        'F.X = {',
            '"run": function(F) {',
                'new Function("F", F.S.pop()[0])(F);',
            '},',
            '"on_word": function(F) {',
                'F.X[F.C](F);',
            '},',
            '"on_number": function(F) {',
                'F.S.push([F.C, "number"]);',
            '},',
            '"on_string": function(F) {',
                'F.S.push([F.C, "string"]);',
            '},',
            '"on_block": function(F) {',
                'F.S.push([F.C, "block"]);',
            '},',
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
                process.stdout.write('F.C = ' + word + ';');
                process.stdout.write('F.X.on_number(F);');
            }
            else if (word === '[') {
                process.stdout.write('F.C = function() {');
            }
            else if (word === ']') {
                process.stdout.write('}; F.X.on_block(F);');
            }
            else if (word[0] === '"') {
                process.stdout.write('F.C = ' + word.replace(/\n/g, '\\\n') + ';');
                process.stdout.write('F.X.on_string(F);');
            }
            else if (word[0] === ':') {
                process.stdout.write('F.C = "' + word.slice(1) + '"' + ';');
                process.stdout.write('F.X.on_string(F);');
            }
            else if (word === 'include') {
                i++;
                if (i != results.length)
                {
                    if (results[i][0] === '"')
                        include(results[i].slice(1, -1) + '.fava');
                    else
                        include(results[i] + '.fava');
                }
            }
            else {
                process.stdout.write('F.C = "' + word + '";');
                process.stdout.write('F.X.on_word(F);');
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
    if (typeof window !== 'undefined') {
        include('fava_core.fava');
    }
    include(args[1]);
    console.log('})(this);');
})(process.argv.slice(1));
