var timeoutId;
var editor = new MediumEditor('.editable', {
    placeholder: {
        text: 'Escribe aquí'
    },
    extensions: {
        'auto-highlight': new AutoStyleExtension({
            config: {
                passive: {
                    matchcase: false,
                    wordsonly: false,
                    class: 'passive',
                    words: ['\\b(es|son|está|están|eran|era|estaba|estaban|fue|fueron|estuvo|estuvieron|ha sido|han sido|ha estado|han estado|había sido|habían sido|había estado|habían estado|será|serán|estará|estarán|habrá sido|habrán sido|habrá estado|habrán estado|sería|serían|estaría|estarían|habría sido|habrían sido|habría estado|habrían estado) ([a-z]+ |)[a-z]+(ado|ados|ido|idos)\\b']
                },
                longWord: {
                    matchcase: false,
                    wordsonly: false,
                    class: 'long-word',
                    words: ['[a-zA-Záéíóúàèìòùñç]{14,}']
                },
                adverb: {
                    matchcase: false,
                    wordsonly: false,
                    class: 'adverb',
                    words: ['[a-zA-Z0-9áéíóúàèìòùñç]+mente\\b']
                },
                veryLongSentence: {
                    matchcase: false,
                    wordsonly: false,
                    class: 'very-long-sentence',
                    words: ['[a-z A-Z0-9áéíóúàèìòùñç&()%?¿\',-]{350,}']
                    // words: ['([a-z A-Z0-9áéíóúàèìòùñç]+ ){40,}']
                },
                longSentence: {
                    matchcase: false,
                    wordsonly: false,
                    class: 'long-sentence',
                    words: ['[a-z A-Z0-9áéíóúàèìòùñç&()%?¿\',-]{190,}']
                }
            }
        })
    }
});

var extension = editor.getExtensionByName('auto-highlight');

var lorca = new Lorca;

var writeAnalyseButton = $('#write-analyze-button');
var hideOnWritting = $('.hide-on-writting');
var tipList = $('.tip-list');

writeAnalyseButton.click(function(){
    if(writeAnalyseButton.text() == 'Escribir'){
        writeAnalyseButton.text('Analizar');
        hideOnWritting.toggleClass('hidden');
    } else {
        writeAnalyseButton.text('Escribir');
        hideOnWritting.toggleClass('hidden');
        fullanalysis();
    }
});

// Text analysis API call
$('#analysis-button').click(function () {
    let text = lorca.clean(editor.getContent()).content.text;
  
    $.post(
        'https://apiv2.indico.io/apis/multiapi?apis=sentiment,emotion,political',
        JSON.stringify({
            'api_key': "da31014df45323a1f053c796be834921",
            'language': 'spanish',
            'data': text
        })
    ).then(function(res) {
        let obj = JSON.parse(res);

        $('#anger').text(Math.round(100*obj.results.emotion.results.anger) + '%');
        $('#fear').text(Math.round(100*obj.results.emotion.results.fear) + '%');
        $('#joy').text(Math.round(100*obj.results.emotion.results.joy) + '%');
        $('#sadness').text(Math.round(100*obj.results.emotion.results.sadness) + '%');
        $('#surprise').text(Math.round(100*obj.results.emotion.results.surprise) + '%');
        $('#conservative').text(Math.round(100*obj.results.political.results.Conservative) + '%');
        $('#green').text(Math.round(100*obj.results.political.results.Green) + '%');
        $('#liberal').text(Math.round(100*obj.results.political.results.Liberal) + '%');
        $('#libertarian').text(Math.round(100*obj.results.political.results.Libertarian) + '%');
        $('#sentiment').text(Math.round(100*obj.results.sentiment.results) + '%');

    });
});

function fullanalysis(){
    // Auto save
    setTimeout(function(){
        $('#save-status').empty();
    }, 500);

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
        $('#save-status').text('Guardado');
    }, 1200);

    // Text análisis
    var plainText = lorca.clean(editor.getContent()).statistics();
    var list = plainText.getAllFrequencies();
    plainText.getOutlierWordFrequency();
    plainText.getUniqueWordFrequency();
    plainText.getAbsoluteWordFrequency();
    plainText.getPronounsFrequency();
    //plainText.getSyllableHistogram();
    //console.log(plainText.getSentenceHistogram());
    //console.log(plainText);
    
    // Key words
    $('#key-words').text('No hay palabras suficientes');
    if(plainText.content.words.length > 40){
        $('#key-words').text('');
        for(const word in list){
            $('#key-words').append('<div class="key-word">' + word + '</div>');
        }
    }
    
    // Statistics display
    $('#time').text(plainText.time.value);
    $('#units').text(plainText.time.units);
    $('#level').text(plainText.infz.level);
    $('#words').html(plainText.content.words.length);
    $('#sentences').html(plainText.content.sentences.length);

    // Advanced statistics display
    $('#infz').text(plainText.infz.value);
    $('#outlier').text(Math.round(100*plainText.outlierWordFrecuency));
    $('#unique').text(Math.round(100*plainText.uniqueWordFrecuency));
    $('#absolute').text(Math.round(100*plainText.absoluteWordFrequency));
    $('#words-per-sentence').text(plainText.wordsPerSentence.toPrecision(3));
    $('#syllables-per-word').text(plainText.syllablesPerWord.toPrecision(3));
    $('#pronouns').text(Math.round(100*plainText.pronouns.percentage.total));

    // Tip giver
    if(plainText.content.adverbs.length > 0){
        $('#adverbs').html(plainText.content.adverbs.length);
        $('#adverb-list').empty();
        $('#adverb-list').append('<div class="tip adverb-tip">Estos adverbios son innecesarios:</div>');
        for(var adverb in plainText.content.adverbs){
            $('.adverb-tip').append('<div>- ' + plainText.content.adverbs[adverb] + '</div>');
        }
    } else {
        $('#adverbs').html(0);
        $('#adverb-list').empty();
    }
    
    if(plainText.content.passiveSentences > 0){
        $('#passive-sentences').html(plainText.content.passiveSentences);
        $('#passive-list').empty();
        $('#passive-list').append('<div class="tip passive-tip">Convierte estas frases a activas:</div>');

        for(var sentence in plainText.content.sentences){
            if(plainText.content.sentences[sentence].isPassive){
                $('.passive-tip').append('<div>-' + plainText.content.sentences[sentence].value.slice(0, 40) + '..."</div>' );
            }
        }
        
    } else {
        $('#passive-sentences').html(0);
        $('#passive-list').empty();
    }
  
    for(var sentence in plainText.content.sentences){
        if(plainText.content.sentences[sentence].words.length > 30){
            var shouldAddLongTip = true;
        }
    }
    if(shouldAddLongTip){
        $('#long-sentence-list').empty();

        $('#long-sentence-list').append('<div class="tip long-sentence-tip">Estas frases tienen más de 30 palabras:</div>');
        for(var sentence in plainText.content.sentences){
            if(plainText.content.sentences[sentence].words.length > 30){
                $('.long-sentence-tip').append('<div>- "' + plainText.content.sentences[sentence].value.slice(0, 40) + '..."</div>');
                
            }
        }
    }
            
    // Progress bar animation
    function moveBar() {
        var currentPercentage = Math.round(100*$('#progress-value').width()/$('.meter').width());
        var target = plainText.infz.percentage;

        clearInterval(window.id);
        window.id = setInterval(frame, 50);
        function frame() {
            if (target == currentPercentage) {
                clearInterval(window.id);
            } else if(target > currentPercentage) {
                currentPercentage++;
                $('#progress-value').css('width', currentPercentage + '%');
            } else {
                currentPercentage--;
                $('#progress-value').css('width', currentPercentage + '%');
            }

            if(currentPercentage < 25) {
                $('#progress-value').css('background-color', 'red');
            } else if (currentPercentage > 19 && currentPercentage < 38) {
                $('#progress-value').css('background-color', 'orange');
            } else {
                $('#progress-value').css('background-color', 'rgb(43,194,83)');
            }
        }
    }

    moveBar();
}

editor.on($('.editable'), 'keyup', function(event){
    fullanalysis();
});
