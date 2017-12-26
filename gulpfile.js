var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var babel = require("gulp-babel");

gulp.task('default', function() {
    return gulp.src([
            // './js/medium-editor.min.js',
            // './js/jquery.min.js',
            //'./js/lorca.js',
            // './js/auto-style.js',
            './js/app.js'
        ])
        .pipe(concat('all.js'))
        .pipe(babel())
       // .pipe(uglify())
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(gulp.dest('./dist/'));

});