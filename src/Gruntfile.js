module.exports = function (grunt) {

    // Load all grunt-* packages from package.json
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');    

    grunt.initConfig({
        paths: {
            src: {
                js: ['lib/constants.js',
                     'lib/options.js',
                     'lib/artist.js',
                     'lib/playlist.js',
                     'lib/search.js',
                     'lib/app.js',
                     'lib/read_client_id.js'
                    ]
            },
            dest: {
                js: 'lib/downcloud.js',
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

    //grunt.registerTask('default', ['concat', 'uglify']);
    grunt.registerTask('default', ['concat']);
};