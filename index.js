/* @flow */

var fs = require("fs")
var jade = require("jade")
var is = require("is_js")
var express = require("express")
var async = require('async')
var request = require('request')
var CronJob = require('cron').CronJob

module.exports = function(){
	var app = express()

	app.locals.title = "iTunes"

	app.locals.configId = function(){
		if (app.locals.app) {
			return app.locals.app.trackCensoredName
		}
		return app.locals.config.appID.value
	}

	app.locals.config = {
		appID: {
			label: 'App ID',
			value: null,
			setValue: function(v){
				this.value = v
				app.generate()
			},
			type: 'text',
			isValid: function(value){
				if (is.not.number(parseInt(value))){
					return "value must be a number"
				}
				else {
					return null
				}
			}
		},
		descriptionLenght: {
			label: 'Description max lenght',
			value: 150,
			setValue: function(v){
				this.value = parseInt(v)
			},
			type: 'text',
			isValid: function(value){
				if (is.not.number(parseInt(value))){
					return "value must be a number"
				}
				else {
					return null
				}
			}
		}
	}

	app.use("/public", express.static(__dirname + "/public", {
		maxAge: "7d"
	}))

	app.html = function() {
		if (app.locals.app != null) {
			if (app.locals.app.description.length > app.locals.config.descriptionLenght.value && app.locals.config.descriptionLenght.value != 0) {
				var findString = app.locals.app.description.substring(app.locals.config.descriptionLenght.value, app.locals.app.description.length)
				var point = findString.indexOf(" ")
				app.locals.app.description = app.locals.app.description.substring(0, app.locals.config.descriptionLenght.value+point) + " ..."
			}
			return render(app.locals)
		}
		return renderLoading(app.locals)
	}
	app.less = function() {
		return fs.readFileSync(__dirname + "/stylesheets/style.less").toString()
	}
	app.use("/public", express.static(__dirname + "/public", {
		maxAge: "7d"
	}))

	var render = jade.compileFile(__dirname + "/views/index.jade")
	var renderLoading = jade.compileFile(__dirname + "/views/loading.jade")

	app.generate = function() {
		async.parallel(
			{
				main: function(callback){
					var url = 'https://itunes.apple.com/lookup?id='+app.locals.config.appID.value
					get(url, function (body){
						callback(null, JSON.parse(body))
					})
				},
			},
			function(err, results) {
				if (err != null) {
					// Error
					return
				}
				app.locals.app = results.main.results[0]
			}
		)

		function get(url, callback) {
			var headers = {
				'User-Agent': 'Erdblock/0.1',
				'Content-Type': 'text/html',
				'charset': 'utf-8',
			}
			var options = {
				url: url,
				method: 'GET',
				headers: headers,
				gzip: true,
			}
			request(options, function(error, response, body) {
				if (!error && response.statusCode == 200) {
					callback(body)
				}
			})
		}
	}

	new CronJob('0 31 * * * *',
		app.generate,
		null,
		true
	)

	return app
}
