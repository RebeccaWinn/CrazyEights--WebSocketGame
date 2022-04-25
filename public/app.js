
//WEBSOCKET MOMENTS
// adding players to server
// showing only the players own cards
// side chat
//broadcasting each new card laid down
// alerting players when an 8 is played
// alerting when someone has wonS
var app=new Vue({
    el:'#app',
    data:{
        socket:null,
        nameToSend:"",
        players:[],
        suits:["spades", "diamonds", "clubs", "hearts"],
        //values:["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
        values:[1,2,3,4,5,6,7,8,9,10,11,12,13],
        deck:[],
        temporaryDeck:[],
        originalDeck:[],
        playerDeck1:[],
        cardPlayed:[],
        // cardChosen: {Value:7,Suit:"clubs"}
        //discardPile:[],
        socket: null,
        senderName: "",
        messageToSend: "",
        incomingMessages: [],
        playedCards:[],
        join:false,
        
    },
    methods:{
        sendMessage: function () {
            var data = {
              action: "send-message",
              name: this.nameToSend,
              message: this.messageToSend
            };
            this.socket.send(JSON.stringify(data));
          },
          sendCard: function () {
            var data = {
              action: "send-cardPlayed",
              value:this.cardPlayed.Value,
              suit:this.cardPlayed.Suit
            };
            this.socket.send(JSON.stringify(data));
          },
        sendPlayerName:function(){
            var data={
                action:"send-player",
                name:this.nameToSend
            };
            this.socket.send(JSON.stringify(data));
            this.join=true;
        },
        sendName:function(){
            console.log("message to be sent:",this.nameToSend)
            this.players.push(this.nameToSend);
        },
        playCard:function(card){
            this.cardPlayed=card;
            this.sendCard();

        },
        createDeck:function(){
            for(var s = 0; s < this.suits.length; s++){
                for(var v = 0; v < this.values.length; v++){
                var card = {Value: this.values[v], Suit: this.suits[s]};
                this.deck.push(card);
                this.originalDeck.push(card);
                }
            }
        },
        shuffleDeck:function(){
            for(var i=0;i<1000;i++){
                var place1=Math.floor((Math.random()*this.deck.length));
                var place2=Math.floor((Math.random()*this.deck.length));
                this.temporaryDeck=this.deck[place1];
                this.deck[place1]=this.deck[place2];
                this.deck[place2]=this.temporaryDeck;
            }
        },
    
        giveCardsToPlayers:function(){
            for(i=0;i<7;i++){
                var randomCard=Math.floor((Math.random()*this.deck.length));
                this.playerDeck1.push(this.deck[randomCard]);
                this.deck.pop(this.deck[randomCard]);
            }
        },
        drawCard:function(){
            this.playerDeck1.push(this.deck[0]);
            this.deck.shift(this.deck[0]);  
            
        },
        playerTurn:function(card){
            this.playerDeck1.splice(card,1);
        
            this.checkStatusOfPlayers();   
            
        },
        checkStatusOfPlayers:function(){
            if(this.playerDeck1.length==0){
            var data = {
                action: "send-PlayerWon",
                player:this.nameToSend
            };
            this.socket.send(JSON.stringify(data));
            }
            
        },
        connectSocket:function(){
            this.socket= new WebSocket("wss://crazyeight.herokuapp.com");
            this.socket.onmessage=(event)=>{
                //message received from server to client 
                console.log('received:',event.data);
                var data = JSON.parse(event.data);
                console.log('received:', data);

            if (data.action && data.action == "new-PlayerJoined"){
                this.players.push(data);
            }
            if (data.action && data.action == "playerWon"){
                alert(data.player +" has Won")
            }
            if (data.action && data.action == "cardPlayed"){
                this.playedCards.push(data);
            }
            if (data.action && data.action == "new-message") {
            // record the incoming new message
                this.incomingMessages.push(data);
            }
            };
            this.socket.onopen=()=>{
                //this.socket.send("Hi. I'm the client")
            };
        }
    },
    created:function(){
        this.connectSocket();
        this.createDeck();
        this.shuffleDeck();
        this.giveCardsToPlayers();
        console.log(this.deck);
        
    }
});