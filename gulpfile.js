var gulp = require('gulp'), 
    sass = require('gulp-ruby-sass') ,
    notify = require("gulp-notify") ,
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    nodemon = require('gulp-nodemon'),
    jshint = require('gulp-jshint'),
    pump = require('pump');

var config = {
   sassPath: './resources/sass',
}

gulp.task('lint', function () {
  gulp.src('./**/*.js')
    .pipe(jshint())
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

gulp.task('develop', function () {
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
     gulp.watch(config.sassPath + '/**/*.scss', ['css']); 
     gulp.watch('resources/js/*.js', ['compress']); 
});
  gulp.task('default', ['css', 'compress', 'lint']);
