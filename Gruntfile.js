/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    meta: {
      version: '0.1.0',
      banner: '/*! RubyScope - v<%= meta.version %> - ' +
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
    }
  });

  grunt.registerTask('default', ['jshint', 'qunit']);
  grunt.registerTask('travis', ['jshint', 'qunit']);

  grunt.loadNpmTasks('grunt-qunit-istanbul');
  grunt.loadNpmTasks('grunt-contrib-jshint');

};
