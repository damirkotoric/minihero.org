// Most of code courtesy https://semaphoreci.com/community/tutorials/getting-started-with-gulp-js

const gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    browserify = require('gulp-browserify'),
    favicons = require('gulp-favicons'),
    livereload = require('gulp-livereload')

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
  gulp.watch('public/images/_favicon_template.png', ['favicon'])
  gulp.watch('views/**/*.pug', function () {
    livereload.reload()
  })
  gulp.watch('src/**/*.js', ['js'])
})

// Compile JS
gulp.task('js', function () {
  return gulp.src(['./src/js/main.js'])
   .pipe(browserify())
  //  .pipe(uglify())
   .pipe(gulp.dest('./public/js'))
   .pipe(livereload())
});

// Generate favicon
gulp.task('favicon', function () {
    return gulp.src('src/images/_favicon_template.png').pipe(favicons({
        path: 'images/'
    }))
    .on('error', gutil.log)
    .pipe(gulp.dest('./public'))
});

gulp.task('livereload', function () {
  livereload({ start: true })
})

gulp.task('default', ['livereload', 'sass', 'js', 'favicon', 'watch'])
