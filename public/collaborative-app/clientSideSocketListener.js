/**
 * Created by durupina on 11/14/16.
 * Human listens to agent socket and performs menu operations requested by the agent
*/
var jsonMerger = require('./merger/json-merger.js');

module.exports =  function(app) {

    return {

        listen: function () {
            var self = this;


            app.socket.on('loadFile', function (txtFile, callback) {
                try {

                    sbgnviz.loadSBGNMLText(txtFile);
                    if (callback) callback("success");
                }
                catch (e) {
                    console.log(e);
                    if(callback) callback();

                }

            });

            app.socket.on('newFile', function (data, callback) {
                try {
                    cy.remove(cy.elements());
                    app.modelManager.newModel("me"); //do not delete cytoscape, only the model
                    //close all the other tabs
                    app.model.set('_page.doc.images', null);
                    app.dynamicResize(); //to clean the canvas 

                    if (callback) callback("success");
                }
                catch (e) {
                    console.log(e);
                    if(callback) callback();

                }
            });

            app.socket.on('runLayout', function (data, callback) {
                try {
                    $("#perform-layout").trigger('click');
                    if (callback) callback("success");
                }
                catch (e) {
                    console.log(e);
                    if(callback) callback();

                }
            });


            app.socket.on('addNode', function (param, callback) {
                try {
                    //does not trigger cy events
                    var newNode = chise.elementUtilities.addNode(param.position.x, param.position.y, param.data.class);

                    //notifies other clients

                    app.modelManager.addModelNode(newNode.id(), param, "me");
                    app.modelManager.initModelNode(newNode, "me");

                    if (callback) callback(newNode.id());
                }
                catch (e) {
                    console.log(e);
                    if(callback) callback();

                }
            });


            app.socket.on('deleteEles', function (data, callback) {
                try {
                    //unselect all others
                    cy.elements().unselect();


                    //first delete edges
                    data.elementIds.forEach(function (id) {
                        cy.getElementById(id).select();
                    });


                    if (data.type === "simple"){
                        chise.deleteElesSimple(cy.elements(':selected'));
                    }
                    else
                        chise.deleteNodesSmart(cy.elements(':selected'));

                    if(callback) callback("success");
                }
                catch (e) {
                    console.log(e);
                    if(callback) callback();

                }
            });

            app.socket.on('addImage', function (data, callback) {
                try {

                    var status = app.modelManager.addImage(data);
                    var images = app.modelManager.getImages();
                    app.dynamicResize(images);

                    if (callback) callback(status);

                }
                catch (e) {
                    console.log(e);
                    if(callback) callback();

                }
            });


            app.socket.on('addEdge', function (data, callback) {
                try {
                    //does not trigger cy events
                    var newEdge = chise.elementUtilities.addEdge(source, target, sbgnclass, id, visibility);

                    //notifies other clients
                    app.modelManager.addModelEdge(newNode.id(), data, "me");
                    // app.modelManager.initModelEdge(newEdge, "me");

                    if (callback) callback(newEdge.id());
                }
                catch (e) {
                    console.log(e);
                    if(callback) callback();

                }
            });


            app.socket.on('align', function (data, callback) {
                try {
                    var nodes = cy.collection();
                    if (data.nodeIds === '*' || data.nodeIds === 'all')
                        nodes = cy.nodes();
                    else
                        data.nodeIds.forEach(function (nodeId) {
                            nodes.add(cy.getElementById(nodeId));
                        });

                    chise.align(nodes, data.horizontal, data.vertical, cy.getElementById(data.alignTo));

                    if (callback) callback("success");
                }
                catch (e) {
                    console.log(e);
                    if (callback) callback();

                }

            });
            app.socket.on('updateVisibility', function (data, callback) {
                try {
                    //unselect all others
                    cy.elements().unselect();

                    if (data.val === "showAll")
                        $("#show-all").trigger('click');
                    else {
                        data.elementIds.forEach(function (id) {
                            cy.getElementById(id).select();
                        });

                        if (data.val == "show")
                            $("#show-selected").trigger('click');
                        else
                            $("#hide-selected").trigger('click');
                    }


                    if (callback) callback("success");
                }
                catch (e) {
                    console.log(e);
                    if (callback) callback();

                }
            });

            app.socket.on('searchByLabel', function (data, callback) {
                try {
                    //unselect all others
                    cy.elements().unselect();

                    chise.searchByLabel(data.label);

                    if (callback) callback("success");
                }
                catch (e) {
                    console.log(e);
                    if (callback) callback();

                }
            });
            app.socket.on('updateHighlight', function (data, callback) {
                try {
                    //unselect all others
                    cy.elements().unselect();

                    if (data.val === "remove") {
                        $("#remove-highlights").trigger('click');
                    }
                    else {
                        data.elementIds.forEach(function (id) {
                            cy.getElementById(id).select();
                        });

                        if (data.val === "neighbors")
                            $("#highlight-neighbors-of-selected").trigger('click');
                        else if (data.val === "processes")
                            $("#highlight-processes-of-selected").trigger('click');
                    }

                    if (callback) callback("success");
                }
                catch (e) {
                    console.log(e);
                    if (callback) callback();

                }
            });

            app.socket.on('updateExpandCollapse', function (data, callback) {
                try {

                    //unselect all others
                    cy.elements().unselect();

                    data.elementIds.forEach(function (id) {
                        cy.getElementById(id).select();
                    });

                    if (data.val === "collapse")
                        $("#collapse-selected").trigger('click');
                    else
                        $("#expand-selected").trigger('click');

                    if (callback) callback("success");
                }
                catch (e) {
                    console.log(e);
                    if (callback) callback();

                }
            });


            app.socket.on('addCompound', function (data, callback) {
                try {
                    //unselect all others
                    cy.elements().unselect();

                    data.elementIds.forEach(function (nodeId) {

                        console.log(nodeId);
                        cy.getElementById(nodeId).select();
                    });

                      chise.createCompoundForGivenNodes(cy.nodes(':selected'), data.val);



                    // if (data.val === "complex")
                    //     $("#add-complex-for-selected").trigger('click');
                    // else
                    //     $("#add-compartment-for-selected").trigger('click');


                    if (callback) callback("success");
                }
                catch (e) {
                    console.log(e);
                    if (callback) callback();

                }

            });

            app.socket.on('clone', function (data, callback) {
                try {
                    cy.elements().unselect();

                    data.elementIds.forEach(function (nodeId) {
                        cy.getElementById(nodeId).select();
                    });

                    $("#clone-selected").trigger('click');


                    if (callback) callback("success");
                }
                catch (e) {
                    console.log(e);
                    if (callback) callback();

                }
            });

            //Open in another window
            app.socket.on('openPCQueryWindow', function(data, callback){
                var loc = window.location.href;
                if (loc[loc.length - 1] === "#") {
                    loc = loc.slice(0, -1);
                }
                var w = window.open((loc + "_query"), function () {

                });

                // //because window opening takes a while
                setTimeout(function () {

                    var json = chise.convertSbgnmlTextToJson(data.graph);
                    w.postMessage(JSON.stringify(json), "*");
                }, 2000);

            });

            app.socket.on("displaySbgn", function(sbgn, callback){

                var jsonObj = sbgnviz.convertSbgnmlTextToJson(sbgn);

                //get another sbgncontainer and display the new SBGN model.
                app.modelManager.newModel("me", true);

                chise.updateGraph(jsonObj, function(){
                    app.modelManager.initModel(cy.nodes(), cy.edges(), appUtilities, "me");

                    $("#perform-layout").trigger('click');

                    if (callback) callback("success");
                });

            });

            app.socket.on("mergeSbgn", function (sbgn, callback) {

                var newJson = sbgnviz.convertSbgnmlTextToJson(sbgn);
                self.mergeJsonWithCurrent(newJson, callback);

            });

            app.socket.on("mergeJsonWithCurrent", function (data, callback) {
                self.mergeJsonWithCurrent(data, callback);
            });
        },


        //Merge an array of json objects with the json of the current sbgn network
        //on display to output a single json object.
        mergeJsonWithCurrent: function (jsonGraph, callback) {
            var currJson = sbgnviz.createJson();
            app.modelManager.setRollbackPoint(); //before merging.. for undo

            var jsonObj = jsonMerger.mergeJsonWithCurrent(jsonGraph, currJson);

            //get another sbgncontainer and display the new SBGN model.
            app.modelManager.newModel("me", true);

            //this takes a while so wait before initiating the model
            chise.updateGraph(jsonObj, function () {

                app.modelManager.initModel(cy.nodes(), cy.edges(), appUtilities, "me");

                //select the new graph
                jsonGraph.nodes.forEach(function (node) {
                    cy.getElementById(node.data.id).select();
                });

                $("#perform-layout").trigger('click');

                cy.elements().unselect();

                // Call merge notification after the layout
                setTimeout(function () {
                    app.modelManager.mergeJsons("me", true);
                    if (callback) callback("success");
                }, 1000);

            });
        }
    }
}

