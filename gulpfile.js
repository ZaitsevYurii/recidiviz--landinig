'use strict'

const { src, dest } = require('gulp')
const gulp = require('gulp')
const autoprefixer = require('gulp-autoprefixer')
const cssbeautify = require('gulp-cssbeautify')
const removeComments = require('gulp-strip-css-comments')
const rename = require('gulp-rename')
const sass = require('gulp-sass')(require('sass'))
const cssnano = require('gulp-cssnano')
const uglify = require('gulp-uglify')
const rigger = require('gulp-rigger')                                  /*предотвращение ошибок*/
const imagemin = require('gulp-imagemin')
const del = require('del')
const browserSync = require('browser-sync').create()





// patches
const srcPath = 'src/'
const distPath = 'dist/'

const paths = {
   build: {
      html: distPath,
      css: distPath + '/css',
      js: distPath + '/js/',
      images: distPath + '/img/',
      fonts: distPath + '/fonts/'
   },
   src: {
      html: srcPath + '*.html',
      css: srcPath + '/scss/**/*.scss',
      js: srcPath + '/js/**/*.js',
      images: srcPath + '/img/**/*.{jpg,jpeg,png,,svg,gif,ico,webp,webmanifest,xml,json}',
      fonts: srcPath + '/fonts/**/*.{eot,woof,woff2,ttf,svg}'
   },
   watch: {
      html: srcPath + '**/*.html',
      css: srcPath + 'scss/**/*.scss',
      js: srcPath + 'js/**/*.js',
      images: srcPath + 'img/**/*.{jpg,jpeg,png,,svg,gif,ico,webp,webmanifest,xml,json}',
      fonts: srcPath + 'fonts/**/*.{eot,woof,woff2,ttf,svg}'
   },
   clean: './' + distPath
}



// tasks

function html() {
   return src(paths.src.html, { base: srcPath })
      .pipe(dest(paths.build.html))
      .pipe(browserSync.reload({ stream: true }))
}

function css() {
   return src(paths.src.css, { base: srcPath + 'scss/' })
      .pipe(sass())
      .pipe(autoprefixer())
      .pipe(cssbeautify())
      .pipe(dest(paths.build.css))
      .pipe(cssnano({
         zindex: false,
         discardComments: {
            removeAll: true
         }
      }))
      .pipe(removeComments())
      .pipe(rename({
         suffix: '.min',
         extname: '.css'
      }))
      .pipe(dest(paths.build.css))
      .pipe(browserSync.reload({ stream: true }))
}

function js() {
   return src(paths.src.js, { base: srcPath + 'js/' })
      .pipe(rigger())
      .pipe(dest(paths.build.js))
      .pipe(uglify())
      .pipe(rename({
         suffix: '.min',
         extname: '.js'
      }))
      .pipe(dest(paths.build.js))
      .pipe(browserSync.reload({ stream: true }))
}

function images() {
   return src(paths.src.images, { base: srcPath + '/img/' })
      .pipe(imagemin([
         imagemin.gifsicle({ interlaced: true }),
         imagemin.mozjpeg({ quality: 80, progressive: true }),
         imagemin.optipng({ optimizationLevel: 5 }),
         imagemin.svgo({
            plugins: [
               { removeViewBox: true },
               { cleanupIDs: false }
            ]
         })
      ]))
      .pipe(dest(paths.build.images))
      .pipe(browserSync.reload({ stream: true }))
}

function fonts() {
   return src(paths.src.fonts, { base: srcPath + '/fonts/' })
      .pipe(browserSync.reload({ stream: true }))
}

function clean() {
   return del(paths.clean)
}

function watcher() {
   gulp.watch([paths.watch.html], html)
   gulp.watch([paths.watch.css], css)
   gulp.watch([paths.watch.js], js)
   gulp.watch([paths.watch.images], images)
   gulp.watch([paths.watch.fonts], fonts)
}

function browser() {
   browserSync.init({
      server: {
         baseDir: './' + distPath
      }
   })
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts))
const watch = gulp.parallel(build, watcher, browser)

// exports

exports.html = html
exports.css = css
exports.js = js
exports.images = images
exports.fonts = fonts
exports.clean = clean
exports.build = build
exports.watch = watch
exports.default = watch