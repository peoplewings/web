define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var contentTpl = require('tmpl!templates/home/chat.html');
	var UserProfile = require('models/ProfileModel');

	var ChatView = Backbone.View.extend({

		initialize: function(roomRef, otherId){
			var self = this;
			if (roomRef){
				this.model = new UserProfile({
					id: otherId,
				});
				
				this.model.fetch({success: function(prof){
					debugger;
					alert(prof.toJSON);
				}});
				this.otherId = otherId;
				var myDataRef = roomRef;
				this.eventBinds();
				myDataRef.on('child_added', function(snapshot) {
					var message = snapshot.val();
					self.displayChatMessage(message.name, message.text);
				});
			}
		},


		render: function(){
			//TODO get the name of the target
			var content = contentTpl({id: this.otherId, userName: this.model.get('firstName')});
			return this.$el.addClass('chat nChild-' + this.otherId).html(content);
		},

		displayChatMessage: function(name, text){
			$('<div/>').text(text).prepend($('<em/>').text(name+': ')).appendTo($('.chat-window'));
		},

		eventBinds: function(){
			var self = this;
			$("#text-area-" + this.otherId).live("keyup", function(e){
				self.sendMessage(e);
			});
		},

		sendMessage: function(e){
			if (e.keyCode == 13) {
				console.log($("#text-area-" + this.otherId).val());
			} 
		},

	});

return ChatView;
});

/*
var myDataRef = new Firebase('https://peoplewings-chat.firebaseIO.com/');

$('#inputMesg').keyup(function (e) {
	console.log(e.keyCode);
	if (e.keyCode == 13) {
		var name = $('#inputName').val();
		var text = $('#inputMesg').val();
		myDataRef.push({name: name, text:text});
		$('#inputMesg').val('');
	}
});
*/