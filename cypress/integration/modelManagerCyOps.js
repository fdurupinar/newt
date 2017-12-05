/***
 * Tests for non-cy-related modelManager methods
 */

const testData = require('../testData/globalTestData.js');


describe('modelManager Cytoscape Operations Test', function () {


    function addModelNode(id) {

        it('modelManager.addModelNode', function (done) {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;

                modelManager.addModelNode(id, {position: {x: 100, y: 200} , data: {id: id, class: "macromolecule"}});

                expect(window.appUtilities.getActiveCy().getElementById(id)).to.be.ok;

                expect(modelManager.getModelNodeAttribute("data.id", id)).to.equal(window.appUtilities.getActiveCy().getElementById(id).data("id"));
                expect(window.appUtilities.getActiveCy().getElementById(id).data("class")).to.equal("macromolecule");
                expect(window.appUtilities.getActiveCy().getElementById(id).data("class")).to.equal(modelManager.getModelNodeAttribute("data.class", id));

                expect(window.appUtilities.getActiveCy().getElementById(id).position("x")).to.equal(100);
                expect(window.appUtilities.getActiveCy().getElementById(id).position("x")).to.equal(modelManager.getModelNodeAttribute("position.x", id));

                expect(window.appUtilities.getActiveCy().getElementById(id).position("y")).to.equal(200);
                expect(window.appUtilities.getActiveCy().getElementById(id).position("y")).to.equal(modelManager.getModelNodeAttribute("position.y", id));

                done();
            });
        });
    }

    function getModelNode(id) {
        it('modelManager.getModelNode', function () {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                let modelNode = modelManager.getModelNode(id);
                expect(modelNode.id).to.equal(id);
            });

        });
    }

    function initModelNode(id){
        it('modelManager.initModelNode', function() {

            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;

                modelManager.initModelNode(window.appUtilities.getActiveCy().getElementById(id), null, true);

                var node = window.appUtilities.getActiveCy().getElementById(id);
                var modelNode = modelManager.getModelNode(id);


                for (var att in modelNode.data) {
                    expect(modelNode.data[att]).to.equal(node.data(att));
                }


                for (var att in node.data) {
                    expect(modelNode.data[att]).to.equal(node.data(att));
                }
            });
        });
    }


    function addModelEdge(id1, id2) {

        it('modelManager.addModelEdge', function (done) {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                var id = (id1 + "-"+ id2);

                modelManager.addModelEdge(id, {data: {id: id, source: id1, target: id2, class: "consumption"}});

                var modelEdge = modelManager.getModelEdge(id);
                var edge = window.appUtilities.getActiveCy().getElementById(id);

                expect(window.appUtilities.getActiveCy().getElementById(id)).to.be.ok;

                expect(modelManager.getModelEdgeAttribute("data.id", id)).to.equal(window.appUtilities.getActiveCy().getElementById(id).data("id"));
                expect(window.appUtilities.getActiveCy().getElementById(id).data("class")).to.equal("consumption");
                expect(window.appUtilities.getActiveCy().getElementById(id).data("class")).to.equal(modelManager.getModelEdgeAttribute("data.class", id));

                expect(window.appUtilities.getActiveCy().getElementById(id).data("source")).to.equal(id1);
                expect(window.appUtilities.getActiveCy().getElementById(id).data("source")).to.equal(modelManager.getModelEdgeAttribute("data.source", id));

                expect(window.appUtilities.getActiveCy().getElementById(id).data("target")).to.equal(id2);
                expect(window.appUtilities.getActiveCy().getElementById(id).data("target")).to.equal(modelManager.getModelEdgeAttribute("data.target", id));

                done();
            });
        });
    }


    function getModelEdge(id) {
        it('modelManager.getModelEdge', function () {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                let modelEdge = modelManager.getModelEdge(id);
                expect(modelEdge.id).to.equal(id);
            });

        });
    }

    function initModelEdge(id){
        it('modelManager.initModelEdge', function() {

            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;

                modelManager.initModelEdge(window.appUtilities.getActiveCy().getElementById(id), null, true); //no history

                var edge = window.appUtilities.getActiveCy().getElementById(id);
                var modelEdge = modelManager.getModelEdge(id);


                for (var att in modelEdge.data) {
                    expect(modelEdge.data[att]).to.equal(edge.data(att));
                }


                for (var att in edge.data) {
                    expect(modelEdge.data[att]).to.equal(edge.data(att));
                }
            });
        });
    }

    function selectModelNode(id) {
        it('modelManager.selectModelNode', function () {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                let userId = window.sessionUserId;
                var node = window.appUtilities.getActiveCy().getElementById(id);
                modelManager.selectModelNode(node, userId); //we need to specify userId for selection
                setTimeout(()=>{ //wait a little while to update the UI
                    expect(node.css('overlay-color')).to.equal(modelManager.getModelNodeAttribute("highlightColor", id));
                    // done();
                }, 100);

            });

        });
    }

    function unselectModelNode(id) {
        it('modelManager.unselectModelNode', function () {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                let userId = window.sessionUserId;
                var node = window.appUtilities.getActiveCy().getElementById(id);
                modelManager.unselectModelNode(node); //we need to specify userId for selection
                expect(modelManager.getModelNodeAttribute("highlightColor", id)).to.not.ok;
                setTimeout(()=>{ //wait a little while to update the UI
                    expect(node.css('overlay-color')).to.not.ok;
                }, 100);

            });

        });
    }

    function selectModelEdge(id) {
        it('modelManager.selectModelEdge', function () {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                let userId = window.sessionUserId;
                var edge = window.appUtilities.getActiveCy().getElementById(id);
                modelManager.selectModelEdge(edge, userId); //we need to specify userId for selection
                setTimeout(()=>{ //wait a little while to update the UI
                 expect(edge.css('overlay-color')).to.equal(modelManager.getModelEdgeAttribute("highlightColor", id));
                }, 100);

            });

        });
    }

    function unselectModelEdge(id) {
        it('modelManager.unselectModelEdge', function () {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                let userId = window.sessionUserId;
                var edge = window.appUtilities.getActiveCy().getElementById(id);
                modelManager.unselectModelEdge(edge); //we need to specify userId for selection
                expect(modelManager.getModelEdgeAttribute("highlightColor", id)).to.not.ok;
                setTimeout(()=>{ //wait a little while to update the UI
                    expect(edge.css('overlay-color')).to.not.ok;
                }, 100);

            });

        });
    }

    function changeModelNodeAttribute(id) {
        it('modelManager.changeModelNodeAttribute', function () {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                let userId = window.sessionUserId;


                let pos = {x:300, y:400};
                modelManager.changeModelNodeAttribute("position", id, pos);
                expect(window.appUtilities.getActiveCy().getElementById(id).position().x).to.equal(pos.x);
                expect(modelManager.getModelNode(id).position.x).equal(pos.x);
                expect(window.appUtilities.getActiveCy().getElementById(id).position().y).to.equal(pos.y);
                expect(modelManager.getModelNode(id).position.y).to.equal(pos.y);


                let nodeClass = "phenotype";
                modelManager.changeModelNodeAttribute("data.class", id, nodeClass);
                expect(window.appUtilities.getActiveCy().getElementById(id).data('class')).to.equal(nodeClass);
                expect(modelManager.getModelNode(id).data.class).to.equal(nodeClass);


                let label = "label2";
                modelManager.changeModelNodeAttribute("data.label", id, label);
                expect(window.appUtilities.getActiveCy().getElementById(id).data('label')).to.equal(label);
                expect(modelManager.getModelNode(id).data.label).to.equal(label);


                let opacity = 0.7;
                modelManager.changeModelNodeAttribute("data.background-opacity", id, opacity);
                expect(window.appUtilities.getActiveCy().getElementById(id).data('background-opacity')).to.equal( opacity);
                expect(modelManager.getModelNode(id).data["background-opacity"]).to.equal( opacity);


                let bgColor = '#333343';
                modelManager.changeModelNodeAttribute("data.background-color", id, bgColor );
                expect(window.appUtilities.getActiveCy().getElementById(id).data('background-color')).to.equal(bgColor);
                expect(modelManager.getModelNode(id).data["background-color"]).to.equal(bgColor);


                let borColor = '#222222';
                modelManager.changeModelNodeAttribute("data.border-color", id, borColor);
                expect(window.appUtilities.getActiveCy().getElementById(id).data('border-color')).to.equal(borColor);
                expect(modelManager.getModelNode(id).data["border-color"]).to.equal(borColor);

                let borWidth = "3px";
                modelManager.changeModelNodeAttribute("data.border-width", id, borWidth);
                expect(window.appUtilities.getActiveCy().getElementById(id).data('border-width')).to.equal(borWidth);
                expect(modelManager.getModelNode(id).data["border-width"]).to.equal(borWidth);


                let fontFamily = "Times";
                modelManager.changeModelNodeAttribute("data.font-family", id, fontFamily);
                expect(window.appUtilities.getActiveCy().getElementById(id).data('font-family')).to.equal(fontFamily);
                expect(modelManager.getModelNode(id).data["font-family"]).to.equal(fontFamily);


                let fontWeight = "bold";
                modelManager.changeModelNodeAttribute("data.font-weight", id, fontWeight);
                expect(window.appUtilities.getActiveCy().getElementById(id).data('font-weight')).to.equal(fontWeight);
                expect(modelManager.getModelNode(id).data["font-weight"]).to.equal(fontWeight);

                let fontSize = 10;
                modelManager.changeModelNodeAttribute("data.font-size", id, fontSize);
                expect(window.appUtilities.getActiveCy().getElementById(id).data('font-size')).to.equal(fontSize);
                expect(modelManager.getModelNode(id).data["font-size"]).to.equal(fontSize);


                let fontStyle = "normal";
                modelManager.changeModelNodeAttribute("data.font-style", id, fontStyle);
                expect(window.appUtilities.getActiveCy().getElementById(id).data('font-style')).to.equal(fontStyle);
                expect(modelManager.getModelNode(id).data["font-style"]).to.equal(fontStyle);


                let cloneMarker = true;
                modelManager.changeModelNodeAttribute("data.clonemarker", id, cloneMarker);
                expect(window.appUtilities.getActiveCy().getElementById(id).data('clonemarker')).to.equal(cloneMarker);
                expect(modelManager.getModelNode(id).data.clonemarker).to.equal(cloneMarker);


                var stateVarObj = {clazz: 'state variable', state: {value:'val', variable:'var'}, bbox:{w:40, h:20}};
                var unitOfInfoObj = {clazz: 'unit of information', label: {text:'label'}, bbox:{w:40, h:20}};


                modelManager.changeModelNodeAttribute("data.statesandinfos", id, [stateVarObj, unitOfInfoObj]);


                expect(window.appUtilities.getActiveCy().getElementById(id).data('statesandinfos')[0].clazz).to.deep.equal(stateVarObj.clazz);
                expect(window.appUtilities.getActiveCy().getElementById(id).data('statesandinfos')[1].clazz).to.deep.equal(unitOfInfoObj.clazz);
                expect(window.appUtilities.getActiveCy().getElementById(id).data('statesandinfos')).to.deep.equal(modelManager.getModelNode(id).data.statesandinfos);

                let parent = "node2";
                modelManager.changeModelNodeAttribute("data.parent", id, parent);
                expect(window.appUtilities.getActiveCy().getElementById(id).data('parent')).to.equal(parent);
                expect(modelManager.getModelNode(id).data.parent).to.equal(parent);

                let bh= 4;
                modelManager.changeModelNodeAttribute("data.bbox.h", id, bh);
                expect(window.appUtilities.getActiveCy().getElementById(id)._private.data.bbox.h).to.equal(bh);
                expect(modelManager.getModelNode(id).data.bbox.h).to.equal(bh);

                let bw = 5;
                modelManager.changeModelNodeAttribute("data.bbox.w", id, bw);
                expect(window.appUtilities.getActiveCy().getElementById(id)._private.data.bbox.w).to.equal(bw);
                expect(modelManager.getModelNode(id).data.bbox.w).to.equal(bw);

                //TODO:
                // modelManager.changeModelNodeAttribute("data.ports", id, ["glyph4"]);
                // assert.equal(modelManager.getModelNode(id).data.ports[0], window.appUtilities.getActiveCy().getElementById(id).data('ports')[0], "Node ports are correct in window.cytoscape.");
                // assert.equal(modelManager.getModelNode(id).data.ports[0], window.appUtilities.getActiveCy().getElementById(id).data('ports')[0], "Node ports are equal in model and window.cytoscape..");

            });

        });
    }

    function changeModelEdgeAttribute(id) {
        it('modelManager.changeModelEdgeAttribute', function () {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                let userId = window.sessionUserId;


                let edgeClass = "catalysis";
                modelManager.changeModelEdgeAttribute("data.class", id, edgeClass);
                expect(window.appUtilities.getActiveCy().getElementById(id).data('class')).to.equal(edgeClass);
                expect(modelManager.getModelEdge(id).data.class).to.equal(edgeClass);


                let cardinality = 5;
                modelManager.changeModelEdgeAttribute("data.cardinality", id, cardinality);
                expect(window.appUtilities.getActiveCy().getElementById(id).data('cardinality')).to.equal(cardinality);
                expect(modelManager.getModelEdge(id).data.cardinality).to.equal(cardinality);

                let lColor = '#411515';
                modelManager.changeModelEdgeAttribute("data.line-color", id, lColor );
                expect(window.appUtilities.getActiveCy().getElementById(id).data('line-color')).to.equal(lColor);
                expect(modelManager.getModelEdge(id).data["line-color"]).to.equal(lColor);


                let width = "8px";
                modelManager.changeModelEdgeAttribute("data.width", id, width);
                expect(window.appUtilities.getActiveCy().getElementById(id).data('width')).to.equal(width);
                expect(modelManager.getModelEdge(id).data["width"]).to.equal(width);

                //This  doesn't give error but
                //Edge's source and targets should not be updated like this
                //Chise does not allow this
                //This also causes problem when we try to delete elements

                // let newSource = "node3";
                // modelManager.changeModelEdgeAttribute("data.source", id, newSource);
                // setTimeout(()=>{ //wait a little while
                //     expect(window.appUtilities.getActiveCy().getElementById(id).data("source")).to.equal(newSource);
                //     expect(window.appUtilities.getActiveCy().getElementById(id).data("source")).to.equal(modelManager.getModelEdgeAttribute("data.source", id));
                // },100);
                //
                // let newTarget = "node4";
                // modelManager.changeModelEdgeAttribute("data.target", id, newTarget);
                // setTimeout(()=>{ //wait a little while
                //     expect(window.appUtilities.getActiveCy().getElementById(id).data("target")).to.equal(newTarget);
                //     expect(window.appUtilities.getActiveCy().getElementById(id).data("target")).to.equal(modelManager.getModelEdgeAttribute("data.source", id));
                // },100);
                //
                // let ps = "node1";
                // modelManager.changeModelEdgeAttribute("data.portsource", id, ps);
                // expect(window.appUtilities.getActiveCy().getElementById(id).data('portsource')).to.equal(ps);
                // expect(modelManager.getModelEdge(id).data["portsource"]).to.equal(ps);
                //
                //
                // let pt = "node1";
                // modelManager.changeModelEdgeAttribute("data.porttarget", id, pt);
                // expect(window.appUtilities.getActiveCy().getElementById(id).data('porttarget')).to.equal(pt);
                // expect(modelManager.getModelEdge(id).data["porttarget"]).to.equal(pt);


                //TODO
                // modelManager.changeModelEdgeAttribute("databendPointPositions", id, [{x: 300, y: 400}]);
                // assert.equal(300, cy.getElementById(id)._private.data.bendPointPositions[0].x,  "Edge bendPointPositions are correct in cytoscape.");
                // assert.equal(modelManager.getModelEdge(id).databendPointPositions[0].x,cy.getElementById(id)._private.data.bendPointPositions[0].x,  "Edge bendPointPositions are equal in model and cytoscape.");

            });

        });
    }

    function deleteModelNode(id) {
        it('modelManager.deleteModelNode', function () {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                modelManager.deleteModelNode(id);
                expect(modelManager.getModelNode(id)).to.not.ok;
                expect(window.appUtilities.getActiveCy().getElementById(id).length).to.equal(0);
            });

        });
    }

    function deleteModelEdge(id) {
        it('modelManager.deleteModelEdge', function () {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                modelManager.deleteModelEdge(id);
                expect(modelManager.getModelEdge(id)).to.not.ok;
                expect(window.appUtilities.getActiveCy().getElementById(id).length).to.equal(0);
            });

        });
    }

    function undoDeleteModelNode(id){
        it('modelManager.undoDeleteModeNode', function () {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                modelManager.undoCommand();
                expect(modelManager.getModelNode(id)).to.be.ok;
            });
        });
    }

    function redoDeleteModelNode(id){
        it('modelManager.redoDeleteModelNode', function () {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                modelManager.redoCommand();
                expect(modelManager.getModelNode(id)).to.not.ok;
            });
        });
    }

    function undoDeleteModelEdge(id){
        it('modelManager.undoDeleteModeEdge', function () {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                modelManager.undoCommand();
                expect(modelManager.getModelEdge(id)).to.be.ok;
            });
        });
    }

    function redoDeleteModelEdge(id){
        it('modelManager.redoDeleteModelEdge', function () {
            cy.window().should(function (window) {
                let modelManager = window.testApp.modelManager;
                modelManager.redoCommand();
                expect(modelManager.getModelEdge(id)).to.not.ok;
            });
        });
    }


    addModelNode("node1");
    initModelNode("node1");
    getModelNode("node1");

    addModelNode("node2");
    initModelNode("node2");

    addModelNode("node3");
    initModelNode("node3");

    addModelNode("node4");
    initModelNode("node4");


    addModelEdge("node1","node2");
    initModelEdge("node1-node2");

    selectModelNode("node1");
    unselectModelNode("node1");

    selectModelEdge("node1-node2");
    unselectModelEdge("node1-node2");

    changeModelNodeAttribute("node1");
    changeModelEdgeAttribute("node1-node2");

    deleteModelNode("node1");
    undoDeleteModelNode("node1");
    redoDeleteModelNode("node1");

    deleteModelEdge("node1-node2");
    undoDeleteModelEdge("node1-node2");
    redoDeleteModelEdge("node1-node2");

});
