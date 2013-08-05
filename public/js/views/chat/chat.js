/*globals Firebase*/
define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var contentTpl = require('tmpl!templates/home/chat.html');
	var chatElementTpl = require('tmpl!templates/home/chat_elem.html');
	var UserProfile = require('models/ProfileModel');
	var api = require("api");
	var Promise = require('promise');
	var config = require("config");

	var firebase = config.getValue('firebase');

	var ChatView = Backbone.View.extend({

		events: {
			'click .button-close-chat' : 'closeRoom',
			'keyup .chat-textarea' : 'sendMessage'
		},

		initialize: function(privateRoom, conectionRoom, otherId){
			var self = this;
			this.myId = api.getUserId();

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
			Promise.parallel(this.otherProfile.fetch(), this.myProfile.fetch()).then(this.render.bind(this)).then(this.addOnlineRef.bind(this));
			var offsetRef = new Firebase(firebase + "/.info/serverTimeOffset");
			offsetRef.on("value", function(snap) {
				self.timeOffset = snap.val();
			});
		},

		addOnlineRef: function (){
			var self = this;
			var onlineRef = new Firebase(firebase + '/onlineRef/' + this.otherId);
			onlineRef.on('value', function(snapshot){
				if (snapshot.val() === true){
					this.$(".chat[data-id='" + self.otherId + "']").find('span.dot-chat').addClass('online-chat');
				} else {
					this.$(".chat[data-id='" + self.otherId + "']").find('span.dot-chat').removeClass('online-chat');
				}
			});
		},

		render: function(){
			var self = this;
			//Create the listener to the creation of new chats...
			this.privateRoom.limit(20).on('child_added', function(snapshot) {
				var content;
				var message = snapshot.val().message;
				var senderId = snapshot.val().senderId;
				//debugger;
				var chatWindow = self.$el.find('#chat-window');
				var len = chatWindow.children().length;
				if (len === 0){
					content = $(chatElementTpl({img: senderId === self.myId ? self.myProfile.get('avatar'): self.otherProfile.get('avatar'), who: senderId === self.myId ? 'me': 'other'})).data('sender', senderId);
					content.find('.chat-element-text-' + (senderId === self.myId ? 'me': 'other')).append('<p>' + message + '</p>');
					chatWindow.append(content);
				} else {
					var lastChild = chatWindow.children(':eq('+ (len - 1) + ')');
					if (lastChild.data('sender') === senderId){
						//We have to append the message to the last child
						lastChild.find('.chat-element-text-' + (senderId === self.myId ? 'me': 'other')).append('<p>' + message + '</p>');
						chatWindow.scrollTop(chatWindow.prop('scrollHeight'));
					} else {
						content = $(chatElementTpl({img: senderId === self.myId ? self.myProfile.get('avatar'): self.otherProfile.get('avatar'), who: senderId === self.myId ? 'me': 'other'})).data('sender', senderId);
						content.find('.chat-element-text-' + (senderId === self.myId ? 'me': 'other')).append('<p>' + message + '</p>');
						chatWindow.append(content)
							.scrollTop(chatWindow.prop('scrollHeight'));
					}
				}
				if (snapshot.val().time && snapshot.val().time > new Date().getTime() + self.timeOffset - 2000){
					self.displayBlinkingTitle()();
					self.tweet();
				}
			});

			//TODO get the name of the target
			var content = contentTpl({userName: this.otherProfile.get('firstName') + ' ' + this.otherProfile.get('lastName'), id: self.otherId, age: this.otherProfile.get('age')});
			return this.$el.addClass('chat nChild-' + this.otherId).attr('data-id', this.otherId).html(content);
		},

		sendMessage: function(e){
			var ta = $(e.target);
			var maxrows = 5;
			if (e.keyCode === 13) {
				var val = ta.val();
				val = val.replace(/(\r\n|\n|\r)/gm,"");
				this.checkWindowOpened();
				this.privateRoom.push({'message' : val, 'senderId': this.myId, 'time': Firebase.ServerValue.TIMESTAMP});
				ta.val('');
				ta.prop('rows', 1);
			}
			while (ta.prop('scrollHeight') > ta.prop('clientHeight') + 1 && !window.opera && ta.prop('rows') < maxrows) {
				ta.css('overflow','hidden');
				ta.prop('rows', ta.prop('rows') + 1);
			}
			if (ta.prop('scrollHeight') > ta.prop('clientHeight') + 1){
				ta.css('overflow', 'auto');
			}

		},

		checkWindowOpened: function(){
			//This methods checks if the other's window chat is opened. If it's not, it sends an event to open it
			var otherRoom = new Firebase(firebase + '/rooms/' + this.otherId + '/' + this.myId);
			otherRoom.set({'visible': true});
		},

		closeRoom: function(e){
			var trg = $(e.target);
			trg.closest('.chat').remove();
			this.conectionRoom.child(this.otherId).remove();
			this.privateRoom.off();
		},

		displayBlinkingTitle: function(){
			var oldTitle = document.title;
			var msg = "New message!";
			var timeoutId;
			var blink = function() {
				document.title = document.title === msg ? oldTitle : msg;
			};
			var clear = function() {
				clearInterval(timeoutId);
				document.title = oldTitle;
				window.onmousemove = null;
				timeoutId = null;
			};
			if (window.onmousemove == null){
				return function (){
					if (!timeoutId){
						timeoutId = setInterval(blink, 1000);
						window.onmousemove = clear;
					}
				};
			} else {
				return function(){

				};
			}
		},

		tweet: function(){
			if (window.onmousemove != null){
				$('#chat-sound').get(0).play();
			}
		},
	});

return ChatView;
});
