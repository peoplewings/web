define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var contentTpl = require('tmpl!templates/home/chat.html');
	var UserProfile = require('models/ProfileModel');
	var api = require("api");

	var ChatView = Backbone.View.extend({

		events: {
			'click .button-close-chat' : 'closeRoom',
			'keyup .chat-textarea' : 'sendMessage'
		},

		initialize: function(privateRoom, conectionRoom, otherId){
			var self = this;
			this.myId = api.getUserId()
			if (privateRoom && this.myId != otherId){
				this.model = new UserProfile({
					id: otherId,
				});
				this.otherId = otherId;
				this.privateRoom = privateRoom;
				this.conectionRoom = conectionRoom;

				this.privateRoom.limit(20).on('child_added', function(snapshot) {
					var message = snapshot.val();
					this.$('#chat-window-' + self.otherId).append('<p>' + message.message + '</p>');
					this.$('#chat-window-' + self.otherId).scrollTop(this.$('#chat-window-' + self.otherId).prop('scrollHeight'));
				});
				this.model.fetch().then(this.render.bind(this));
			} else {
				debugger;
			}
		},


		render: function(){
			//TODO get the name of the target
			var content = contentTpl({id: this.otherId, userName: this.model.get('firstName') + ' ' + this.model.get('lastName')});
			return this.$el.addClass('chat nChild-' + this.otherId).html(content);
		},

		displayChatMessage: function(name, text){
			$('<div/>').text(text).prepend($('<em/>').text(name+': ')).appendTo($('.chat-window'));
		},

		sendMessage: function(e){
			if (e.keyCode == 13) {
				var val = $(e.target).val();
				val = val.replace(/(\r\n|\n|\r)/gm,"");
				this.checkWindowOpened();
				this.privateRoom.push({'message' : val});
				$(e.target).val('');
			} 
		},

		checkWindowOpened: function(){
			//This methods checks if the other's window chat is opened. If it's not, it sends an event to open it
			var otherRoom = new Firebase('https://peoplewings-chat.firebaseIO.com/rooms/' + this.otherId + '/' + this.myId);
			otherRoom.set({'visible': true});
		},

		closeRoom: function(e){
			var trg = $(e.target);
			trg.closest('.chat').remove();
			this.conectionRoom.child(this.otherId).remove();
			this.privateRoom.off();
			//FALTARIA CERRAR LA ROOM
		}, 

	});

return ChatView;
});