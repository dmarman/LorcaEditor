//http://scielo.isciii.es/pdf/asisna/v31n2/original2.pdf
//https://github.com/cgiffard/TextStatistics.js
//http://courseware.url.edu.gt/Facultades/Facultad%20de%20Humanidades/Primer%20Ciclo%202011/Estrategias%20de%20comunicacion%20linguistica/Objetos%20de%20Aprendizaje/LyR%20critico/Diferentes%20tipos%20de%20discurso/01%20Diferentes%20tipos%20de%20discurso/frmula_de_velocidad.html

class Lorca {
    constructor() {
        this.content = {
            sentences: [],
            words: [],
            passiveSentences: 0
        };
        this.infz = {};
    }

    clean(text) {
        // all these tags should be preceeded by a full stop. 
        var fullStopTags = ['li', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'dd'];

        fullStopTags.forEach(function (tag) {
            text = text.replace("</" + tag + ">", ".");
        });

        text = text
            .replace(/<[^>]+>/g, "")				    // Strip tags
            .replace(/[,:;()\/&+]|\-\-/g, " ")          // Replace commas, hyphens etc (count them as spaces)
            .replace(/[\.!?]/g, ".")					// Unify terminators
            .replace(/^\s+/, "")						// Strip leading whitespace
            .replace(/[\.]?(\w+)[\.]?(\w+)@(\w+)[\.](\w+)[\.]?/g, "$1$2@$3$4")	// strip periods in email addresses (so they remain counted as one word)
            .replace(/[ ]*(\n|\r\n|\r)[ ]*/g, ".")	    // Replace new lines with periods
            .replace(/([\.])[\.]+/g, ".")			    // Check for duplicated terminators
            .replace(/[ ]*([\.])/g, ". ")				// Pad sentence terminators
            .replace(/\s+/g, " ")						// Remove multiple spaces
            .replace(/\s+$/, "")					    // Strip trailing whitespace
            .replace(/ nbsp/, "");

        if (text.slice(-1) != '.') {
            text += "."; // Add final terminator, just in case it's missing.
        }
        this.content.text = text;
        return this;
    }

    statistics()
    {
        let chars = 0;
        let wordsArray = [];
        let sentencesArray = [];
        let readSpeed = 220; //wpm
        this.content.words = []; // Need to reset, do no remove
        this.content.passiveSentences = 0; // Need to reset, do not remove
        this.content.chars = 0;
        this.content.adverbs = [];
        this.content.spaces = 0;

        if (this.content.text.length > 0) {
            // let pre = this.content.text;
            //
            // if (/\r\n/.test(this.text)) {
            //     pre = this.text.replace(/\r\n/g, '\n'); // exclude double char from being count
            // }
            //
            // let init = pre;
            //
            // if (/\n /.test(this.text)) {
            //     init = pre.replace(/\n /g, '\n'); // exclude newline with a start spacing
            // }

            sentencesArray = this.content.text.trim().match( /[^\.!\?]+[\.!\?]+/g );

            for (let i = 0; i < sentencesArray.length; i++) {

                wordsArray = sentencesArray[i].trim().split(/\s+/);

                this.content.sentences[i] = {value: sentencesArray[i], words: wordsArray, isPassive: false, adverbs: []};

                this.content.words = this.content.words.concat(wordsArray);

                if(/\b(es|son|está|están|eran|era|estaba|estaban|fue|fueron|estuvo|estuvieron|ha sido|han sido|ha estado|han estado|había sido|habían sido|había estado|habían estado|será|serán|estará|estarán|habrá sido|habrán sido|habrá estado|habrán estado|sería|serían|estaría|estarían|habría sido|habrían sido|habría estado|habrían estado) ([a-z]+ |)[a-z]+(ado|ados|ido|idos)\b/.test(sentencesArray[i])) {
                    this.content.sentences[i].isPassive = true;
                    this.content.passiveSentences++;
                }

                for (let k = 0; k < wordsArray.length; k += 1) {
                    this.content.chars += wordsArray[k].length;

                    if(/[a-zA-Z0-9áéíóúàèìòùñç]+mente\b/.test(wordsArray[k])){
                        this.content.adverbs.push(wordsArray[k]);
                        this.content.sentences[i].adverbs.push(wordsArray[k]);
                    }
                }
            }
            this.content.spaces = sentencesArray.length === 1
                ? this.content.text.length - this.content.chars
                : this.content.text.length - this.content.chars - sentencesArray.length;
        }

        this.time = Math.round(60*this.content.words.length/readSpeed) + ' segundos'; // seconds

        if(60*this.content.words.length/readSpeed > 60) {
           this.time = Math.round(this.content.words.length/readSpeed) + ' minutos'; // seconds
        }

        this.content.syllables = silabas(this.content.text).syllables();
        this.content.sentences.length = Object.keys(this.content.sentences).length;

        return this;
    }
    
    analysis()
    {
        let syllablesPerWord = this.content.syllables.length/this.content.words.length;
        let wordsPerSentence = this.content.words.length/this.content.sentences.length;
        let infz = Math.abs(206.835 - 62.3*syllablesPerWord - wordsPerSentence);
        let level = '';
        let grado = '';

        if(infz > 0 && infz < 40){
            level = "Muy difícil";
            grado = "";
        } else if (infz > 40 && infz < 55){
            level ="Algo difícil";
            grado = "";
        } else if (infz > 55 && infz < 65){
            level ="Normal";
            grado = "";
        } else if (infz > 65 && infz < 80){
            level ="Bastante fácil";
            grado = "";
        } else if (infz > 80){
            level ="Muy fácil";
            grado = "";
        }
        this.infz.value = Math.round(infz);
        this.infz.level = level;
        this.infz.percentage = Math.round(100*this.infz.value/146);

        return this;
    }


}


function silabas(word) {
    var stressedFound = false;
    var stressed = 0;
    var letterAccent = -1;

    var wordLength = word.length;
    var positions = [];

    this.statistics = function () {
        let lines = 0;
        let words = 0;
        let chars = 0;
        let spaces = 0;
        if (word.length > 0) {
            let pre = word;
            if (/\r\n/.test(word)) pre = word.replace(/\r\n/g, '\n'); // exclude double char from bieng count
            let init = pre;
            if (/\n /.test(word)) init = pre.replace(/\n /g, '\n'); // exclude newline with a start spacing
            const linesArr = init.trim().split(/\r|\n/);
            lines = linesArr.length;
            let char;
            for (let i = 0; i < lines; i += 1) {
                const wordsArr = linesArr[i].trim().split(/\s+/);
                for (let k = 0; k < wordsArr.length; k += 1) {
                    char = wordsArr[k].length;
                    chars += char;
                    if (char > 1) words += 1;
                }
            }
            spaces = lines === 1
                ? pre.length - chars
                : pre.length - chars - lines;
        }
        return {lines, words, chars, spaces};
    };

    function process () {
        var numSyl = 0;

        // Look for syllables in the word
        for (var i = 0; i < wordLength;) {
            positions[numSyl++] = i;

            i = onset(i);
            i = nucleus(i);
            i = coda(i);

            if (stressedFound && stressed == 0) {
                stressed = numSyl; // it marks the stressed syllable
            }
        }

        // If the word has not written accent, the stressed syllable is determined
        // according to the stress rules

        if (!stressedFound) {
            if (numSyl < 2) stressed = numSyl;  // Monosyllables
            else {                              // Polysyllables
                var endLetter  = toLower(wordLength - 1);

                if ((!isConsonant(wordLength - 1) || (endLetter == 'y')) ||
                    (((endLetter == 'n') || (endLetter == 's') && !isConsonant(wordLength - 2))))
                    stressed = numSyl - 1;  // Stressed penultimate syllable
                else
                    stressed = numSyl;      // Stressed last syllable
            }
        }
    }

    function onset(pos) {
        var lastConsonant = 'a';

        while( pos < wordLength && (isConsonant(pos) && toLower(pos) != 'y') ) {
            lastConsonant = toLower(pos);
            pos ++;
        }

        // (q | g) + u (example: queso, gueto)
        if (pos < wordLength - 1) {
            if (toLower(pos) == 'u') {
                if (lastConsonant == 'q') {
                    pos++;
                } else if (lastConsonant == 'g') {
                    var letter = toLower(pos + 1);
                    if (letter == 'e' || letter == 'é' ||  letter == 'i' || letter == 'í') {
                        pos++;
                    }
                }
            } else if ( toLower(pos) == 'ü' && lastConsonant == 'g')  {
                // The 'u' with diaeresis is added to the consonant
                pos++;
            }
        }

        return pos;
    }

    function nucleus(pos) {
        // Saves the type of previous vowel when two vowels together exists
        var previous = 0;
        // 0 = open
        // 1 = close with written accent
        // 2 = close

        if (pos >= wordLength) return pos; // ¡¿Doesn't it have nucleus?!

        // Jumps a letter 'y' to the starting of nucleus, it is as consonant
        if (toLower(pos) == 'y') pos++;

        // First vowel
        if (pos < wordLength) {
            switch (toLower(pos)) {
                // Open-vowel or close-vowel with written accent
                case 'á': case 'à':
                case 'é': case 'è':
                case 'ó': case 'ò':
                letterAccent = pos;
                stressedFound   = true;
                // Open-vowel
                case 'a': case 'e': case 'o':
                previous = 0;
                pos++;
                break;
                // Close-vowel with written accent breaks some possible diphthong
                case 'í': case 'ì':
                case 'ú': case 'ù': case 'ü':
                letterAccent = pos;
                pos++;
                stressedFound = true;
                return pos;
                // Close-vowel
                case 'i': case 'I':
                case 'u': case 'U':
                previous = 2;
                pos++;
                break;
            }
        }

        // If 'h' has been inserted in the nucleus then it doesn't determine diphthong neither hiatus

        var aitch = false;
        if (pos < wordLength) {
            if (toLower(pos) == 'h') {
                pos++;
                aitch = true;
            }
        }

        // Second vowel

        if (pos < wordLength) {
            switch (toLower(pos)) {
                // Open-vowel with written accent
                case 'á': case 'à':
                case 'é': case 'è':
                case 'ó': case 'ò':
                letterAccent = pos;
                if (previous != 0) {
                    stressedFound    = true;
                }
                // Open-vowel
                case 'a':
                case 'e':
                case 'o':
                    if (previous == 0) {    // Two open-vowels don't form syllable
                        if (aitch) pos--;
                        return pos;
                    } else {
                        pos++;
                    }

                    break;

                // Close-vowel with written accent, can't be a triphthong, but would be a diphthong
                case 'í': case 'ì':
                case 'ú': case 'ù':
                letterAccent = pos;

                if (previous != 0) {  // Diphthong
                    stressedFound    = true;
                    pos++;
                }
                else if (aitch) pos--;

                return pos;
                // Close-vowel
                case 'i':
                case 'u': case 'ü':
                if (pos < wordLength - 1) { // ¿Is there a third vowel?
                    if (!isConsonant(pos + 1)) {
                        if (toLower(pos - 1) == 'h') pos--;
                        return pos;
                    }
                }

                // Two equals close-vowels don't form diphthong
                if (toLower(pos) != toLower(pos - 1)) pos++;

                return pos;  // It is a descendent diphthong
            }
        }

        // Third vowel?

        if (pos < wordLength) {
            if ((toLower(pos) == 'i') || (toLower(pos) == 'u')) { // Close-vowel
                pos++;
                return pos;  // It is a triphthong
            }
        }

        return pos;
    }

    function coda(pos) {

        if (pos >= wordLength || !isConsonant(pos)) {
            return pos; // Syllable hasn't coda
        } else if (pos == wordLength - 1)  { // End of word
            pos++;
            return pos;
        }

        // If there is only a consonant between vowels, it belongs to the following syllable
        if (!isConsonant(pos + 1)) return pos;

        var c1 = toLower(pos);
        var c2 = toLower(pos + 1);

        // Has the syllable a third consecutive consonant?

        if (pos < wordLength - 2) {
            var c3 = toLower(pos + 2);

            if (!isConsonant(pos + 2)) { // There isn't third consonant
                // The groups ll, ch and rr begin a syllable

                if ((c1 == 'l') && (c2 == 'l')) return pos;
                if ((c1 == 'c') && (c2 == 'h')) return pos;
                if ((c1 == 'r') && (c2 == 'r')) return pos;

                // A consonant + 'h' begins a syllable, except for groups sh and rh
                if ((c1 != 's') && (c1 != 'r') &&
                    (c2 == 'h'))
                    return pos;

                // If the letter 'y' is preceded by the some
                //      letter 's', 'l', 'r', 'n' or 'c' then
                //      a new syllable begins in the previous consonant
                // else it begins in the letter 'y'

                if ((c2 == 'y')) {
                    if ((c1 == 's') || (c1 == 'l') || (c1 == 'r') || (c1 == 'n') || (c1 == 'c'))
                        return pos;

                    pos++;
                    return pos;
                }

                // groups: gl - kl - bl - vl - pl - fl - tl

                if ((((c1 == 'b')||(c1 == 'v')||(c1 == 'c')||(c1 == 'k')||
                        (c1 == 'f')||(c1 == 'g')||(c1 == 'p')||(c1 == 't')) &&
                        (c2 == 'l')
                    )
                ) {
                    return pos;
                }

                // groups: gr - kr - dr - tr - br - vr - pr - fr

                if ((((c1 == 'b')||(c1 == 'v')||(c1 == 'c')||(c1 == 'd')||(c1 == 'k')||
                        (c1 == 'f')||(c1 == 'g')||(c1 == 'p')||(c1 == 't')) &&
                        (c2 == 'r')
                    )
                ) {
                    return pos;
                }

                pos++;
                return pos;
            }
            else { // There is a third consonant
                if ((pos + 3) == wordLength) { // Three consonants to the end, foreign words?
                    if ((c2 == 'y')) {  // 'y' as vowel
                        if ((c1 == 's') || (c1 == 'l') || (c1 == 'r') || (c1 == 'n') || (c1 == 'c'))
                            return pos;
                    }

                    if (c3 == 'y') { // 'y' at the end as vowel with c2
                        pos++;
                    }
                    else {  // Three consonants to the end, foreign words?
                        pos += 3;
                    }
                    return pos;
                }

                if ((c2 == 'y')) { // 'y' as vowel
                    if ((c1 == 's') || (c1 == 'l') || (c1 == 'r') || (c1 == 'n') || (c1 == 'c'))
                        return pos;

                    pos++;
                    return pos;
                }

                // The groups pt, ct, cn, ps, mn, gn, ft, pn, cz, tz and ts begin a syllable
                // when preceded by other consonant

                if ((c2 == 'p') && (c3 == 't') ||
                    (c2 == 'c') && (c3 == 't') ||
                    (c2 == 'c') && (c3 == 'n') ||
                    (c2 == 'p') && (c3 == 's') ||
                    (c2 == 'm') && (c3 == 'n') ||
                    (c2 == 'g') && (c3 == 'n') ||
                    (c2 == 'f') && (c3 == 't') ||
                    (c2 == 'p') && (c3 == 'n') ||
                    (c2 == 'c') && (c3 == 'z') ||
                    (c2 == 't') && (c3 == 's') ||
                    (c2 == 't') && (c3 == 's'))
                {
                    pos++;
                    return pos;
                }

                if ((c3 == 'l') || (c3 == 'r') ||    // The consonantal groups formed by a consonant
                    // following the letter 'l' or 'r' cann't be
                    // separated and they always begin syllable
                    ((c2 == 'c') && (c3 == 'h')) ||  // 'ch'
                    (c3 == 'y')) {                   // 'y' as vowel
                    pos++;  // Following syllable begins in c2
                }
                else
                    pos += 2; // c3 begins the following syllable
            }
        }
        else {
            if ((c2 == 'y')) return pos;

            pos +=2; // The word ends with two consonants
        }

        return pos;
    }

    function toLower(pos) {
        return word[pos].toLowerCase();
    }

    function isConsonant(pos) {
        var c = word[pos];
        switch (c) {
            // Open-vowel or close-vowel with written accent
            case 'a': case 'á': case 'A': case 'Á': case 'à': case 'À':
            case 'e': case 'é': case 'E': case 'É': case 'è': case 'È':
            case 'í': case 'Í': case 'ì': case 'Ì':
            case 'o': case 'ó': case 'O': case 'Ó': case 'ò': case 'Ò':
            case 'ú': case 'Ú': case 'ù': case 'Ù':
            // Close-vowel
            case 'i': case 'I':
            case 'u': case 'U':
            case 'ü': case 'Ü':
            return false;
        }
        return true;
    }

    process();

    this.positions = function () {
        return positions;
    };

    this.syllables = function () {
        var syllables = [];
        for (var i = 0; i < positions.length; i++) {
            var start = positions[i];
            var end = wordLength;
            if (positions.length > i+1) {
                end = positions[i + 1];
            }
            var seq = word.slice(start, end);
            syllables.push(seq);
        }
        return syllables;
    };

    return this;
}    