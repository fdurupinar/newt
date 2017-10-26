/*
 *	Model initialization
 *  Event handlers of model updates
 *	Author: Funda Durupinar Babur<f.durupinar@gmail.com>
 */
let app = module.exports = require('derby').createApp('cwc', __filename);
app.loadViews(__dirname + '/views');

let _ = require('underscore');
let oneColor = require('onecolor');

//Test mode vs Trips mode
const tripsMode = true;

const ONE_DAY = 1000 * 60 * 60 * 24;
const ONE_HOUR = 1000 * 60 * 60;
const ONE_MINUTE = 1000 * 60;
const BobId = "Bob123";

let docReady = false;

app.on('model', function (model) {

    model.fn('biggerTime', function (item) {
        let duration = model.get('_page.durationId');
        let startTime;
        if (duration < 0)
            startTime = 0;
        else
            startTime = new Date - duration;

        return item.date > startTime;
    });

    model.fn('biggerThanCurrentTime', function (item) {

        let clickTime = model.get('_page.clickTime');


        return item.date > clickTime;
    });

    model.fn('myMessages', function (msg) {

        let userId = model.get('_session.userId');

        return msg.userId === userId;
    });

});


app.get('/', function (page, model, params) {
    function getId() {
        return model.id();
    }

    function idIsReserved() {
        let ret = model.get('documents.' + docId) != undefined;
        return ret;
    }

    let docId = getId();

    while (idIsReserved()) {
        docId = getId();
    }


    return page.redirect('/' + docId);
});


app.get('/:docId', function (page, model, arg, next) {
    let  room;

    let self = this;
    room = arg.docId;

    model.subscribe('documents', function () {

        let docPath = 'documents.' + arg.docId;
        model.ref('_page.doc', ('documents.' + arg.docId));

        model.subscribe(docPath, function (err) {
            if (err) return next(err);

            model.createNull(docPath, { // create the empty new doc if it doesn't already exist
                id: arg.docId
            });

            // //chat related
            model.set('_page.room', room);
            //
            model.set('_page.durations', [{name: 'All', id: -1}, {name: 'One day', id: ONE_DAY}, {
                name: 'One hour',
                id: ONE_HOUR
            }, {name: 'One minute', id: ONE_MINUTE}]);


            // create a reference to the document
            let pysb = model.at((docPath + '.pysb'));
            let cy = model.at((docPath + '.cy'));
            let history = model.at((docPath + '.history'));
            let undoIndex = model.at((docPath + '.undoIndex'));
            let context = model.at((docPath + '.context'));
            let images = model.at((docPath + '.images'));

            let users = model.at((docPath + '.users'));//user lists with names and color codes
            let userIds = model.at((docPath + '.userIds')); //used for keeping a list of subscribed users
            let messages = model.at((docPath + '.messages'));
            let provenance = model.at((docPath + '.provenance'));

            pysb.subscribe(function () {
            });

            cy.subscribe(function () {
            });

            history.subscribe(function () {
            });

            undoIndex.subscribe(function () {
            });

            context.subscribe(function () {
            });

            images.subscribe(function () {
            });

            messages.subscribe(function () {
            });

            provenance.subscribe(function(){
            });

            userIds.subscribe(function () {
                let userId = model.get('_session.userId');


                let userIdsList = userIds.get();


                if (!userIdsList) {
                    userIdsList = [userId];
                    userIds.push(userId);
                    self.firstUser = true;
                }
                else if (userIdsList.indexOf(userId) < 0) { //does not exist
                    userIds.push(userId);
                    self.firstUser = true;
                }
                else //user exists
                    self.firstUser = false;

                userIdsList = userIds.get();


                users.subscribe(function () {

                    console.log("User is being subscribed");

                    let colorCode = null;
                    let userName = null;
                    if (users.get(userId)) {
                        userName = users.get(userId).name;
                        colorCode = users.get(userId).colorCode;
                    }
                    if (!userName)
                        userName = 'User ' + userIdsList.length;
                    if (!colorCode)
                        colorCode = getNewColor();


                    users.set(userId, {name: userName, colorCode: colorCode});

                    return page.render();
                });
            });

        });
    });

});

app.proto.changeDuration = function () {

    return this.model.filter('_page.doc.messages', 'biggerTime').ref('_page.list');

};


/***
 * Called only once in a browser after first page rendering
 * @param model
 * @returns {*}
 */

app.proto.create = function (model) {

    model.set('_page.showTime', true);

    let self = this;
    docReady = true;
    let userId = model.get('_session.userId');

    let isQueryWindow = false;

    self.socket = io();
    self.notyView = noty({layout: "bottom",theme:"bootstrapTheme", text: "Please wait while model is loading."});

    $('#messages').contentchanged = function () {

        $('#messages').scrollTop($('#messages')[0].scrollHeight  - $('.message').height());

    };



    if(tripsMode)
        $('#unitTestArea').hide();
    else
        $('#unitTestArea').show();



    //change scroll position
    $('#messages').scrollTop($('#messages')[0].scrollHeight  - $('.message').height());


    let id = model.get('_session.userId');
    let name = model.get('_page.doc.users.' + id +'.name');

    // Make modelManager instance accessible through window object as testModelManager to use it in Cypress tests
    self.modelManager = window.testModelManager = require('./public/collaborative-app/modelManager.js')(model, model.get('_page.room'), sbgnviz);
    self.modelManager.setName( model.get('_session.userId'),name);

    let images = model.get('_page.doc.images');
    self.dynamicResize(model.get('_page.doc.images'));

    $(window).on('resize', function(){
        let images = model.get('_page.doc.images');
        self.dynamicResize(images);
    });


    //Notify server about the client connection
    self.socket.emit("subscribeHuman", { userName:name, room:  model.get('_page.room'), userId: id});

    self.agentSocket = require('./public/collaborative-app/clientSideSocketListener')(this);
    self.agentSocket.listen();


    self.factoidHandler = require('./public/collaborative-app/factoid/factoid-handler')(this) ;
    self.factoidHandler.initialize();



    // //If we get a message on a separate window
    window.addEventListener('message', function(event) {
        if(event.data) { //initialization for a query winddow
            isQueryWindow = true;

            self.modelManager.newModel("me"); //do not delete cytoscape, only the model

             chise.updateGraph(JSON.parse(event.data), function(){
                 self.modelManager.initModel(cy.nodes(), cy.edges(), appUtilities, "me");
             });
        }

    }, false);


    descendingSort = function (a, b) {
        return (!b ? b.date : void 0) - (!a ? a.date : void 0);
    };

    self.lastMsgInd = -1; //increment in app.proto.app

    //start listening to keyboard events
    $('#inputs-comment').keydown(function (e){
        if(e.keyCode === 38 ||  e.keyCode === 40 ) { //up or down arrows

            //sorted list
            let filteredMsgs = model.filter('_page.doc.messages', 'myMessages').get();
            let messages = filteredMsgs.sort(function(a, b){
                return b-a;
            });


            if(messages && self.lastMsgInd > -1) {
                let msg = messages[self.lastMsgInd].comment;
                self.model.set('_page.newComment', msg);

                if (e.keyCode === 38)
                    self.lastMsgInd = self.lastMsgInd > 0 ? self.lastMsgInd - 1 : 0;
                else
                    self.lastMsgInd = self.lastMsgInd < messages.length - 1 ? self.lastMsgInd + 1 : messages.length - 1;
            }
        }

    });


    //Loading cytoscape and clients
    if(!isQueryWindow) { //initialization for a regular window

        self.loadCyFromModel(function(isModelEmpty){

                if (isModelEmpty)
                    self.modelManager.initModel(cy.nodes(), cy.edges(), appUtilities, "me");
                else
                    self.notyView.close();
        });


    }

    self.editorListener = require('./public/collaborative-app/editor-listener.js')(self.modelManager,self.socket, id);

    //Listen to these after cy is loaded
    $("#undo-last-action, #undo-icon").click(function (e) {
        if(self.modelManager.isUndoPossible()){
            self.modelManager.undoCommand();

        }
    });

    $("#redo-last-action, #redo-icon").click(function (e) {
        if(self.modelManager.isRedoPossible()){
            self.modelManager.redoCommand();

        }
    });


    this.atBottom = true;


    //If there is already one connection to Bob, don't open another
    let userIds = self.modelManager.getUserIds();

    if(tripsMode && userIds.indexOf(BobId) < 0) { //there's no agent for Bob
        this.connectTripsAgent();
    }


    return model.on('all', '_page.list', (function (_this) {

        return function () {
            if (!_this.atBottom) {
                return;
            }

            document.getElementById("messages").scrollTop= document.getElementById("messages").scrollHeight;

            // $('#messages').scrollTop($('#messages')[0].scrollHeight  - $('.message').height());

            return _this.container.scrollTop = _this.list.offsetHeight;
        };
    })(this));
};


app.proto.loadCyFromModel = function(callback){
    let self = this;
    let jsonArr = self.modelManager.getJsonFromModel();

    if (jsonArr) {

        //Updates data fields and sets style fields to default
        chise.updateGraph({
            nodes: jsonArr.nodes,
            edges: jsonArr.edges
        }, function(){
            //Update position fields separately
            cy.nodes().forEach(function(node){

                let position = self.modelManager.getModelNodeAttribute('position',node.id());

                node.position({x:position.x, y: position.y});


                //reset to the center
                cy.panzoom().reset();

                if(callback) callback(false);
            });

        });



        // let props;
        // //update app utilities as well
        // props = self.modelManager.getLayoutProperties();
        // if(props) appUtilities.currentLayoutProperties = props;
        //
        // props = self.modelManager.getGeneralProperties();
        // if(props) appUtilities.currentGeneralProperties = props;
        //
        // props = self.modelManager.getGridProperties();
        // if(props) appUtilities.currentGridProperties = props;


    }
    if(callback) callback(true); //model is empty
};

function moveNodeAndChildren(positionDiff, node, notCalcTopMostNodes) {
        let oldX = node.position("x");
        let oldY = node.position("y");
        node.position({
            x: oldX + positionDiff.x,
            y: oldY + positionDiff.y
        });
        let children = node.children();
        children.forEach(function(child){
            moveNodeAndChildren(positionDiff, child, true);
        });
}

app.proto.listenToNodeOperations = function(model){

    let self = this;

    model.on('all', '_page.doc.factoid', function(op, val, prev, passed){

        if(docReady &&  !passed.user) {
            self.factoidHandler.setFactoidModel(val);
            //reset to the center
            // cy.panzoom().reset();

        }


    });

    model.on('change', '_page.doc.undoIndex', function (id, cmdInd) {

        let cmd = model.get('_page.doc.history.' + id);
        //modelOp = cmd.opName;
        //console.log(modelOp);
    });


    //Update inspector

//TODO: Open later
    // model.on('all', '_page.doc.cy.nodes.**', function(id, op, val, prev, passed){
    //     inspectorUtilities.handleSBGNInspector();
    // });

    model.on('all', '_page.doc.cy.nodes.*', function(id, op, val, prev, passed){


        if(docReady &&  !passed.user) {

            let node  = model.get('_page.doc.cy.nodes.' + id);


            if(!node || !node.id){ //node is deleted
                cy.getElementById(id).remove();
            }

        }

    });


    model.on('all', '_page.doc.cy.nodes.*.addedLater', function(id, op, idName, prev, passed){ //this property must be something that is only changed during insertion


        if(docReady && !passed.user) {
            let pos = model.get('_page.doc.cy.nodes.'+ id + '.position');
            let sbgnclass = model.get('_page.doc.cy.nodes.'+ id + '.data.class');
            let visibility = model.get('_page.doc.cy.nodes.'+ id + '.visibility');
            let parent = model.get('_page.doc.cy.nodes.'+ id + '.data.parent');

            if(parent === undefined) parent = null;



            let newNode = chise.elementUtilities.addNode(pos.x, pos.y, sbgnclass, id, parent, visibility);

            // self.modelManager.initModelNode(newNode,"me", true);


            let parentEl = cy.getElementById(parent);
            newNode.move({"parent":parentEl});

        }

    });



    model.on('all', '_page.doc.cy.nodes.*.position', function(id, op, pos,prev, passed){

        if(docReady && !passed.user) {
            let posDiff = {x: (pos.x - cy.getElementById(id).position("x")), y:(pos.y - cy.getElementById(id).position("y"))} ;
            moveNodeAndChildren(posDiff, cy.getElementById(id)); //children need to be updated manually here
            //parent as well
            cy.panzoom().fit();

        }
    });
    model.on('all', '_page.doc.cy.nodes.*.highlightColor', function(id, op, val,prev, passed){

        //call it here so that everyone can highlight their own textbox

        self.factoidHandler.highlightSentenceInText(id, val);

        if(docReady && !passed.user) {
            if(!val){
                cy.getElementById(id).css({
                    "overlay-color": null,
                    "overlay-padding": 10,
                    "overlay-opacity": 0
                });

            }
            else
                cy.getElementById(id).css({
                    "overlay-color": val,
                    "overlay-padding": 10,
                    "overlay-opacity": 0.25
                });




            console.log("changed highlightcolor");
        }

    });

    //Called by agents to change bbox
    model.on('all', '_page.doc.cy.nodes.*.data.bbox.*', function(id, att, op, val,prev, passed){
        if(docReady && !passed.user) {

            let newAtt = cy.getElementById(id).data("bbox");
            newAtt[att] = val;
            cy.getElementById(id).data("bbox", newAtt);


        }
    });




    //Called by agents to change specific properties of data
    model.on('all', '_page.doc.cy.nodes.*.data.*', function(id, att, op, val,prev, passed){
        if(docReady && !passed.user) {

            cy.getElementById(id).data(att, val);
            if(att === "parent")
                cy.getElementById(id).move({"parent":val});
        }
    });


    model.on('all', '_page.doc.cy.nodes.*.data', function(id,  op, data,prev, passed){

        console.log("only data");


        if(docReady && !passed.user) {

            //cy.getElementById(id).data(data); //can't call this if cy element does not have a field called "data"
            cy.getElementById(id)._private.data = data;

            //to update parent
            let newParent = data.parent;
            if(newParent === undefined)
                newParent = null;  //must be null explicitly

            cy.getElementById(id).move({"parent":newParent});
            cy.getElementById(id).updateStyle();


        }
    });



    model.on('all', '_page.doc.cy.nodes.*.expandCollapseStatus', function(id, op, val,prev, passed){


        if(docReady && !passed.user) {
            let expandCollapse = cy.expandCollapse('get'); //we can't call chise.expand or collapse directly as it causes infinite calls
            if(val === "collapse")
                expandCollapse.collapse(cy.getElementById(id));
            else
                expandCollapse.expand(cy.getElementById(id));

        }

    });


    model.on('all', '_page.doc.cy.nodes.*.highlightStatus', function(id, op, highlightStatus, prev, passed){ //this property must be something that is only changed during insertion
        if(docReady && !passed.user) {
            try{
                let viewUtilities = cy.viewUtilities('get');

                console.log(highlightStatus);
                if(highlightStatus === "highlighted")
                    viewUtilities.highlight(cy.getElementById(id));
                else
                    viewUtilities.unhighlight(cy.getElementById(id));

                //    cy.getElementById(id).updateStyle();
            }
            catch(e){
                console.log(e);
            }

        }
    });

    model.on('all', '_page.doc.cy.nodes.*.visibilityStatus', function(id, op, visibilityStatus, prev, passed){ //this property must be something that is only changed during insertion
        if(docReady && !passed.user) {
            try{
                let viewUtilities = cy.viewUtilities('get');


                if(visibilityStatus === "hide") {
                    viewUtilities.hide(cy.getElementById(id));
                }
                else { //default is show
                    viewUtilities.show(cy.getElementById(id));
                }

            }
            catch(e){
                console.log(e);
            }

        }
    });

};

app.proto.listenToEdgeOperations = function(model){

    let self = this;

    //Update inspector
    //TODO: open later
    // model.on('all', '_page.doc.cy.edges.**', function(id, op, val, prev, passed){
    //     inspectorUtilities.handleSBGNInspector();
    // });


    model.on('all', '_page.doc.cy.edges.*.highlightColor', function(id, op, val,prev, passed){

        if(docReady && !passed.user) {
            if(val == null){

                cy.getElementById(id).css({
                    "overlay-color": null,
                    "overlay-padding": 10,
                    "overlay-opacity": 0
                });

            }
            else {
                cy.getElementById(id).css({
                    "overlay-color": val,
                    "overlay-padding": 10,
                    "overlay-opacity": 0.25
                });
            }


        }
    });

    model.on('all', '_page.doc.cy.edges.*', function(id, op, val, prev, passed){


        if(docReady &&  !passed.user) {
            let edge  = model.get('_page.doc.cy.edges.' + id); //check

            if(!edge|| !edge.id){ //edge is deleted
                cy.getElementById(id).remove();

            }
        }

    });

    model.on('all', '_page.doc.cy.edges.*.addedLater', function(id,op, idName, prev, passed){//this property must be something that is only changed during insertion


        if(docReady && !passed.user ){
            let source = model.get('_page.doc.cy.edges.'+ id + '.data.source');
            let target = model.get('_page.doc.cy.edges.'+ id + '.data.target');
            let sbgnclass = model.get('_page.doc.cy.edges.'+ id + '.data.class');
            let visibility = model.get('_page.doc.cy.nodes.'+ id + '.visibility');

            let newEdge = chise.elementUtilities.addEdge(source, target, sbgnclass, id, visibility);

            self.modelManager.initModelEdge(newEdge,"me", true);

        }

    });

    model.on('all', '_page.doc.cy.edges.*.data', function(id, op, data,prev, passed){

        if(docReady && !passed.user) {

            //cy.getElementById(id).data(data); //can't call this if cy element does not have a field called "data"
            cy.getElementById(id)._private.data = data;

            cy.getElementById(id).updateStyle();


        }

    });

    model.on('all', '_page.doc.cy.edges.*.data.*', function(id, att, op, val,prev, passed){

        if(docReady && !passed.user)
            cy.getElementById(id).data(att, val);

    });




    model.on('all', '_page.doc.cy.edges.*.bendPoints', function(id, op, bendPoints, prev, passed){ //this property must be something that is only changed during insertion
        if(docReady && !passed.user) {

            try{
                let edge = cy.getElementById(id);
                if(bendPoints.weights && bendPoints.weights.length > 0) {
                    edge.data('cyedgebendeditingWeights', bendPoints.weights);
                    edge.data('cyedgebendeditingDistances', bendPoints.distances);
                    edge.addClass('edgebendediting-hasbendpoints');
                }
                else{
                    edge.data('cyedgebendeditingWeights',[]);
                    edge.data('cyedgebendeditingDistances',[]);
                    edge.removeClass('edgebendediting-hasbendpoints');
                }

                edge.trigger('cyedgebendediting.changeBendPoints');
             //   cy.getElementById(id).updateStyle();

            }
            catch(e){
                console.log(e);
            }

        }
    });

    model.on('all', '_page.doc.cy.edges.*.highlightStatus', function(id, op, highlightStatus, prev, passed){ //this property must be something that is only changed during insertion
        if(docReady && !passed.user) {
            let viewUtilities = cy.viewUtilities('get');
            try{
                if(highlightStatus === "highlighted")
                    viewUtilities.highlight(cy.getElementById(id));
                else
                    viewUtilities.unhighlight(cy.getElementById(id));

            }
            catch(e){
                console.log(e);
            }

        }
    });

    model.on('all', '_page.doc.cy.edges.*.visibilityStatus', function(id, op, visibilityStatus, prev, passed){ //this property must be something that is only changed during insertion
        if(docReady && !passed.user) {
            let viewUtilities = cy.viewUtilities('get');
            try{
                if(visibilityStatus === "hide")
                    viewUtilities.hide(cy.getElementById(id));
                else
                    viewUtilities.show(cy.getElementById(id));
            }
            catch(e){
                console.log(e);
            }
        }
    });

};


app.proto.init = function (model) {
    let timeSort;
    let self = this;

    this.listenToNodeOperations(model);
    this.listenToEdgeOperations(model);

    //Listen to other model operations
    model.on('all', '_page.doc.factoid.*', function(id, op, val, prev, passed){
        if(docReady &&  !passed.user) {
            self.factoidHandler.setFactoidModel(val);
        }
    });

    //Cy updated by other clients
    model.on('all', '_page.doc.cy.initTime', function( op, val, prev, passed){

        if(docReady) {
            if(docReady && !passed.user) {
                self.loadCyFromModel(function () {

                });
            }
            self.notyView.close();
        }
    });


    //
    // model.on('all', '_page.doc.cy.layoutProperties', function(op, val) {
    //     if (docReady){
    //         for(let att in val){ //assign each attribute separately to keep the functions in currentlayoutproperties
    //             if(appUtilities.currentLayoutProperties[att])
    //                 appUtilities.currentLayoutProperties[att] = val[att];
    //         }
    //
    //     }
    //
    // });
    //
    // model.on('all', '_page.doc.cy.generalProperties', function(op, val) {
    //     if (docReady){
    //         for(let att in val){ //assign each attribute separately to keep the functions in currentgeneralproperties
    //             if(appUtilities.currentGeneralProperties[att])
    //                 appUtilities.currentGeneralProperties[att] = val[att];
    //         }
    //
    //     }
    //
    // });
    //
    // model.on('all', '_page.doc.cy.gridProperties', function(op, val) {
    //     if (docReady){
    //         for(let att in val){ //assign each attribute separately to keep the functions in currentgridproperties
    //             if(appUtilities.currentGridProperties[att])
    //                 appUtilities.currentGridProperties[att] = val[att];
    //         }
    //
    //     }
    //
    // });
    //

    //Sometimes works
    model.on('all', '_page.doc.images', function() {
        if (docReady) {
            triggerContentChange('static-image-container');
            triggerContentChange('receivedImages');
        }
    });

    model.on('all', '_page.doc.history', function(){
        if(docReady){
            triggerContentChange('command-history-area');
        }
    });

    model.on('insert', '_page.list', function (index) {

        let com = model.get('_page.list');
        let myId = model.get('_session.userId');


        if(docReady)
            triggerContentChange('messages');

        if (com[com.length - 1].userId != myId)
            playSound();

    });


    timeSort = function (a, b) {
        return (a != null ? a.date : void 0) - (b != null ? b.date : void 0);
    };


    return model.sort('_page.doc.messages', timeSort).ref('_page.list');
};

////////////////////////////////////////////////////////////////////////////
// UI events
////////////////////////////////////////////////////////////////////////////

app.proto.onScroll = function (element) {

    let bottom, containerHeight, scrollBottom;
    bottom = this.list.offsetHeight;
    containerHeight = this.container.offsetHeight;
    scrollBottom = this.container.scrollTop + containerHeight;

    return this.atBottom = bottom < containerHeight || scrollBottom > bottom - 10;

};

app.proto.changeColorCode = function(){

    let  user = this.model.at('_page.doc.users.' + this.model.get('_session.userId'));
    user.set('colorCode', getNewColor());

};

app.proto.runUnitTests = function(){
    let self = this;
    let userId = this.model.get('_session.userId');

    let room = this.model.get('_page.room');

    //require("./public/test/testsAgentAPI.js")(("http://localhost:3000/" + room), self.modelManager);
    // require("./public/test/testsCausalityAgent.js")(("http://localhost:3000/" + room), self.modelManager);
    //  require("./public/test/testsModelManager.js")(self.modelManager, userId);

    require("./public/test/testsUserOperations.js")(self.modelManager);
    require("./public/test/testsMessages.js")(this);
    require("./public/test/testOptions.js")(); //to print out results

};


app.proto.openPCQueryWindow = function(pc_url){
  console.log("hehlloo");
};

/*
 * This is for selecting messages from the select box and test queries
 */
app.proto.updateTripsMessage = function(){

    let e = document.getElementById("test-messages");
    let msg = e.options[e.selectedIndex].text;

    this.model.set('_page.newComment', msg);
};


app.proto.resetConversationOnTrips = function(){
    //directly ask the server as this client may not have a tripsAgent
    this.socket.emit('resetConversationRequest');
};


app.proto.connectCausalityAgent = function(){
    this.socket.emit('connectToCausalityAgentRequest');
};


app.proto.connectTripsAgent = function(){
    let self = this;

    let TripsGeneralInterfaceAgent = require("./agent-interaction/TripsGeneralInterfaceAgent.js");
    self.TripsAgent = new TripsGeneralInterfaceAgent("Bob", BobId);

    console.log("Bob connected");
    self.TripsAgent.connectToServer("http://localhost:3000/", function(){
        self.TripsAgent.loadModel(function () {
            self.TripsAgent.init();
            self.TripsAgent.loadChatHistory(function () {
            });
        });
    });
};


app.proto.enterMessage = function(event){

    let self = this;

    if (event.keyCode === 13 && !event.shiftKey) {
       self.add(event);

        // prevent default behavior
        event.preventDefault();

    }


};

app.proto.add = function (event, model, filePath) {
    let self = this;
    if(!model)
        model = this.model;

    this.atBottom = true;

    let comment;
    comment = model.del('_page.newComment'); //to clear  the input box
    if (!comment) return;

    let targets  = [];
    let users = model.get('_page.doc.userIds');

    let myId = model.get('_session.userId');
    for(let i = 0; i < users.length; i++){
        let user = users[i];
        if(user === myId ||  document.getElementById(user).checked){
            targets.push({id: user});
        }
    }

    let msgUserId = model.get('_session.userId');
    let msgUserName = model.get('_page.doc.users.' + msgUserId +'.name');

    comment.style = "font-size:large";

    let msg = {room: model.get('_page.room'),
        targets: targets,
        userId: msgUserId,
        userName: msgUserName,
        comment: comment
    };


    let filteredMsgs = model.filter('_page.doc.messages', 'myMessages').get();

    self.lastMsgInd = filteredMsgs.length; //new message will be added next

    //also lets server know that a client message is entered.
    self.socket.emit('getDate', msg, function(date){ //get the date from the server
        msg.date = date;

        model.add('_page.doc.messages', msg);
        event.preventDefault();

        //change scroll position
       $('#messages').scrollTop($('#messages')[0].scrollHeight  - $('.message').height());

    });
};


app.proto.clearHistory = function () {
    this.model.set('_page.clickTime', new Date);

    return this.model.filter('_page.doc.messages', 'biggerThanCurrentTime').ref('_page.list');
};


app.proto.uploadFile = function(evt){
    let self = this;
    try{
        let room = this.model.get('_page.room');
        let fileStr = this.model.get("_page.newFile").split('\\');
        let filePath = fileStr[fileStr.length-1];

        let file = evt.target.files[0];

        let reader = new FileReader();
        let images = this.model.get('_page.doc.images');
        let imgCnt = 0;
        if(images)
            imgCnt = images.length;
        reader.onload = function(evt){
            self.modelManager.addImage({ img: evt.target.result,room: room, fileName: filePath, tabIndex:imgCnt, tabLabel:filePath});

        };

        reader.readAsDataURL(file);

        //Add file name as a text message
        this.model.set('_page.newComment',  ("Sent image: "  + filePath) );

        this.app.proto.add(evt,this.model, filePath);


    }
    catch(error){ //clicking cancel when the same file is selected causes error
        console.log(error);

    }
};


app.proto.count = function (value) {
    return Object.keys(value || {}).length;
};


app.proto.formatTime = function (message) {
    let hours, minutes, seconds, period, time;
    time = message && message.date;


    if (!time) {
        return;
    }
    time = new Date(time);
    hours = time.getHours();

    minutes = time.getMinutes();

    seconds = time.getSeconds();

    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    if (seconds < 10) {
        seconds = '0' + seconds;
    }

    return hours + ':' + minutes + ':' + seconds;
};


app.proto.formatObj = function(obj){

    return JSON.stringify(obj, null, '\t');
};


app.proto.dynamicResize = function (images) {
    let win = $(window);

    let windowWidth = win.width();
    let windowHeight = win.height();

    let canvasWidth = 1200;
    let canvasHeight = 680;


    if (windowWidth > canvasWidth) {

        $("#canvas-tab-area").resizable({
                alsoResize: '#inspector-tab-area',
                minWidth: 860
            }
        );

        let wCanvasTab = $("#canvas-tab-area").width();

        $(".nav-menu").width(wCanvasTab);
        $(".navbar").width(wCanvasTab);
        $("#sbgn-toolbar").width(wCanvasTab);

        $("#sbgn-network-container").width( wCanvasTab* 0.99);

        if(images) {
            images.forEach(function (img) {
                $("#static-image-container-" + img.tabIndex).width(wCanvasTab * 0.99);
            });
        }


        $("#inspector-tab-area").resizable({
            minWidth:355
        });

        let wInspectorTab = $("#inspector-tab-area").width();
        $("#sbgn-inspector").width(wInspectorTab);
        $("#canvas-tabs").width( wCanvasTab* 0.99);
    }
    else {
        if(images) {
            images.forEach(function (img) {
                $("#static-image-container-" + img.tabIndex).width(800);
                $("#static-image-container-" + img.tabIndex).height(680);
            });
        }
    }

    if (windowHeight > canvasHeight) {

        $("#canvas-tab-area").resizable({
            alsoResize:'#inspector-tab-area',
            minHeight: 600
        });

        let hCanvasTab = $("#canvas-tab-area").height();
        $("#sbgn-network-container").height(hCanvasTab * 0.99);
        if(images) {
            images.forEach(function (img) {
                $("#static-image-container-" + img.tabIndex).height(hCanvasTab * 0.99);
            });
        }

        $("#inspector-tab-area").resizable({
            alsoResize:'#canvas-tab-area',
            minHeight: 600
        });

        let hInspectorTab = $("#inspector-tab-area").height();

        $("#sbgn-inspector").height(hInspectorTab);
        $("#factoid-area").height(hInspectorTab * 0.9);
        $("#factoidBox").height(hInspectorTab * 0.6);
    }
};


////////////////////////////////////////////////////////////////////////////
//Local functions
////////////////////////////////////////////////////////////////////////////
function getNewColor(){
    let gR = 1.618033988749895; //golden ratio
    let h = Math.floor((Math.random() * gR * 360));//Math.floor((cInd * gR - Math.floor(cInd * gR))*360);
    let cHsl = [h, 70 + Math.random() * 30, 60 + Math.random() * 10];
    let strHsl = 'hsl('+cHsl[0]  +', '+ cHsl[1] + '%, ' + cHsl[2] +'%)';

    return oneColor(strHsl).hex();
}


function triggerContentChange(divId){
    //TODO: triggering here does not always work
    $(('#' + divId)).trigger('contentchanged');
}

function playSound() {
    try {
        document.getElementById('notificationAudio').play();
        if (!document)
            throw err;
    }
    catch (err) {
        return err;
    }

}
