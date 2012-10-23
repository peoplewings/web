define([
  'jquery',
  'backbone',
  'utils',
  'api',
  'text!templates/app/profile.html',
  'text!templates/app/basic-form.html',
  'text!templates/app/about-form.html',
  'text!templates/app/likes-form.html',
  'text!templates/lib/language-field.html',
  'text!templates/lib/education-field.html',
  'text!templates/lib/alert.html',
  'models/Profile',
], function($, Backbone, utils, api, profileTpl, basicInfoTpl, aboutMeTpl, likesTpl, languageTpl, educationTpl, alertTpl, UserProfile){


  var profileView = Backbone.View.extend({
	languagesCount: 0,
	educationsCount:0,
    el: "#main",
	events:{
		"click a#add-language-btn": "addLanguage",
		"click button[id^=delete-lang]": "deleteLanguage",
		"click a#add-education-btn": "addEducation",
		"click button[id^=delete-edu]": "deleteEducation",
		"submit form#basic-info-form": "submitBasic",
	},
	initialize: function(options){
		this.model = new UserProfile({id:"me"})
		this.model.bindings = {
			gender: '[name=gender]',
			civilState: '[name=civilState]',
			showBirthday: '[name=showBirthday]',
			birthDay: '[name=birthDay]',
			birthMonth: '[name=birthMonth]',
			birthYear: '[name=birthYear]',
			interestedInM: '[name=interestedInM]',
			interestedInF: '[name=interestedInF]',
			
			allAboutYou: '[name=allAboutYou]',
			mainMission: '[name=mainMission]',
			occupation: '[name=occupation]',
			company: '[name=company]',
			
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
				/*if (sc.model.get("languages").length === 0){
					var tpl = _.template(languageTpl, {index: 1})
					$('#languages-list').prepend(tpl)
					sc.languagesCount = 1
				}else sc.setLanguages(sc.model.get("languages"))*/
			},
			error: function() { console.log(arguments); }	 	
	  })
	},
    render: function(){
	  console.log('Profile render')
	  console.log(this.model.attributes)
      $(this.el).html(profileTpl);
	  $('#basic-info').html(basicInfoTpl)
	  $('#about-me').html(aboutMeTpl)
	  $('#likes-info').html(likesTpl)
      
      //this._modelBinder.bind(this.model, this.el, this.model.bindings)
	  //Takes care of languages, intializes bindings, etc
	  this.initLanguages()
	  this.initEducations()
	  
    },
	close: function(){ 
		this._modelBinder.unbind()
	},
	submitBasic: function(e){
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
			values.languages.push({name: data['language-' + i], level: data['level-' + i]})
		}
		//Parsing interestedIn
		if (data.interestedInM && data.interestedInF){
			values.interestedIn = "B"
		}else if (!data.interestedInM && !data.interestedInF){
			values.interestedIn = "N"
		} else values.interestedIn = data.interestedInM || data.interestedInF
		
		api.put('/profiles/me/', values, function(response){
			console.log(response)
			var tpl = _.template(alertTpl, {extraClass: 'alert-success', heading: "Success!", message: response.msg})
			$('#main').prepend(tpl)
		})
		
		console.log(values)
	},
	initLanguages: function(){
	  if (this.model.get("languages").length === 0){
	    var tpl = _.template(languageTpl, {index: 1})
		$('#languages-list').prepend(tpl)
		this.languagesCount = 1
	  }else this.setLanguages(this.model.get("languages"))
				
	  this._modelBinder.bind(this.model, this.el, this.model.bindings)
	  
	},
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
		//this._modelBinder.bind(this.model, this.el, this.model.bindings)
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
		if (this.languagesCount == 1) return
		var id = e.target.id.split("-", 3)
		id = id[id.length-1]
		$("#select-lang-" + id).remove()
		delete this.model.bindings["language_" + id]
		delete this.model.bindings["level_" + id]
		this.languagesCount--
	},
	initEducations: function(){
	  if (this.model.get("education").length === 0){
	    var tpl = _.template(educationTpl, {index: 1})
		$('#education-list').prepend(tpl)
		this.educationsCount = 1
	  }else this.setEducations(this.model.get("education"))
				
	  this._modelBinder.bind(this.model, this.el, this.model.bindings)
	},
	setEducations: function(educations){
		var size = educations.length
		for (var i = 1; i < size + 1; i++){
			var tpl = _.template(educationTpl, {index: i})
			$('#education-list').prepend(tpl)
		}
		var s
		var sc = this
		$.each(educations, function(i, field){
			s = i + 1 + ""
			sc.model.bindings["institution_" + s] = '[name=institution-' + s +']'
			sc.model.bindings["degree_" + s] = '[name=degree-' + s +']'
		})
		this.educationsCount += size
	},
	addEducation: function(e){
		e.preventDefault(e);
		var edus = $('div[id^=select-study-]').length + 1
		var tpl = _.template(educationTpl, {index: edus})
		this.model.bindings["institution_" + edus] = '[name=institution-' + edus +']'
		this.model.bindings["degree_" + edus] = '[name=degree-' + edus +']'
		$('div[id^=select-study-]:last').after(tpl)
		this.educationsCount++
		return false;
	},
	deleteEducation: function(e){
		if (this.educationsCount == 1) return
		var id = e.target.id.split("-", 3)
		id = id[id.length-1]
		console.log(id)
		$("#select-study-" + id).remove()
		delete this.model.bindings["institution_" + id]
		delete this.model.bindings["degree_" + id]
		this.educationsCount--
	},
	
  });

  return profileView;
});