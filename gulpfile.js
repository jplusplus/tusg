var gulp = require('gulp'), 
    sass = require('gulp-ruby-sass') ,
    notify = require("gulp-notify") ,
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    pump = require('pump');

var config = {
     sassPath: './resources/sass',
}

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
    ],
    cb
  );
});

// Rerun the task when a file changes
 gulp.task('watch', function() {
     gulp.watch(config.sassPath + '/**/*.scss', ['css']); 
     gulp.watch('resources/js/*.js', ['compress']); 
});
  gulp.task('default', ['css', 'compress']);
