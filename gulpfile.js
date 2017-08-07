// Most of code courtesy https://semaphoreci.com/community/tutorials/getting-started-with-gulp-js

const gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    favicons = require('gulp-favicons'),
    livereload = require('gulp-livereload'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream')

// Compile SASS
gulp.task('sass', function() {
  gulp.src('src/sass/**/*.sass')
    .pipe(sass({style: 'expanded'}))
      .on('error', gutil.log)
    .pipe(gulp.dest('public/css'))
    .pipe(livereload())
})

// Watch
gulp.task('watch', function() {
  gulp.watch('src/sass/**/*.sass', ['sass'])
  gulp.watch('public/img/_favicon_template.png', ['favicon'])
  gulp.watch('views/**/*.pug', function () {
    livereload.reload()
  })
  gulp.watch('src/**/*.js', ['js'])
})

// Compile JS
gulp.task('js', function() {
    return browserify({ entries: ["./src/js/main.js"] })
    .on('error', gutil.log)
    .bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('./public/js'))
    .pipe(livereload())
})

// Generate favicon
gulp.task('favicon', function () {
    return gulp.src('src/img/_favicon_template.png')
    .pipe(favicons({
        path: 'img/'
    }))
    .on('error', gutil.log)
    .pipe(gulp.dest('./public'))
});

gulp.task('livereload', function () {
  livereload({ start: true })
})

gulp.task('default', ['livereload', 'sass', 'js', 'favicon', 'watch'])
