define(function(require){
	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var Chat = require("views/chat/chat")

	var  ChatManager = Backbone.View.extend({
		el: '#chat-manager',

		initialize: function(options){
			if(api.userIsLoggedIn()){
				this.closeEvents = [];
				this.render(); 
			}
		},

		render: function(){
			var self = this;
			var userId = api.getUserId();
			var generalRef = new Firebase('https://peoplewings-chat.firebaseIO.com/rooms/' + userId);
 			generalRef.on('child_added', function(snapshot) {				
				var otherId = snapshot.name();
				if (otherId != userId){
					var myRoom = new Firebase('https://peoplewings-chat.firebaseIO.com/private/' + (otherId < userId ? otherId + '-' + userId: userId + '-' + otherId));
					var chatRoom = new Chat(myRoom, otherId);
					var contents = chatRoom.render();
					this.$('#chat-wrapper').append(contents);
				}
			});

		},

		loadProfileData: function(){
			debugger;
		},

		openRoom: function(otherId) {
			var self = this;
			var userId = api.getUserId();
			//I warn the other user that I wanna chat with him...
			var roomRef = new Firebase('https://peoplewings-chat.firebaseIO.com/rooms/' + otherId + '/' + userId);
			roomRef.set('true');
			//I create a reference of the chat with the other user in my room. So, if I refresh the page, the chat will still be there...
			var roomRefMine = new Firebase('https://peoplewings-chat.firebaseIO.com/rooms/' + userId + '/' + otherId);	
			roomRefMine.set('true');	
			//Now, we open the room of communication...	
			var myRoom = new Firebase('https://peoplewings-chat.firebaseIO.com/private/' + (otherId < userId ? otherId + '-' + userId: userId + '-' + otherId));
			var chatRoom = new Chat(myRoom, otherId);
			var contents = chatRoom.render();
			//We must bind an event onClose()
			$(contents).find('#close-button-' + otherId).bind('click', {room: roomRefMine}, function(e){
				//When a chat closes we must remove the roomRefMine
				e.data.room.remove();
				//destroy the chat window...
				self.$('#chat-wrapper').find('.nChild-' + otherId).remove();

			});
			this.$('#chat-wrapper').append(contents);
		},

	});
	return new ChatManager;
});