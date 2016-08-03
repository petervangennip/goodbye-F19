var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var sourcemaps  = require('gulp-sourcemaps');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var cssnano     = require('gulp-cssnano');
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var deploy      = require('gulp-gh-pages');

var jekyll = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};


// Build the Jekyll Site
//
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn(jekyll, ['build'], { stdio: 'inherit' })
        .on('close', done);
});


// Rebuild Jekyll & page reload
//
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});


// Wait for jekyll-build, then launch the Server
//
gulp.task('browser-sync', ['sass', 'jekyll-build'], function () {
    browserSync({
        server: {
            baseDir: 'dist'
        }
    });
});


// Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
//
gulp.task('sass', function () {
    return gulp.src('app/assets/sass/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['app/assets/sass'],
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(cssnano({
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('app/assets/css'))
        .pipe(gulp.dest('dist/assets/css'))
        .pipe(browserSync.reload({ stream: true }));
});


// Concat & uglify js files
//
var jsPath = 'app/assets/js/';
gulp.task('scripts', function () {
    return gulp.src([jsPath + 'jquery.js', jsPath + 'bootstrap.js', jsPath + 'main.js'])
        .pipe(concat('scripts.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/assets/js'))
        .pipe(gulp.dest('dist/assets/js'));
});


// Watch scss files for changes & recompile
// Watch html/md files, run jekyll & reload BrowserSync
//
gulp.task('watch', function () {
    gulp.watch('app/assets/sass/**/*.scss', ['sass']);
    gulp.watch(['**/*.*', '!node_modules/**/*', '!dist/**/*', ], ['jekyll-rebuild']);
});


// Push build to gh-pages
//
gulp.task('deploy', function () {
    return gulp.src("./dist/**/*")
      .pipe(deploy())
});


// Default task, running just `gulp` will compile the sass,
// compile the jekyll site, launch BrowserSync & watch files.
//
gulp.task('default', ['browser-sync', 'scripts', 'watch']);