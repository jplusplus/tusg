const gulp = require('gulp')
const sass = require('gulp-ruby-sass')
const uglify = require('gulp-uglify')
const nodemon = require('gulp-nodemon')
const jshint = require('gulp-jshint')
const pump = require('pump')

let config = {
  sassPath: './resources/sass',
}

gulp.task('lint', function () {
  return gulp.src('./resources/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
})

gulp.task('css', function() {
  return sass(config.sassPath + '/*.scss', {
    style: 'compressed',
  })
  .pipe(gulp.dest('./public/css'));
});

gulp.task('compress', function (cb) {
  pump([
      gulp.src('resources/js/main.js'),
      uglify(),
      gulp.dest('public/js')
    ], cb);
});

gulp.task('start-dev', function () {
  var stream = nodemon({
      script: 'bin/www',
      ext: 'js pug',
      tasks: ['lint'],
      env: {
        'NODE_ENV': 'development',
        'DEBUG': 'tusg'
      }
    }
  );
  stream
    .on('restart', function () {
      console.log('restarted!')
    })
    .on('crash', function() {
      console.error('Application has crashed!\n')
       stream.emit('restart', 10)  // restart the server in 10 seconds
    })
})

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(config.sassPath + '/**/*.scss', 'css');
    gulp.watch('resources/js/*.js', 'compress')
})
gulp.task('default', gulp.series('css', 'compress', 'lint'))
gulp.task('develop', gulp.series('css', 'compress', 'lint', 'watch', 'start-dev'))
