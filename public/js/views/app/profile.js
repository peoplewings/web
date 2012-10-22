define([
  'jquery',
  'backbone',
  'utils',
  'api',
  'text!templates/app/profile.html',
  'text!templates/app/basic-info.html',
  'text!templates/app/about.html',
  'text!templates/lib/language-field.html',
  'models/Profile',
], function($, Backbone, utils, api, profileTpl, basicInfoTpl, aboutMeTpl, languageTpl, UserProfile){


  var profileView = Backbone.View.extend({
	languagesCount: 0,
    el: "#main",
	events:{
		"click a#add-language-btn": "addLanguage",
		"submit form#basic-info-form": "submit",
		"click button[class=close]": "deleteLanguage",
	},
	initialize: function(options){
		this.model = new UserProfile({id:"me"})
		this.model.bindings = {
			gender: '[name=gender]',
			civilState: '[name=civilState]',
			showBirthday: '[name=showBirthday]',
			birthDay: '[name=birthDay]',
			interestedInM: '[name=interestedInM]',
			interestedInF: '[name=interestedInF]',
//			language_1: '[name=language-1]',
			//language_2: '[name=language-2]',
//			level_1: '[name=level-1]',
			//level_2: '[name=level-2]',
			//languages: Array[0] --> function that sets the languages bindings
			
			//allAboutYou: 'textarea[name=allAboutYou]',
			//mainMission: ""
			//occupation: ""
			//company
			//education
			//degree
			
			//personalPhilosophy: ""
			//politicalOpinion: ""
			//religion: ""
		}
      this._modelBinder = new Backbone.ModelBinder();
	  var sc = this
	  this.model.fetch({
			headers: { "X-Auth-Token": api.getAuthToken() }, 
			success: function(){ 
				//console.log(sc.model.attributes)
				sc.render()
				if (sc.model.get("languages").length === 0){
					var tpl = _.template(languageTpl, {index: 1})
					$('#languages-list').prepend(tpl)
					sc.languagesCount = 1
				}else sc.setLanguages(sc.model.get("languages"))
			},
			error: function() { console.log(arguments); }	 	
	  })
	},
    render: function(){
      $(this.el).html(profileTpl);
	  $('#basic-info').html(basicInfoTpl)
	  $('#about-me').html(aboutMeTpl)
	  this._modelBinder.bind(this.model, this.el, this.model.bindings)
	  
    },
	close: function(){ 
		this._modelBinder.unbind()
	},
	submit: function(e){
		e.preventDefault(e);
		//console.log('Submit profile ' + e.target.id)
		var data = utils.serializeForm(e.target.id)
		console.log(data)
		var values = {
			birthDay: data.birthDay,
			birthMonth: data.birthMonth,
			birthYear: data.birthYear,
			showBirthday: data.showBirthday,
			gender: data.gender,
			civilState: data.civilState,
			languages: []
		}
		for (var i = 1; i < this.languagesCount + 1; i++){
			values.languages.push({language: data['language-' + i], level: data['level-' + i]})
		}
		//Parsing interestedIn
		if (data.interestedInM && data.interestedInF){
			values.interestedIn = "B"
		}else if (!data.interestedInM && !data.interestedInF){
			values.interestedIn = "N"
		} else values.interestedIn = data.interestedInM || data.interestedInF
		console.log(values)
	},
	//{ "language": "english", "level": "expert"}
	setLanguages: function(languages){
		//console.log(languages)
		var size = languages.length
		for (var i = 1; i < size + 1; i++){
			var tpl = _.template(languageTpl, {index: i})
			$('#languages-list').prepend(tpl)
		}
		var s
		var sc = this
		$.each(languages, function(i, field){
			s = i + 1 + ""
			sc.model.bindings["language_" + s] = '[name=language-' + s +']'
			sc.model.bindings["level_" + s] = '[name=level-' + s +']'
		})
		this.languagesCount += size
		this._modelBinder.bind(this.model, this.el, this.model.bindings)
	},
	addLanguage: function(e){
		e.preventDefault(e);
		var langs = $('div[id^=select-lang-]').length + 1
		var tpl = _.template(languageTpl, {index: langs})
		this.model.bindings["language_" + langs] = '[name=language-' + langs +']'
		this.model.bindings["level_" + langs] = '[name=level-' + langs +']'
		$('div[id^=select-lang-]:last').after(tpl)
		this.languagesCount++
		return false;
	},
	deleteLanguage: function(e){
		var id = e.target.id.split("-", 3)
		id = id[id.length-1]
		$("#select-lang-" + id).remove()
		delete this.model.bindings["language_" + id]
		delete this.model.bindings["level_" + id]
		this.languagesCount--
	}
  });

  return profileView;
});