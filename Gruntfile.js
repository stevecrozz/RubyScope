/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: '/*! RubyScope - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* http://PROJECT_WEBSITE/\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
        'Stephen Crosby; No License Yet */'
    },
    qunit: {
      options: {
        coverage: {
          src: ['app/**/*.js', 'lib/**/*.js'],
          instrumentedFiles: 'temp/',
          htmlReport: 'report'
        }
      },
      all: ['test/**/*.html']
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
        boss: true,
        eqnull: true,
        browser: true
      },
      files: [
        "Gruntfile.js",
        "test/**/*.js",
        "app/**/*.js",
        "lib/**/*.js"
      ]
    },
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        logo: "http://stevecrozz.github.com/RubyScope/img/logo.png",
        options: {
          paths: ["app", "lib"],
          outdir: 'doc'
        }
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'qunit']);
  grunt.registerTask('travis', ['jshint', 'qunit']);
  grunt.registerTask('dist', ['jshint', 'qunit', 'yuidoc']);

  grunt.loadNpmTasks('grunt-qunit-istanbul');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');

};
