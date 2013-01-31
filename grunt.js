
module.exports = function(grunt) {

    grunt.initConfig({
        //pkg: '<json:package.json>',
        meta: {
        },
        istatic: {
            main: {
                repos: {
                    'dexteryy/OzJS': {
                        file: {
                            '/oz.js': '/js/lib/'
                        }
                    },
                    'dexteryy/mo': {
                        file: {
                            '/': '/js/mod/mo/'
                        }
                    },
                    'dexteryy/DollarJS': {
                        file: {
                            '/dollar.js': '/js/mod/'
                        }
                    },
                    'dexteryy/EventMaster': {
                        file: {
                            '/eventmaster.js': '/js/mod/'
                        }
                    },
                    'dexteryy/ChoreoJS': {
                        file: {
                            '/choreo.js': '/js/mod/'
                        }
                    },
                    'jaysalvat/buzz': {
                        file: {
                            '/buzz.js': '/js/mod/'
                        }
                    }
                }
            }
        },
        ozma: {
            main: {
                src: 'js/main.js',
                //saveConfig: true
                config: {
                    baseUrl: "js/mod/",
                    distUrl: "dist/js/mod/",
                    loader: "../lib/oz.js",
                    disableAutoSuffix: true
                }
            }
        },
        compass: {
            main: {
                options: {
                    config: 'css/config.rb',
                    sassDir: 'css',
                    cssDir: 'dist/css',
                    imagesDir: 'pics',
                    relativeAssets: true,
                    outputStyle: 'expanded',
                    noLineComments: false,
                    require: [
                        'ceaser-easing',
                        'animation',
                        'animate-sass'
                    ],
                    environment: 'production'
                }
            }
        },
        watch: [{
            files: 'js/**/*.js',
            tasks: 'ozma'
        }, {
            files: 'css/**/*.scss',
            tasks: 'compass'
        }]
    });

    grunt.loadNpmTasks('grunt-istatic');
    grunt.loadNpmTasks('grunt-ozjs');
    grunt.loadNpmTasks('grunt-contrib-compass');
    
    grunt.registerTask('default', [
        'compass',
        'ozma'
    ]);

};
