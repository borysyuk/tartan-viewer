'use strict';

var path = require('path');
var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var prefixer = require('gulp-autoprefixer');
var cleanCss = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');

var sourceStylesDir = path.join(__dirname, '/src/styles');
var targetDir = path.join(__dirname, '/dist');
var targetStylesDir = path.join(targetDir, '/styles');
var targetFontsDir = path.join(targetDir, '/fonts');

var nodeModulesDir = path.join(__dirname, '/node_modules');

gulp.task('default', [
  'vendor.styles',
  'vendor.fonts',
  'application.styles'
]);

gulp.task('application.styles', function() {
  var files = [
    path.join(sourceStylesDir, '/main.less')
  ];
  return gulp.src(files)
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(prefixer({browsers: ['last 4 versions']}))
    .pipe(cleanCss({compatibility: 'ie8'}))
    .pipe(concat('app.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(targetStylesDir));
});

gulp.task('vendor.styles', function() {
  var files = [
    path.join(nodeModulesDir, '/font-awesome/css/font-awesome.css'),
    path.join(nodeModulesDir, '/bootstrap/dist/css/bootstrap.css'),
    path.join(nodeModulesDir, '/angular/angular-csp.css')
  ];
  return gulp.src(files)
    .pipe(concat('vendor.css'))
    .pipe(prefixer({browsers: ['last 4 versions']}))
    .pipe(cleanCss({compatibility: 'ie8'}))
    .pipe(gulp.dest(targetStylesDir));
});

gulp.task('vendor.fonts', function() {
  var files = [
    path.join(nodeModulesDir, '/font-awesome/fonts/*'),
    path.join(nodeModulesDir, '/bootstrap/dist/fonts/*')
  ];
  return gulp.src(files)
    .pipe(gulp.dest(targetFontsDir));
});
