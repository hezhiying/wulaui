import gulp from "gulp";
import concat from "gulp-concat";
import clean from "gulp-rimraf";
import rename from "gulp-rename";
import less from "gulp-less";
import cssmin from "gulp-clean-css";

import uglify from "gulp-uglify";
import jsvalidate from "gulp-jsvalidate";
import notify from "gulp-notify";
import babel from "gulp-babel";
import minimist from "minimist";
import webserver from "gulp-webserver";

let knownOptions = {
	string : 'env',
	default: {env: process.env.NODE_ENV || 'dev'}
};

let options = minimist(process.argv.slice(2), knownOptions);

// 将插件的CSS文件合并
gulp.task('deps', [], function () {
	console.log('Concat plugins js and css.');
	return gulp.src(
		'js/**/*.css'
	).pipe(concat('plugins.css'))
		.pipe(gulp.dest('css'));
});

// 生成最终的css文件
gulp.task('ccss', ['deps', 'css'], function () {
	let ccss = gulp.src([
		'css/bootstrap.min.css',
		'css/animate.css',
		'css/font-awesome.min.css',
		'css/font.css',
		'css/metroStyle.css',
		'css/plugins.css',
		'css/app.css'
	]).pipe(concat('ui.css'))
		.pipe(gulp.dest('css'));
	if (options.env === 'pro')
		return ccss.pipe(cssmin())
			.pipe(rename({extname: '.min.css'}))
			.pipe(gulp.dest('css'));
});

// 删除已经生成的文件
gulp.task('clean', [], function () {
	console.log("Clean all files in build folder");
	return gulp.src([
			"css/app.css",
			'css/ui.css',
			'css/ui.min.css',
			'js/app.js',
			'js/app.min.js'
		], {read: false}
	).pipe(clean());
});

gulp.task('default', ['build'], function () {

});

// 生成最终文件，并清空生成的中间文件.
gulp.task('build', ['ccss', 'js', 'gv'], function () {

});

// 编译less文件
gulp.task('css', [], function () {
	console.log("compile app.less.");
	return gulp.src('less/app.less').pipe(less()).pipe(gulp.dest('css'));
});
gulp.task('gv', [], function () {
	console.log("compile validate js.");
	let js = gulp.src([
		'js/validate/jquery.validate.js'
	]).pipe(babel({
		presets: ['env']
	}))
		.pipe(jsvalidate())
		.on('error', notify.onError(e => e.message))
		.pipe(concat('validate.js'))
		.pipe(gulp.dest('js'));

	if (options.env === 'pro')
		js.pipe(uglify());

	return js
		.pipe(rename({
			extname: '.min.js'
		}))
		.pipe(gulp.dest('js/validate'));
});
// 合并js文件
gulp.task('js', [], function () {
	console.log("compile js.");
	let js = gulp.src([
		'src/comm.js',
		'src/i18n/*.js',
		'src/components/*.js',
		'src/app.js'
	])
		.pipe(babel({
			presets: ['env']
		}))
		.pipe(jsvalidate())
		.on('error', notify.onError(e => e.message))
		.pipe(concat('app.js'))
		.pipe(gulp.dest('js'));

	if (options.env === 'pro')
		return js.pipe(uglify())
			.pipe(rename({
				extname: '.min.js'
			}))
			.pipe(gulp.dest('js'));
});

gulp.task('watch', ['build'], function () {
	options.env = 'dev';
	gulp.src('.').pipe(webserver({
		open: 'demo/',
		fallback: '404.html'
	}));
	gulp.watch(['less/**'], ['ccss']);
	gulp.watch(['src/**'], ['js']);
	gulp.watch(['js/validate/jquery.validate.js'], ['gv']);
});