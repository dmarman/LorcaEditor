var timeoutId;
var editor = new MediumEditor('.editable', {
    placeholder: {
        text: 'Escribe aquí'
    },
    extensions: {
        'auto-highlight': new AutoStyleExtension({
            config: {
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
                    words: ['[a-z A-Z0-9áéíóúàèìòùñç&()?¿\',-]{350,}']
                    // words: ['([a-z A-Z0-9áéíóúàèìòùñç]+ ){40,}']
                },
                longSentence: {
                    matchcase: false,
                    wordsonly: false,
                    class: 'long-sentence',
                    words: ['[a-z A-Z0-9áéíóúàèìòùñç&()?¿\',-]{190,}']
                    // words: ['[a-z A-z0-9áéíóúàèìòùñç?¿\',-]{4,}']
                    // words: ['([a-zA-zá]+\s){3,}[a-zA-zá]+[.?!]'] // no funciona
                    // words: ['([a-z A-Z0-9áéíóúàèìòùñç]+ ){30,}'] //bloquea navegador
                }
            }
        })
    }
});

var extension = editor.getExtensionByName('auto-highlight');

editor.subscribe('editableInput', function (event, editable) {

});

var lorca = new Lorca;

editor.on($('.editable'), 'keyup', function(event){

    setTimeout(function(){
        $('#save-status').empty();
    }, 500);

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
        $('#save-status').text('Guardado');
    }, 1200);

    if(event.keyCode == 32){
        //console.log("space");
    }
    let plainText = lorca.clean(editor.getContent()).statistics().analysis();

    $('#level').text(plainText.infz.level);
    $('#words').text(plainText.content.words.length + ' palabras');
    $('#sentences').text(plainText.content.sentences.length + ' frases');
    $('#time').text(plainText.time);

    if(plainText.content.adverbs.length > 0) {
        $('#adverbs').text(plainText.content.adverbs.length + ' adverbios');
    } else {
        $('#adverbs').text('');
    }


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

});
