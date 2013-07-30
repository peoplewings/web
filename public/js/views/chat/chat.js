define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var contentTpl = require('tmpl!templates/home/chat.html');
	var chatElementTpl = require('tmpl!templates/home/chat_elem.html');
	var UserProfile = require('models/ProfileModel');
	var api = require("api");
	var Promise = require('promise');

	var ChatView = Backbone.View.extend({

		events: {
			'click .button-close-chat' : 'closeRoom',
			'keyup .chat-textarea' : 'sendMessage'
		},

		initialize: function(privateRoom, conectionRoom, otherId){
			var self = this;
			this.myId = api.getUserId()
			if (privateRoom && this.myId != otherId){
				this.otherProfile = new UserProfile({
					id: otherId,
				});
				this.myProfile = new UserProfile({
					id: this.myId,
				});
				this.otherId = otherId;
				this.privateRoom = privateRoom;
				this.conectionRoom = conectionRoom;
				//Create presence conection with the otherId
				var onlineRef = new Firebase('https://peoplewings-chat.firebaseIO.com/onlineRef/' + otherId);
				onlineRef.on('value', function(snapshot){
					if (snapshot.val() === true){
						this.$(".chat[data-id='" + self.otherId + "']").find('.online-button').css('background-color', 'green');
					} else {
						this.$(".chat[data-id='" + self.otherId + "']").find('.online-button').css('background-color', 'grey');
					}
				});
				Promise.parallel(this.otherProfile.fetch(), this.myProfile.fetch()).then(this.render.bind(this));
			} else {
				debugger;
			}
		},


		render: function(){
			var self = this;
			//Create the listener to the creation of new chats...
			this.privateRoom.limit(20).on('child_added', function(snapshot) {
				var message = snapshot.val()['message'];
				var senderId = snapshot.val()['senderId'];
				//debugger;
				var chatWindow = self.$el.find('#chat-window');
				var len = chatWindow.children().length;
				if (len == 0){
					var content = $(chatElementTpl({img: senderId == self.myId ? self.myProfile.get('avatar'): self.otherProfile.get('avatar'), who: senderId == self.myId ? 'me': 'other'})).data('sender', senderId);
					content.find('.chat-element-text-' + (senderId == self.myId ? 'me': 'other')).append('<p>' + message + '</p>');
					chatWindow.append(content);
				} else {
					var lastChild = chatWindow.children(':eq('+ (len - 1) + ')');
					if (lastChild.data('sender') == senderId){
						//We have to append the message to the last child
						lastChild.find('.chat-element-text-' + (senderId == self.myId ? 'me': 'other')).append('<p>' + message + '</p>');
						chatWindow.scrollTop(chatWindow.prop('scrollHeight'));
					} else {
						var content = $(chatElementTpl({img: senderId == self.myId ? self.myProfile.get('avatar'): self.otherProfile.get('avatar'), who: senderId == self.myId ? 'me': 'other'})).data('sender', senderId);
						content.find('.chat-element-text-' + (senderId == self.myId ? 'me': 'other')).append('<p>' + message + '</p>');
						chatWindow.append(content)
							.scrollTop(chatWindow.prop('scrollHeight'));
					}
				}
			});

			//TODO get the name of the target
			var content = contentTpl({userName: this.otherProfile.get('firstName') + ' ' + this.otherProfile.get('lastName'), id: self.otherId});
			return this.$el.addClass('chat nChild-' + this.otherId).attr('data-id', this.otherId).html(content);
		},

		sendMessage: function(e){
			if (e.keyCode == 13) {
				var val = $(e.target).val();
				val = val.replace(/(\r\n|\n|\r)/gm,"");
				this.checkWindowOpened();
				this.privateRoom.push({'message' : val, 'senderId': this.myId});
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