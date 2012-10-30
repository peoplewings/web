define([
  'jquery',
  'backbone',
  'utils',
  'api',
  'text!templates/app/profile.html',
  'text!templates/app/basic-form.html',
  'text!templates/app/about-form.html',
  'text!templates/app/likes-form.html',
  'text!templates/app/contact-form.html',
  'text!templates/lib/language-field.html',
  'text!templates/lib/education-field.html',
  'text!templates/lib/alert.html',
  'models/Profile',
  'views/app/list',
], function($, Backbone, utils, api, profileTpl, basicInfoTpl, aboutMeTpl, likesTpl, contactTpl, languageTpl, educationTpl, alertTpl, UserProfile, List){
  var profileView = Backbone.View.extend({
    el: "#main",
	events:{
		"click a#add-language-btn": "addLanguage",
		"click button[id^=delete-lang]": "deleteLanguage",
		"click a#add-education-btn": "addEducation",
		"click button[id^=delete-edu]": "deleteEducation",
		"submit form#basic-info-form": "submitProfile",
		"submit form#about-me-form": "submitProfile",
		"submit form#likes-form": "submitProfile",
		"submit form#contact-form": "submitProfile",
	},
	initialize: function(options){
		this.model = new UserProfile({id:"me"})
		this.model.bindings = {
			//Basic info 
			gender: '[name=gender]',
			civilState: '[name=civilState]',
			showBirthday: '[name=showBirthday]',
			birthDay: '[name=birthDay]',
			birthMonth: '[name=birthMonth]',
			birthYear: '[name=birthYear]',
			Male: '[name=interestedInM]',
			Female: '[name=interestedInF]',
			//InterestedIn, Languages, CurrentCity, HomeTown
			//About me
			allAboutYou: '[name=allAboutYou]',
			mainMission: '[name=mainMission]',
			occupation: '[name=occupation]',
			company: '[name=company]',
			personalPhilosophy: '[name=personalPhilosophy]',
			politicalOpinion: '[name=politicalOpinion]',
			religion: '[name=religion]',
			//Educations
			// Likes
			movies: '[name=movies]',
			sports: '[name=sports]',
			otherPages: '[name=otherPages]',
			enjoyPeople: '[name=enjoyPeople]',
			sharing: '[name=sharing]',
			quotes: '[name=quotes]',
			incredible: '[name=incredible]',
			pwOpinion: '[name=pwOpinion]',
			inspiredBy: '[name=inspiredBy]',
			// Contact
			emails: '[name=emails]',
			phone: '[name=phone]',
			//SocialNetWorks, instantMessages
		}
      this._modelBinder = new Backbone.ModelBinder();
	  var sc = this
	  this.model.fetch({ 
			success: function(model){
				console.log("Fetch model:", model)
				sc.render()
			},
			error: function() { console.log(arguments) }	 	
	  })
	},
    render: function(){
      $(this.el).html(profileTpl);

	  $('#basic-info').html(basicInfoTpl)
	  $('#about-me').html(aboutMeTpl)
	  $('#likes-info').html(likesTpl)
	  $('#contact-info').html(contactTpl)
	
	  //Clears bindings for languages and educations
	  this.clearBindings()
	  //Takes care of languages, intializes bindings, etc
	  this.initLanguages()
	  //Takes care of educations, intializes bindings, etc
	  this.initEducations()
	  
	  $('.foo').typeahead({
                                        ajax: {
                                              url: "http://peoplewings-backend.herokuapp.com/ajax/search/university/",
                                              timeout: 500,
                                              //displayField: "name",
                                              triggerLength: 1,
                                              method: "get",
                                              //loadingClass: "loading-circle",
                                              preDispatch: function (query) {
                                                  //showLoadingMask(true);
                                                  return {
                                                      q: query,
                                                      otherParam: 123
                                                  }
                                              },
										onselect: function(){
											console.log(arguments)
										},
                                              preProcess: function (data) {
                                                  //showLoadingMask(false);
                                                  if (data.code !== 200) {
                                                      return false;
                                                  }
                                                  return data.data;
                                                              
                                              }
                                          }})
	  
    },
	close: function(){ 
		this._modelBinder.unbind()
	},
	submitProfile: function(e){
		e.preventDefault(e);
		console.log('Submit profile ' + e.target.id)
		console.log(this.model.attributes)
		this.model.save()
	},
	initLanguages: function(){
	  if (this.languagesCount === 0){
	    var tpl = _.template(languageTpl, {index: 1})
		$('#languages-list').prepend(tpl)
		this.model.bindings["x_language_1"] = '[name=language-1]'
		this.model.bindings["x_level_1"] = '[name=level-1]'
		this.languagesCount = 1
	  }else this.setLanguages(this.model.get("languages"))
		
	  this._modelBinder.bind(this.model, this.el, this.model.bindings)
	  
	},
	setLanguages: function(languages){
		//console.log(languages)
		var size = languages.length
		for (var i = 1; i < size + 1; i++){
			var tpl = _.template(languageTpl, {index: i})
			$('#languages-list').append(tpl)
		}
		var s
		var sc = this
		$.each(languages, function(i, field){
			s = i + 1 + ""
			sc.model.bindings["x_language_" + s] = '[name=language-' + s +']'
			sc.model.bindings["x_level_" + s] = '[name=level-' + s +']'
		})
		this.languagesCount += size
	},
	addLanguage: function(e){
		//console.log(this.languagesCount)
		//if (this.languagesCount == 4) return false
		e.preventDefault(e);
		var langs = $('div[id^=select-lang-]').length + 1
		this.model.set("x_language_" + langs)
		this.model.set("x_level_" + langs)
		var tpl = _.template(languageTpl, {index: langs})
		this.model.bindings["x_language_" + langs] = '[name=language-' + langs +']'
		this.model.bindings["x_level_" + langs] = '[name=level-' + langs +']'
		$('div[id^=select-lang-]:last').after(tpl)
		this.languagesCount++
		this._modelBinder.bind(this.model, this.el, this.model.bindings)
		return false;
	},
	deleteLanguage: function(e){
		if (this.languagesCount == 1) return false
		var id = e.target.id.split("-", 3)
		id = id[id.length-1]
		$("#select-lang-" + id).remove()
		delete this.model.bindings["x_language_" + id]
		delete this.model.bindings["x_level_" + id]
		this.model.unset("x_language_" + id)
		this.model.unset("x_level_" + id)
		this.languagesCount--
	},
	clearBindings: function(){
		for (binding in this.model.bindings){
			if (binding.indexOf('x_') == 0){
				delete this.model.bindings[binding]
			} 
		}
	},
	initEducations: function(){
		this.educationList = new List({
			el: "#education-list", 
			tpl: educationTpl, 
			keys: ["institution", "degree"],
			items: this.model.get("education"),
			itemId: 'select-study'
		})
		this.educationList.render()
		this._modelBinder.bind(this.model, this.el, this.model.bindings)
	},
	addEducation: function(e){
		e.preventDefault(e);
		this.educationList.addItem();
		this._modelBinder.bind(this.model, this.el, this.model.bindings)
		return false
	},
	deleteEducation: function(e){
		console.log("Delete education", e.target.id)
		this.educationList.deleteItem(e.target.id)
		return false
	},
  });

  return profileView;
});