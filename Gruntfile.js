var grunt = require('grunt');

grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-contrib-compass');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-preprocess');
grunt.loadNpmTasks('grunt-htmlhint');
grunt.loadNpmTasks('grunt-jslint');

var jsSourceFiles = ['src/js/swp.js', 'src/js/helpers/helpers.js', 'src/js/modules/*.js'];

var svg2png = {
    bin: {
        files: [
            { cwd: 'src/styling/svg/', src: ['**/*.svg'], dest: 'bin/img/sprites/' }
        ]
    },
    dist: {
        files: [
            { cwd: 'dist/svg/', src: ['*.svg'], dest: 'dist/img/sprites/' }
        ]
    }
};
// task?

var svgmin = {
    options: {
        plugins: [
            { removeViewBox: false },
            { removeUselessStrokeAndFill: false }
        ]
    },
    bin: {
        files: [{
            expand: true,
            cwd: 'src/styling/<%= grunt.task.current.args[0] %>/svg/',
            src: ['**/*.svg'],
            dest: 'bin/<%= grunt.task.current.args[0] %>/svg/',
            ext: '.svg'
        }]
    },
    dist: {
        files: [{
            expand: true,
            cwd: 'src/styling/<%= grunt.task.current.args[0] %>/svg/',
            src: ['**/*.svg'],
            dest: 'dist/svg/',
            ext: '.svg'
        }]
    }
};
// task?

var copy = {
    jslibs: {
        files: [
            {
                expand: true,
                cwd: 'src/js/',
                src: ['libs/*.js', 'libs/*.map', 'libs/**/*.js', 'libs/**/*.map', 'polyfills/*.js', 'polyfills/**/*.js'],
                dest: 'bin/js/'
            }
        ]
    },
    distjslibs: {
        files: [
            {
                expand: true,
                cwd: 'src/js/',
                src: ['libs/*.js', 'libs/*.map', 'libs/**/*.js', 'libs/**/*.map', 'polyfills/*.js', 'polyfills/**/*.js'],
                dest: 'dist/js/'
            }
        ]
    },
    json: {
        files: [
            {
                expand: true,
                cwd: 'src/json/',
                src: ['*.*'],
                dest: 'bin/json/'
            }
        ]
    },
    fonts: {
        files: [
            {
                expand: true,
                cwd: 'src/styling/fonts/',
                src: ['**.*'],
                dest: 'bin/fonts/'
            }
        ]
    },
    distfonts: {
        files: [
            {
                expand: true,
                cwd: 'src/styling/fonts/',
                src: ['**.*'],
                dest: 'dist/fonts/'
            }
        ]
    },
    csslibs: {
        files: [
            {
                expand: true,
                cwd: 'src/styling/css/',
                src: ['**.*'],
                dest: 'bin/css/'
            }
        ]
    },
    distcsslibs: {
        files: [
            {
                expand: true,
                cwd: 'src/styling/css/',
                src: ['**.*'],
                dest: 'dist/css/'
            }
        ]
    },
    images: {
        files: [
            {
                expand: true,
                cwd: 'src/styling/img/',
                src: ['**.*', '**/**.*'],
                dest: 'bin/img/'
            }
        ]
    },
    distimages: {
        files: [
            {
                expand: true,
                cwd: 'src/styling/img/',
                src: ['**.*', '**/**.*'],
                dest: 'dist/img/'
            }
        ]
    }
};
grunt.config('copy', copy);

var uglify = {
    dev: {
        options: {
            sourceMap: 'bin/js/crud.map.js',
            sourceMapRoot: '/',
            sourceMappingURL: 'crud.map.js'
        },
        files: {
            'bin/js/crud.min.js': jsSourceFiles
        }
    },
    dist: {
        options: {
            sourceMap: 'dist/js/crud.map.js',
            sourceMapRoot: '/',
            sourceMappingURL: 'crud.map.js',
            compress: {
                drop_console: true
            }
        },
        files: {
            'dist/js/crud.min.js': 'dist/js/swp.js'
        }
    }
};
grunt.config('uglify', uglify);

var compass = {
    dist: {
        options: {           // Target options
            sassDir: 'src/styling/scss',
            cssDir: 'dist/css',
            imagesDir: 'dist/img',
            javascriptsDir: 'dist/js',
            linecomments: false,
            outputStyle: 'compressed',
            environment: 'production'
        }
    },
    dev: {
        options: {
            sassDir: 'src/styling/scss',
            cssDir: 'bin/css',
            imagesDir: 'bin/img/',
            javascriptsDir: 'bin/js',
            outputStyle: 'compact',
            environment: 'development'
        }
    }
};
grunt.config('compass', compass);

var jslint = {
    all: {
        src: jsSourceFiles,
        directives: {
            browser: true,
            nomen: true,
            plusplus: true,
            indent: 4,
            regexp: true,
            unparam: true,
            todo: true,
            continue: true,
            predef: [
                'BASEJSPATH',
//                'jQuery',
//                '$',
                '_',
                'SWPCRUD',
                'require',
//                'Mustache',
//                'Hammer',
//                'Modernizr',
//                'google',
                'console'
            ]
        }
    }
};
grunt.config('jslint', jslint);

var concat = {
    cruddev: {
        files: {
            'bin/js/swp.js': jsSourceFiles
        }
    },
    cruddist: {
        files: {
            'dist/js/swp.js': jsSourceFiles
        }
    }
};
grunt.config('concat', concat);

var preprocess = {
    dev : {
        files : [
            {
                expand: true,
                cwd: './src/html/',
                src: ['*.html'],
                dest: './bin',
                ext: '.html'
            }
        ]
    }
};
grunt.config('preprocess', preprocess);

var htmlhint = {
    dev: {
        options: {
            'tag-pair': true,
            'tag-self-close': true,
            'tagname-lowercase': true,
            'attr-lowercase': true,
            'attr-value-double-quotes': true,
            'doctype-first': true,
            'spec-char-escape': true,
            'id-unique': false,
            'style-disabled': true,
            'img-alt-require': true
        },
        src: ['./bin/*.html']
    }
};
grunt.config('htmlhint', htmlhint);

var watch = {
    options: {
        interrupt: true
    },
    htmlCompile: {
        files: ['src/html/**/*.html'],
        tasks: ['preprocess:dev']
    },
    html: {
        files: ['bin/*.html'],
        tasks: ['htmlhint:dev']
    },
    css: {
        files: ['src/styling/scss/**/*.scss'],
        tasks: ['compass:dev']
    },
    fonts: {
        files: ['src/styling/fonts/**.*'],
        tasks: ['copy:fonts']
    },
    images: {
        files: ['src/styling/img/**.*'],
        tasks: ['copy:images']
    },
    js: {
        files: [
            'src/js/swp.js',
            'src/js/helpers/helpers.js',
            'src/js/modules/*.js'
        ],
        tasks: ['jslint', 'concat:cruddev', 'uglify:dev']
    },
    json: {
        files: ['src/json/**.*'],
        tasks: ['copy:json']
    },
//            svg: {
//                files: ['src/styling/svg/**.svg'],
//                tasks: ['svg2png:bin:<%= grunt.config.website %>',
//                        'svgmin:bin:<%= grunt.config.website %>'
//                    ]
//            },
    jslibs: {
        files: jsSourceFiles,
        tasks: ['copy:jslibs']
    }
};

grunt.config('watch', watch);
grunt.registerTask(
    'watch-all',
    [
        'watch:htmlCompile',
        'watch:html',
        'watch:css',
        'watch:fonts',
        'watch:images',
        'watch:js',
        'watch:json',
        'watch:jslibs'
    ]
);

grunt.registerTask(
    'js',
    [
        'copy:json',
        'copy:jslibs',
        'jslint',
        'concat:cruddev',
        'uglify:dev'
    ]
);

var clean = {
    distfolder: {
        force: true,
        src: ['dist/**.*', 'dist/*']
    },
    binfolder: {
        force: true,
        src: ['bin/**.*', 'bin/*']
    }
};
grunt.config('clean', clean);
grunt.registerTask('cleanup', ['clean:distfolder', 'clean:binfolder']);
