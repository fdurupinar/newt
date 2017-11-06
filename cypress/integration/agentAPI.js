/***
 * Test for sending and receiving messages
 */

let io = require('socket.io-client');
let globalTestData = require('../testData/globalTestData.js');

describe('Agent API Test', function () {
    let agent;
    let agentId = '103abc';
    let agentName = "testAgent";


    function newAgent() {
       it('new Agent', function () {
           let Agent = require("../../agent-interaction/agentAPI.js");
           agent = new Agent(agentName, agentId, io);
           expect(agent).to.be.ok;
        });
    }

    function checkAgentProperties(){
        it('Agent properties', function() {
            expect(agent.agentId).to.be.equal(agentId);
            expect(agent.agentName).to.be.equal(agentName);
            expect(agent.colorCode).to.be.equal("#00bfff");
        });
    }

    function loadModel() {
       it('agent.connectToServer', function (done) {
            agent.connectToServer("http://localhost:3000/",  function (socket) {
                expect(socket).to.be.ok;
                agent.loadModel( function () {
                    agent.loadOperationHistory( function () {
                        expect(agent.opHistory).to.be.ok;
                        expect(agent.pageDoc).to.be.ok;
                        done();
                    });
                });
            });
       });
    }

    function changeName() {
        it('agent.changeName', function (done) {
            agent.changeName("HAL", function () {
                setTimeout(function () { //should wait here as well
                    expect(agent.agentName).to.equal("HAL");
                    done();
                }, 100);

            });

        });
    }

    function sendMessage() {
        it('agent.sendMessage', function (done) {
            cy.window().should(function (window) {
                let model = window.testApp.model;
                let testMsg = "hello my name is <b> Bob </b>";
                agent.sendRequest("agentMessage", {comment: testMsg, targets: "*"}, function (data) {
                    setTimeout(function () { //should wait here as well
                        expect(data).to.equal("success");
                        let messages = model.get('_page.list');
                        expect(messages[messages.length -1].comment).equal(testMsg);
                        done();
                    }, 100);
                });
            });

        });
    }

    function sendGetRequest(){

        it('agent.getNode', function(done) {
            let node1 = "agentNode1";
            agent.getNodeRequest(node1, function () {
                equal(agent.selectedNode.id).to.equal(node1);
                done();
            });

        });
        it('agent.getEdge', function(done) {
            let edge1 = "agentNode1-agentNode2";
            agent.getEdgeRequest(edge1, function () {
                equal(agent.selectedEdge.id).to.equal(edge1);
                done();
            });
        });
    }

    function addNodeRequest(props, attr) {

        it('agent.addNode', function (done) {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                agent.sendRequest("agentAddNodeRequest", props, function (nodeId) {
                    setTimeout(function () { //should wait here as well
                        var val = modelManager.getModelNode(nodeId);

                        expect(val).to.be.ok;
                        expect(val.data.class).to.equal(props.data.class);
                        expect(val.position.x).to.equal(props.position.x);
                        expect(val.position.y).to.equal(props.position.y);
                        done();
                    }, 100);
                });
            });
        });

    }


    function addEdgeRequest(props) {
        it('agent.addEdge', function (done) {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                let nodes = modelManager.getModelNodesArr();
                let source = nodes[0].data.id;
                let target = nodes[1].data.id;
                props.data.source = source;
                props.data.target = target;
                props.id = source + "-" + target;
                agent.sendRequest("agentAddEdgeRequest", props, function (edgeId) {
                    setTimeout(function () { //should wait here as well
                        var val = modelManager.getModelEdge(edgeId);
                        expect(props.id).to.equal(edgeId);
                        expect(val).to.be.ok;
                        expect(val.data.class).to.equal(props.data.class);
                        expect(val.data.source).to.equal(props.data.source);
                        expect(val.data.target).to.equal(props.data.target);
                        done();
                    }, 100);
                });
            });
        });
    }

    function deleteElesRequest(type){
        it('agent.agentDeleteElesRequest', function (done) {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                let nodes = modelManager.getModelNodesArr();
                let edges = modelManager.getModelEdgesArr();
                let eles  = [edges[0].data.id, nodes[0].data.id, nodes[1].data.id] ;
                agent.sendRequest("agentDeleteElesRequest", {elementIds: eles, type: type}, function (deletedCnt) {
                    setTimeout(function () { //should wait here as well
                        var valEdge = modelManager.getModelEdge(eles[0]);
                        expect(valEdge).to.be.not.ok;
                        var valNode1 = modelManager.getModelNode(eles[1]);
                        expect(valNode1).to.be.not.ok;
                        var valNode2 = modelManager.getModelNode(eles[2]);
                        expect(valNode2).to.be.not.ok;

                        done();

                    }, 1000);

                });
            });
        });
    }

    function undoDeleteRequest() {
        it('agent.undoDeleteRequest', function (done) {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                agent.sendRequest("agentUndoRequest", null, function (undoActionStr) {
                    setTimeout(function () { //should wait here as well
                        var val = modelManager.getModelNodesArr();
                        expect(val.length).to.equal(2);

                        var val = modelManager.getModelEdgesArr();
                        expect(val.length).to.equal(1);

                        done();
                    }, 100);

                });
            });
        });
    }

    function redoDeleteRequest() {
        it('agent.redoDeleteRequest', function (done) {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                agent.sendRequest("agentRedoRequest", null, function (undoActionStr) {
                    setTimeout(function () { //should wait here as well
                        var val = modelManager.getModelNodesArr();
                        expect(val.length).to.equal(0);

                        var val = modelManager.getModelEdgesArr();
                        expect(val.length).to.equal(0);

                        done();
                    }, 100);

                });
            });
        });
    }

    function moveNodeRequest(pos){
        it('agent.moveNodeRequest', function (done) {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                let nodeId = modelManager.getModelNodesArr()[0].id;
                agent.sendRequest("agentMoveNodeRequest", {id: nodeId,  pos:pos}, function(){
                    setTimeout(function () { //should wait here as well
                        var val = modelManager.getModelNodeAttribute("position", nodeId);
                        expect(val).to.be.deep.equal(pos);
                        done();
                    },100);
                });
            });
        });
    }


    function aligRequest(){
        it('agent.alignRequest', function (done) {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                let nodeId = modelManager.getModelNodesArr()[0].id;
                agent.sendRequest("agentAlignRequest", {nodeIds: '*', alignTo:nodeId, horizontal:"none", vertical:"center"}, function(res){
                    setTimeout(function () { //should wait here as well
                        expect(res).to.equal("success");
                        done();
                    },100);
                });

            });
        });
    }

    function addCompound(type, inds){

        it('agent.addCompoundRequest', function(done) {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                //add first two nodes
                let  elementIds = [];
                inds.forEach(function(ind){
                    elementIds.push( modelManager.getModelNodesArr()[ind].id);
                });

                agent.sendRequest("agentAddCompoundRequest", {val:type, elementIds:elementIds}, function(data){
                    setTimeout(function () {

                        var node = modelManager.getModelNode(elementIds[0]);

                        expect(data).to.equal("success");
                        expect(node.data.parent).to.be.ok;
                        var parent = modelManager.getModelNode(node.data.parent);
                        expect(parent.data.class).to.equal(type);
                        done();
                    },100);
                });
            });
        });
    }


    function merge(){
        it('agent.merge', function(done) {
            expect(globalTestData.sbgnData).to.be.ok;

            agent.sendRequest('agentMergeGraphRequest', {type: 'sbgn', graph: globalTestData.sbgnData}, function (data) {
                expect(data).to.be.ok;
                done();
            });
        });
    }

    function newFile(){
        it('agent.newFileRequest', function(done) {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                let jQuery = window.jQuery;

                agent.sendRequest("agentNewFileRequest", null, function(){
                    setTimeout(function () { //should wait here as well
                        var cy = modelManager.getModelCy();
                        expect(jQuery.isEmptyObject(cy.nodes) && jQuery.isEmptyObject(cy.edges)).to.equal(true);
                        done();
                    },100);
                });
            });
        });
    }



    function disconnect(){
        it('Agent disconnect', function(done) {
            agent.disconnect(function(){
                expect(agent.socket.subscribed).to.be.not.ok;
                done();
            });


        });

    }

    newAgent();
    checkAgentProperties();
    loadModel();
    changeName();
    sendMessage();

    addNodeRequest({position: {x: 30, y: 40 }, data:{class: "macromolecule"}});
    addNodeRequest({position: {x: 50, y: 60 }, data:{class: "macromolecule"}});
    addNodeRequest({position: {x: 70, y: 80 }, data:{class: "macromolecule"}});
    addNodeRequest({position: {x: 90, y: 100} , data:{class: "process"}});
    addEdgeRequest({data:{class: "consumption"}});


    addCompound("compartment", [0,1]); //complexes cannot have edges
    addCompound("complex", [2,3]); //complexes cannot have edges

    // moveNodeRequest({x:100, y:80});
    // aligRequest();
    //
    // deleteElesRequest("simple");
    // undoDeleteRequest();
    //
    // deleteElesRequest("smart");
    // undoDeleteRequest();
    // redoDeleteRequest();
    //
    // newFile();
    //
    // merge();
    // disconnect();



});
