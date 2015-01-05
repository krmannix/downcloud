module.exports = function (grunt) {

    // Load all grunt-* packages from package.json
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');    

    grunt.initConfig({
        paths: {
            src: {
                js: ['src/constants.js',
                     'src/client_id.js',
                     'src/artist.js',
                     'src/playlist.js',
                     'src/search.js',
                     'src/app.js'
                    ]
            },
            dest: {
                js: 'dist/main.js',
                jsMin: 'dist/main.min.js'
            }
        },
        concat: {
            js: {
                options: {
                    separator: ';'
                },
                src: '<%= paths.src.js %>',
                dest: '<%= paths.dest.js %>'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= whoo %> */\n',
                compress: true,
                mangle: true,
                sourceMap: false
            },
            target: {
                src: '<%= paths.dest.js %>',
                dest: '<%= paths.dest.jsMin %>'
            }
        }
    });

    grunt.registerTask('default', ['concat', 'uglify']);
};