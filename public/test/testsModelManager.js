QUnit = require('qunitjs');
module.exports = function(modelManager, userId){


    QUnit.module( "modelManager Tests" );

    function setNameTest(userId){
        QUnit.test('modelManager.setName()', function(assert) {
            modelManager.setName(userId, "abc");
            assert.equal(modelManager.getName(userId), "abc", "User name is correctly set.");
        });
    }


    //Node is not initialized here
    function addModelNodeTest(id){
        QUnit.test('modelManager.addModelNode()', function(assert) {
            // assert.notOk(cy.getElementById(id),"Node already existing");

            modelManager.addModelNode(id, {position: {x: 100, y: 200} , data: {id: id, class: "macromolecule"}});


            assert.ok(cy.getElementById(id),"Node added to cytoscape");
            assert.equal(modelManager.getModelNodeAttribute("data.id", id), cy.getElementById(id).data("id") , "Node is equal in model and cytoscape");

            assert.equal(cy.getElementById(id).data("class"), "macromolecule", "Node class is correct.");
            assert.equal(cy.getElementById(id).data("class"), modelManager.getModelNodeAttribute("data.class", id), "Node class is equal in model and cytoscape.");


            assert.equal(cy.getElementById(id).position("x"), 100, "Node position x is correct.");
            assert.equal(cy.getElementById(id).position("x"), modelManager.getModelNodeAttribute("position.x", id), "Node position x is equal in model and cytoscape.");

            assert.equal(cy.getElementById(id).position("y"), 200, "Node position y is correct.");
            assert.equal(cy.getElementById(id).position("y"),modelManager.getModelNodeAttribute("position.y", id), "Node position y is equal in model and cytoscape.");

        });
    }

    function getModelNodeTest(id){
        QUnit.test('modelManager.getModelNode()', function(assert) {
            let modelNode = modelManager.getModelNode(id);
            assert.equal(modelNode.id, id, "Can get model node from modelManager");
        });
    }

    function initModelNodeTest(id){
        QUnit.test('modelManager.initModelNode()', function(assert) {
            modelManager.initModelNode(cy.getElementById(id), null, true);

            var node = cy.getElementById(id);
            var modelNode = modelManager.getModelNode(id);

            for(var att in modelNode.data){
                assert.propEqual(modelNode.data[att], node.data(att), "Model node " + att + " correctly initialized.");
            }

            for(var att in node.data){
                assert.propEqual(node.data(att), modelNode.data[att], "Cy node " + att + " correctly initialized.");
            }
        });
    }

    function addModelEdgeTest(id1, id2){
        QUnit.test('modelManager.addModelEdge()', function(assert) {
            var id = (id1 + "-"+ id2);
            modelManager.addModelEdge(id, {data: {id: id, source: id1, target: id2, class: "consumption"}});

            var modelEdge = modelManager.getModelEdge(id);
            var edge = cy.getElementById(id);
            assert.ok(edge, "Edge added to cytoscape");

            console.log(id);
            console.log(modelEdge);
            console.log(edge);


            for(var att in modelEdge.data){
                assert.propEqual(modelEdge.data[att], edge.data(att), "Model edge " + att + " correctly added.");
            }

            for(var att in edge.data){
                assert.propEqual(edge.data(att), modelEdge.data[att], "Cy edge " + att + " correctly added.");
            }

        });
    }


    function getModelEdgeTest(id){
        QUnit.test('modelManager.getModelEdge()', function(assert) {
            let modelEdge = modelManager.getModelEdge(id);
            assert.equal(modelEdge.id, id, "Can get edge node from modelManager");
        });
    }

    function initModelEdgeTest(id) {
        QUnit.test('modelManager.initModelEdge()', function (assert) {
            modelManager.initModelEdge(cy.getElementById(id), null, true); //no history

            var edge = cy.getElementById(id);
            var modelEdge = modelManager.getModelEdge(id);

            for(var att in modelEdge.data){
                assert.propEqual(modelEdge.data[att], edge.data(att), "Model edge" + att + " correctly initialized.");
            }

            for(var att in edge.data) {
                assert.propEqual(edge.data(att), modelEdge.data[att], "Cy edge" + att + " correctly initialized.");
            }
        });
    }

    function selectModelNodeTest(id){
        QUnit.test('modelManager.selectModelNode()', function(assert){
            var node = cy.getElementById(id);
            modelManager.selectModelNode(node, userId); //we need to specify userId for selection
            assert.equal(node.css('overlay-color'), modelManager.getModelNodeAttribute("highlightColor", id), "Node correctly selected.");
        });
    }

    function unselectModelNodeTest(id){
        QUnit.test('modelManager.unselectModelNode()', function(assert){
            var node = cy.getElementById(id);
            modelManager.unselectModelNode(node);
            assert.equal(modelManager.getModelNodeAttribute("highlightColor", id), null, "Node correctly unselected.");
        });
    }

    function selectModelEdgeTest(id){
        QUnit.test('modelManager.selectModelEdge()', function(assert){
            var edge = cy.getElementById(id);
            modelManager.selectModelEdge(edge, userId);
            assert.equal(edge.css('overlay-color'), modelManager.getModelEdgeAttribute("highlightColor", id), "Edge correctly selected.");
        });
    }

    function unselectModelEdgeTest(id){
        QUnit.test('modelManager.unselectModelEdge()', function(assert){
            var edge = cy.getElementById(id);
            modelManager.unselectModelEdge(edge);
            // assert.equal(edge.css('overlay-color'), null, "Cytoscape lineColor correctly reverted.");
            assert.equal(modelManager.getModelEdgeAttribute("highlightColor", id), null, "Edge correctly unselected.");
        });
    }

    function changeModelNodeAttributeTest(id){
        QUnit.test('modelManager.changeModelNodeAttribute()', function(assert) {
            
            modelManager.changeModelNodeAttribute("position", id, {x: 300, y: 400});
            assert.equal(300, cy.getElementById(id).position().x,  "Node position x is correct in cytoscape.");
            assert.equal(modelManager.getModelNode(id).position.x,cy.getElementById(id).position().x,  "Node position x is equal in model and cytoscape.");


            assert.equal(400, cy.getElementById(id).position().y,  "Node position y is correct in cytoscape.");
            assert.equal(modelManager.getModelNode(id).position.y, cy.getElementById(id).position().y,  "Node position y is equal in model and cytoscape.");



            modelManager.changeModelNodeAttribute("data.class", id, "phenotype");
            assert.equal("phenotype", cy.getElementById(id).data('class'),  "Node class is correct in cytoscape.");
            assert.equal(modelManager.getModelNode(id).data.class, cy.getElementById(id).data('class'),  "Node class is equal in model and cytoscape.");

            modelManager.changeModelNodeAttribute("data.label", id, "label2");
            assert.equal("label2", cy.getElementById(id).data('label'),  "Node label is correct in cytoscape.");
            assert.equal(modelManager.getModelNode(id).data.label, cy.getElementById(id).data('label'),  "Node label is equal in model and cytoscape..");

            modelManager.changeModelNodeAttribute("data.background-opacity", id, 1);
            assert.equal(1, cy.getElementById(id).data('background-opacity'),  "Node backgroundOpacity is correct in cytoscape.");
            assert.equal(modelManager.getModelNode(id).data["background-opacity"], cy.getElementById(id).data('background-opacity'),  "Node backgroundOpacity is equal in model and cytoscape..");

            modelManager.changeModelNodeAttribute("data.background-color", id, '#333343');
            assert.equal('#333343', cy.getElementById(id).data('background-color'), "Node backgroundColor is correct in cytoscape.");
            assert.equal(modelManager.getModelNode(id).data["background-color"], cy.getElementById(id).data('background-color'), "Node backgroundColor is equal in model and cytoscape..");

            modelManager.changeModelNodeAttribute("data.border-color", id, '#222222');
            assert.equal('#222222', cy.getElementById(id).data('border-color'), "Node borderColor is correct in cytoscape.");
            assert.equal(modelManager.getModelNode(id).data["border-color"], cy.getElementById(id).data('border-color'), "Node borderColor is equal in model and cytoscape..");

            modelManager.changeModelNodeAttribute("data.border-width", id, "3px");
            assert.equal("3px", cy.getElementById(id).data('border-width'), "Node borderWidth is correct in cytoscape.");
            assert.equal(modelManager.getModelNode(id).data["border-width"], cy.getElementById(id).data('border-width'), "Node borderWidth is equal in model and cytoscape..");

            modelManager.changeModelNodeAttribute("data.clonemarker", id, true);
            assert.equal(true, cy.getElementById(id).data('clonemarker'), "Node isCloneMarker is correct in cytoscape.");
            assert.equal(modelManager.getModelNode(id).data.clonemarker, cy.getElementById(id).data('clonemarker'), "Node isCloneMarker is equal in model and cytoscape..");


            var stateVarObj = {clazz: 'state variable', state: {value:'val', variable:'var'}, bbox:{w:40, h:20}};
            var unitOfInfoObj = {clazz: 'unit of information', label: {text:'label'}, bbox:{w:40, h:20}};


            modelManager.changeModelNodeAttribute("data.statesandinfos", id, [stateVarObj, unitOfInfoObj]);
            assert.deepEqual("state variable", cy.getElementById(id).data('statesandinfos')[0].clazz, "Node statesvar is correct in cytoscape.");
            assert.deepEqual("unit of information", cy.getElementById(id).data('statesandinfos')[1].clazz, "Node unitofinformation is correct in cytoscape.");
            assert.deepEqual(modelManager.getModelNode(id).data.statesandinfos, cy.getElementById(id).data('statesandinfos'), "Node statesandinfos are equal in model and cytoscape..");


            modelManager.changeModelNodeAttribute("data.parent", id, "node2");
            assert.equal("node2", cy.getElementById(id).data('parent'), "Node parent is correct in cytoscape.");
            assert.equal(modelManager.getModelNode(id).data.parent, cy.getElementById(id).data('parent'), "Node parent is equal in model and cytoscape..");

            //TODO:
            // modelManager.changeModelNodeAttribute("data.ports", id, ["glyph4"]);
            // assert.equal(modelManager.getModelNode(id).data.ports[0], cy.getElementById(id).data('ports')[0], "Node ports are correct in cytoscape.");
            // assert.equal(modelManager.getModelNode(id).data.ports[0], cy.getElementById(id).data('ports')[0], "Node ports are equal in model and cytoscape..");


            modelManager.changeModelNodeAttribute("data.bbox.h", id, 4);
            assert.equal(4, cy.getElementById(id)._private.data.bbox.h, "Node height is correct in cytoscape.");
            assert.equal(modelManager.getModelNode(id).data.bbox.h, cy.getElementById(id)._private.data.bbox.h, "Node height is equal in model and cytoscape..");


            modelManager.changeModelNodeAttribute("data.bbox.w", id, 5);
            assert.equal(5, cy.getElementById(id)._private.data.bbox.w, "Node width is correct in cytoscape.");
            assert.equal(modelManager.getModelNode(id).data.bbox.w, cy.getElementById(id)._private.data.bbox.w, "Node width is equal in model and cytoscape..");


        });
    }



    function changeModelEdgeAttributeTest(id) {
        QUnit.test('modelManager.changeModelEdgeAttribute()', function (assert) {
            modelManager.changeModelEdgeAttribute("data.class", id, "catalysis");
            assert.equal("catalysis", cy.getElementById(id).data('class'), "Edge class is correct in cytoscape.");
            assert.equal(modelManager.getModelEdge(id).data.class, cy.getElementById(id).data('class'), "Edge class is equal in model and cytoscape.");

            //TODO Cannot change this directly
            // modelManager.changeModelEdgeAttribute("data.source", id, "glyph8");
            // assert.equal("glyph8", cy.getElementById(id).data("source"),  "Edge source is correct in cytoscape.");
            // assert.equal(modelManager.getModelEdge(id).data.source, cy.getElementById(id).data("source"),  "Edge source is equal in model and cytoscape.");
            //
            // modelManager.changeModelEdgeAttribute("data.target", id, "glyph16");
            // assert.equal("glyph16", cy.getElementById(id)._private.data.target,  "Edge target is correct in cytoscape.");
            // assert.equal(modelManager.getModelEdge(id).data.target, cy.getElementById(id)._private.data.target,  "Edge target is equal in model and cytoscape.");
            //
            // modelManager.changeModelEdgeAttribute("data.source", id, "glyph9");
            // assert.equal("glyph9", cy.getElementById(id).data("source"),  "Edge source is correct in cytoscape.");
            // assert.equal(modelManager.getModelEdge(id).data.source, cy.getElementById(id).data("source"),  "Edge source is equal in model and cytoscape.");
            //
            // modelManager.changeModelEdgeAttribute("data.target", id, "glyph15");
            // assert.equal("glyph15", cy.getElementById(id)._private.data.target,  "Edge target is correct in cytoscape.");
            // assert.equal(modelManager.getModelEdge(id).data.target, cy.getElementById(id)._private.data.target,  "Edge target is equal in model and cytoscape.");


            modelManager.changeModelEdgeAttribute("data.cardinality", id, 5);
            assert.equal(5, cy.getElementById(id)._private.data.cardinality, "Edge cardinality is correct in cytoscape.");
            assert.equal(modelManager.getModelEdge(id).data.cardinality, cy.getElementById(id)._private.data.cardinality, "Edge cardinality is equal in model and cytoscape.");

            modelManager.changeModelEdgeAttribute("data.portsource", id, "glyph8");
            assert.equal("glyph8", cy.getElementById(id).data('portsource'), "Edge portsource is correct in cytoscape.");
            assert.equal(modelManager.getModelEdge(id).data.portsource, cy.getElementById(id).data('portsource'), "Edge portsource is equal in model and cytoscape.");

            modelManager.changeModelEdgeAttribute("data.porttarget", id, "glyph16");
            assert.equal("glyph16", cy.getElementById(id).data('porttarget'), "Edge porttarget is correct in cytoscape.");
            assert.equal(modelManager.getModelEdge(id).data.porttarget, cy.getElementById(id).data('porttarget'), "Edge porttarget is equal in model and cytoscape.");


            modelManager.changeModelEdgeAttribute("data.line-color", id, "#411515");
            assert.equal("#411515", cy.getElementById(id).data("line-color"), "Edge lineColor is correct in cytoscape.");
            assert.equal(modelManager.getModelEdge(id).data["line-color"], cy.getElementById(id).data("line-color"), "Edge lineColor is equal in model and cytoscape.");

            modelManager.changeModelEdgeAttribute("data.width", id, "8px");
            assert.equal("8px", cy.getElementById(id).data("width"), "Edge width is correct in cytoscape.");
            assert.equal(modelManager.getModelEdge(id).data.width, cy.getElementById(id).data("width"), "Edge width is equal in model and cytoscape.");

            //
            // modelManager.changeModelEdgeAttribute("databendPointPositions", id, [{x: 300, y: 400}]);
            // assert.equal(300, cy.getElementById(id)._private.data.bendPointPositions[0].x,  "Edge bendPointPositions are correct in cytoscape.");
            // assert.equal(modelManager.getModelEdge(id).databendPointPositions[0].x,cy.getElementById(id)._private.data.bendPointPositions[0].x,  "Edge bendPointPositions are equal in model and cytoscape.");

            });
        }

    function deleteModelNodeTest(id){
        QUnit.test('modelManager.deleteModelNode()', function(assert){
            modelManager.deleteModelNode(id);
            assert.equal(modelManager.getModelNode(id), null, "Node removed from model.");
            assert.equal(cy.getElementById(id).length, 0, "Node removed from cytoscape.");

        });
    }

    function deleteModelEdgeTest(id){
        QUnit.test('modelManager.deleteModelEdge()', function(assert){
            modelManager.deleteModelEdge(id);
            assert.equal(modelManager.getModelEdge(id), null, "Edge removed from model.");
            assert.equal(cy.getElementById(id).length, 0, "Edge removed from cytoscape.");

        });
    }


    function undoDeleteNodeTest(id){
        QUnit.test('modelManager.undoCommandTest()', function(assert){
            modelManager.undoCommand();
            assert.ok(modelManager.getModelNode(id), "Undo delete node successful.");
        });
    }

    function redoDeleteNodeTest(id){
        QUnit.test('modelManager.redoCommandTest()', function(assert){
            modelManager.redoCommand();
            assert.notOk(modelManager.getModelNode(id), "Redo delete node successful.");
        });
    }


    function undoAddNodeTest(id){
        QUnit.test('modelManager.undoCommandTest()', function(assert){
            modelManager.undoCommand();
            assert.notOk(modelManager.getModelNode(id), "Undo add node successful.");
        });
    }

    function redoAddNodeTest(id){
        QUnit.test('modelManager.redoCommandTest()', function(assert){
            modelManager.redoCommand();
            assert.ok(modelManager.getModelNode(id), "Redo add node successful.");
        });
    }


    function undoDeleteEdgeTest(id){
        QUnit.test('modelManager.undoCommandTest()', function(assert){
            modelManager.undoCommand();
            assert.ok(modelManager.getModelEdge(id), "Undo delete edge successful.");
        });
    }

    function redoDeleteEdgeTest(id){
        QUnit.test('modelManager.redoCommandTest()', function(assert){
            modelManager.redoCommand();
            assert.notOk(modelManager.getModelEdge(id), "Redo delete edge successful.");
        });
    }

    function undoAddEdgeTest(id){
        QUnit.test('modelManager.undoCommandTest()', function(assert){
            modelManager.undoCommand();
            assert.notOk(modelManager.getModelEdge(id), "Undo add edge successful.");
        });
    }


    function redoAddEdgeTest(id){
        QUnit.test('modelManager.redoCommandTest()', function(assert){
            modelManager.redoCommand();
            assert.ok(modelManager.getModelEdge(id), "Redo add edge successful.");
        });
    }

    setNameTest(userId);
    
    var node1Id = "node1";
    var node2Id = "node2";
    var edgeId = node1Id + "-" + node2Id;

    setTimeout(addModelNodeTest, 100, node1Id);
    setTimeout(initModelNodeTest, 100, node1Id);
    setTimeout(getModelNodeTest, 100, node1Id);

    setTimeout(addModelNodeTest, 100, node2Id);
    setTimeout(initModelNodeTest, 200, node2Id);

    setTimeout(undoAddNodeTest, 200, node2Id);
    setTimeout(redoAddNodeTest, 300, node2Id);

    setTimeout(selectModelNodeTest, 500, node2Id);
    setTimeout(unselectModelNodeTest, 1000, node2Id);



    setTimeout(addModelEdgeTest, 1000, node1Id, node2Id);
    setTimeout(initModelEdgeTest, 1000, edgeId);

    setTimeout(undoAddEdgeTest, 1500, edgeId);
    setTimeout(redoAddEdgeTest, 2000, edgeId);


    setTimeout(getModelEdgeTest, 2000, edgeId);

    setTimeout(selectModelEdgeTest, 2000, edgeId);
    setTimeout(unselectModelEdgeTest, 2000, edgeId);


    setTimeout(changeModelNodeAttributeTest, 2000, node1Id);
    setTimeout(changeModelEdgeAttributeTest, 2000, edgeId);

    setTimeout(deleteModelEdgeTest, 2500, edgeId);

    setTimeout(undoDeleteEdgeTest, 3000, edgeId);
    setTimeout(redoDeleteEdgeTest, 3500, edgeId);


    setTimeout(deleteModelNodeTest, 4000, node1Id);

    setTimeout(undoDeleteNodeTest, 4500, node1Id);
    setTimeout(redoDeleteNodeTest, 5000, node1Id);



};