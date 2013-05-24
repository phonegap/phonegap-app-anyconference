/*global module:false, require:false*/

var path = require('path'),
    lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;

var folderMount = function folderMount(connect, point) {
        return connect.static(path.resolve(point));
    };

module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        cssmin: {
            combine: {
                files: {
                    'www/css/app.css': [
                        'src/css/topcoat-mobile-light.css',
                        'src/css/app.css'
                        ]
                    }
            },
            minify: {
                expand: true,
                cwd: 'www/css/',
                src: ['*.css', '!*.min.css'],
                dest: 'www/css/',
                ext: '.min.css'
            }
        },
        concat: {
            dist: {
                src: [
                    'src/js/lib/jquery-2.0.0.js',
                    'src/js/lib/lodash.underscore.js',
                    'src/js/lib//backbone.js',
                    'src/js/lib/backbone.layoutmanager.js',
                    'src/js/app.js',
                    'src/js/router.js'
                    ],
                dest: 'www/js/<%= pkg.name %>.js'
            }
        },
        uglify: {
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'www/js/<%= pkg.name %>.min.js'
            }
        },
        mocha: {
            all: ['test/index.html'],
            options: {
                reporter: 'Nyan',
                run: true
            }
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                boss: true,
                eqnull: true,
                globals: {}
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib_test: {
                src: [
                    'src/js/**/*.js',
                    'test/**/*.test.js',
                    '!src/js/lib/*.js'
                    ]
            }
        },
        livereload: {
            port: 35729
        },
        connect: {
            livereload: {
                options: {
                    port: 9001,
                    middleware: function(connect, options) {
                        return [lrSnippet, folderMount(connect, options.base)];
                    }
                }
            }
        },
        regarde: {
            html: {
                files: 'www/index.html',
                tasks: ['default', 'livereload']
            },
            test: {
                files: 'test/*.test.js',
                tasks: ['default', 'livereload']
            },
            js: {
                files: 'src/js/*.js',
                tasks: ['default', 'livereload']
            },
            css: {
                files: 'src/css/*.css',
                tasks: ['default', 'livereload']
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-regarde');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-livereload');
    grunt.loadNpmTasks('grunt-mocha');

    // Default task.
    grunt.registerTask('default', ['jshint', 'cssmin', 'concat', 'uglify', 'mocha']);
    grunt.registerTask('watch', ['livereload-start', 'connect', 'regarde']);

};
