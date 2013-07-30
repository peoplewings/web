define(function(require){
	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api");
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
			var publicRoom = new Firebase('https://peoplewings-chat.firebaseIO.com/rooms/' + userId);
 			publicRoom.on('child_added', function(snapshot) {				
				var otherId = snapshot.name();
				if (otherId != userId){
					var privateRoom = new Firebase('https://peoplewings-chat.firebaseIO.com/private/' + (otherId < userId ? otherId + '-' + userId: userId + '-' + otherId));					
					var chatRoom = new Chat(privateRoom, publicRoom, otherId);
					//var contents = chatRoom.render();
					this.$('#chat-wrapper').append(chatRoom.$el);
				}
			});

		},

		loadProfileData: function(){
			debugger;
		},

		openRoom: function(otherId) {
			var self = this;
			var userId = api.getUserId();
			var roomRefMine = new Firebase('https://peoplewings-chat.firebaseIO.com/rooms/' + userId + '/' + otherId);	
			roomRefMine.set({'visible': true});
			//Now, we open the room of communication...	
		},

	});
	return new ChatManager;
});