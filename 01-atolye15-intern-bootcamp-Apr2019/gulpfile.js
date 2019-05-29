var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    cleanCSS = require('gulp-clean-css'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    imagemin = require('gulp-imagemin'),
    changed = require('gulp-changed'),
    twig = require('gulp-twig'),
    data = require('gulp-data'),
    htmlmin = require('gulp-htmlmin'),
    fs = require('fs'),
    path = require('path');

//CSS Files to concat them
    
var cssSRC = [
    './src/css/bootstrap-grid.min.css',
    './src/css/normalize.css',
    './src/sass/style.css'
];

//Sources and Destinations of Assets
var paths = {
    sassFiles: {
        src: "./src/sass/*.sass",
        dest: "./src/sass/"
    },
    concatFiles: {
        dest: "./dist/assets/css/"
    },
    imgImg: {
        src: "./src/img/*",
        dest: "./dist/assets/img/"
    },
    imgFavicon: {
        src: "./src/img/favicon/*",
        dest: "./dist/assets/img/favicon/"
    },
    imgLogos: {
        src: "./src/img/logos/*",
        dest: "./dist/assets/img/logos/"
    },
    twigFiles: {
        src: "./src/templates/*.twig",
        dest: "./src/html/"
    },
    twigData: {
        src: "./src/data/",
    },
    htmlFiles:{
        src: "./src/html/*",
        dest: "./dist/"
    }
};

//twig to uncompressed html
function twigHtml() {    
    return (gulp.src(paths.twigFiles.src)
    .pipe(data(function (file) {
    return JSON.parse(fs.readFileSync(paths.twigData.src + path.basename(file.path) + '.json'));}))
    .pipe(data(function (file) {
    return JSON.parse(fs.readFileSync(paths.twigData.src + 'departureInfos' + '.json'));}))
    .pipe(data(function (file) {    
    return JSON.parse(fs.readFileSync(paths.twigData.src + 'arrivalInfos' + '.json'));}))
    .pipe(twig()).on('error', function (err) {process.stderr.write(err.message + '\n');this.emit('end');})        
    .pipe(gulp.dest(paths.twigFiles.dest))
    );
}

//Minifying Html
function html() {
    return (gulp.src(paths.htmlFiles.src)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(paths.htmlFiles.dest))
    );
}

//Sass to css, adding prefixes to css also creating sourcemap
function css() {
    return (gulp.src(paths.sassFiles.src)
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.sassFiles.dest))
    );
}

//Concating all css files, minifying the css file and creating sourcemap
function concatCSS() {
    return gulp.src(cssSRC)
    .pipe(sourcemaps.init({loadMaps: true, largeFile: true}))
    .pipe(concat('style.min.css'))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.concatFiles.dest));
}
//Minimizing the images
function imgmin() {
    return gulp.src(paths.imgImg.src)
    .pipe(changed(paths.imgImg.dest))
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
        ]))
        .pipe(gulp.dest(paths.imgImg.dest)),
    
    gulp.src(paths.imgFavicon.src)
    .pipe(changed(paths.imgFavicon.dest))
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
        ]))
        .pipe(gulp.dest(paths.imgFavicon.dest)),
    
    gulp.src(paths.imgLogos.src)
    .pipe(changed(paths.imgLogos.dest))
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
        ]))
        .pipe(gulp.dest(paths.imgLogos.dest));
}

function watch(){
    return gulp.watch("./src/sass/*/*.sass" , gulp.series([css, concatCSS])),
    gulp.watch("./src/templates/*.twig" , gulp.series([twigHtml, html])),
    gulp.watch("./src/templates/includes/*/*.twig" , gulp.series([twigHtml, html])),
    gulp.watch("./src/templates/layouts/*.twig" , gulp.series([twigHtml, html]));
}

exports.css = css;
exports.html = html;
exports.concatCSS = concatCSS;
exports.imgmin = imgmin;
exports.twigHtml = twigHtml;
exports.watch = watch

var build = gulp.parallel(gulp.series([css, concatCSS, imgmin, twigHtml, html]));
gulp.task('default', build);