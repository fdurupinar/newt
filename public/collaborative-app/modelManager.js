/*
 *	Shared model handling operations.
 *  Clients call these commands to update the model
 *  Each room (docId) has one modelManager associated with it
 *	Author: Funda Durupinar Babur<f.durupinar@gmail.com>
 */



class ModelManager{

    constructor(model, docId){
        this.model = model;
        this.docId = docId;
    }

    getModel() {
        return this.model;
    }

    getPageDoc(){
        return this.model.get('documents.' + this.docId);
    }

    addImage(data, user, noHistUpdate) {
        let self = this;
        let images = this.model.get('documents.' + this.docId + '.images');
        if(images) {
            for (let i = 0; i < images.length; i++){
                if(images[i].tabIndex === data.tabIndex) { //overwrite
                    images[i] = data;
                    if (!noHistUpdate)
                        this.updateHistory({opName: 'overwrite', opTarget: 'image', opAttr: data.fileName});

                    //overwrite images
                    self.model.set('documents.' + self.docId + '.images', images);
                    return;
                }
            }
        }

        //if no such tab exists, insert a new tab
        this.model.pass({user: user}).push('documents.' + this.docId + '.images', data);

        if (!noHistUpdate)
            this.updateHistory({opName: 'add', opTarget: 'image', opAttr: data.fileName});
    }

    getImages(){
        return this.model.get('documents.' + this.docId + '.images');
    }

    setName (userId, userName) {
        this.model.set('documents.' + this.docId + '.users.' + userId +'.name', userName);
    }

    getName (userId) {
        return this.model.get('documents.' + this.docId + '.users.' + userId + '.name');
    }

    /***
     *
     * @param id of the user we want to change color of
     * @param color
     */
    setColorCode(id, color){
        this.model.set('documents.' + this.docId + '.users.' + id +'.colorCode', color);
    }

    changeColorCode(id){
        this.model.set('documents.' + this.docId + '.users.' + id +'.colorCode', getNewColor());
    }

    getMessages(){
        return this.model.get('documents.' + this.docId + '.messages');
    }

    /***
     * User information for current and previous users
     * No need to be active users
     * @param userId
     */
    getUserId(userId){
        return this.model.get('documents.' + this.docId + '.users.' + userId);
    }


    /***
     * Active users on the document
     */
    getUserIds(){
        return this.model.get('documents.' + this.docId + '.userIds');
    }

    /***
     * Add an active userId to the document and update 'users' info
     * @param userId
     * @param userName
     * @param colorCode
     */
    addUser(userId, userName, colorCode){
        let userIds = this.model.get('documents.' + this.docId + '.userIds');
        if(!userIds || userIds.indexOf(userId) < 0) //user not in the list
            this.model.at('documents.' + this.docId + '.userIds').push(userId);


        let users = this.model.at('documents.' + this.docId + '.users');

        if(!users.get(userId)){
            if(!userName) {
                let userCnt = this.getUserIds().length;
                userName = "User" + userCnt;
            }
            if(!colorCode)
                colorCode = getNewColor();

            this.setName(userId, userName);
            this.setColorCode(userId, colorCode);
        }
    }

    deleteAllUsers(){
        let self = this;
        let userIds = this.model.get('documents.' + this.docId + '.userIds');
        for(let i = userIds.length - 1; i>=0; i--){
            self.deleteUserId(userIds[i]);
        }
    }

    deleteUserId(userId){
        let self = this;

        let userIds = this.model.get('documents.' + this.docId + '.userIds');
        for(let i = 0; i < userIds.length; i++){
            if(userIds[i] == userId ){
                self.model.remove('documents.' + self.docId + '.userIds', i) ; //remove from the index
                break;
            }
        }
    }


    /***
     *
     * @param cmd  {opName, opTarget,  elType, elId, opAttr,param, prevParam}
     * opName: set, load, open, add, select, unselect
     * opTarget: element, element group,  model, sample,
         * elType: node, edge
         * opAttr: highlightColor, lineColor, borderColor etc.
         */

    updateHistory (cmd) {
        let command = {
            date: new Date,
            opName: cmd.opName,
            opTarget: cmd.opTarget,
            elType: cmd.elType,
            opAttr: cmd.opAttr,
            elId: cmd.elId,
            param: cmd.param,
            prevParam: cmd.prevParam
        };

        if (cmd != null) {
            let ind = this.model.push('documents.' + this.docId + '.history', command) - 1;
            this.model.set('documents.' + this.docId + '.undoIndex', ind);
        }
    }

    getLastCommandName(){
        let undoIndex = this.model.get('documents.' + this.docId + '.undoIndex');
        let cmd = this.model.get('documents.' + this.docId + '.history.' + undoIndex);

        return cmd.opName;
    }


    printHistory(){
        console.log("HISTORY:");
        let hist = this.model.get('documents.' + this.docId + '.history');
        for(let i = 0 ; i <hist.length;i++)
            console.log(i + " " + hist[i].opName);
    }


    isUndoPossible() {
        return (this.model.get('documents.' + this.docId + '.undoIndex') > 0)
    }

    isRedoPossible() {
        return (this.model.get('documents.' + this.docId + '.undoIndex') + 1 < this.model.get('documents.' + this.docId + '.history').length)
    }

    undoCommand() {
        let undoInd = this.model.get('documents.' + this.docId + '.undoIndex');
        let cmd = this.model.get('documents.' + this.docId + '.history.' + undoInd); // cmd: opName, opTarget, opAttr, elId, param


        if (cmd.opName == "set") {
            if (cmd.opTarget == "element" && cmd.elType == "node")
                this.changeModelNodeAttribute(cmd.opAttr, cmd.elId, cmd.prevParam, null); //user is null to enable updating in the editor

            else if (cmd.opTarget == "element" && cmd.elType == "edge")
                this.changeModelEdgeAttribute(cmd.opAttr, cmd.elId, cmd.prevParam, null);
            else if (cmd.opTarget == "element group")
                this.changeModelElementGroupAttribute(cmd.opAttr, cmd.elId, cmd.prevParam, null);

        }
        else if (cmd.opName == "add" || cmd.opName ==="restore") {
            if (cmd.opTarget == "element" && cmd.elType == "node")
                this.deleteModelNode(cmd.elId);
            else if (cmd.opTarget == "element" && cmd.elType == "edge")
                this.deleteModelEdge(cmd.elId);
            else if (cmd.opTarget == "compound")
                this.removeModelCompound(cmd.elId, cmd.param.childrenList, cmd.prevParam);
        }
        else if (cmd.opName == "delete") {
            if (cmd.opTarget == "element")
                this.restoreModelElement(cmd.elType, cmd.elId, cmd.prevParam);
            else if (cmd.opTarget == "element group"){

                this.restoreModelElementGroup(cmd.elId, cmd.prevParam);
            }
            else if (cmd.opTarget == "compound")
                this.addModelCompound(cmd.elId, cmd.prevParam.compoundAtts, cmd.prevParam.childrenList, cmd.prevParam.paramList);

        }
        else if(cmd.opName === "update"){ //properties
            if(cmd.opTarget.indexOf('general') >= 0)
                this.updateGeneralProperties(cmd.prevParam);
            else if(cmd.opTarget.indexOf('layout') >= 0)
                this.updateLayoutProperties(cmd.prevParam);
            else if(cmd.opTarget.indexOf('grid') >= 0)
                this.updateGridProperties(cmd.prevParam);

        }
        else if (cmd.opName == "init") {
            this.newModel("me", true);
        }
        else if (cmd.opName == "new") { //delete all
            this.restoreModel(cmd.prevParam);

        }
        else if (cmd.opName == "merge") {
            this.newModel("me", true);
            this.restoreModel(cmd.prevParam);
        }

        undoInd = undoInd > 0 ? undoInd - 1 : 0;
        this.model.set('documents.' + this.docId + '.undoIndex', undoInd);

    }

    redoCommand () {
        let undoInd = this.model.get('documents.' + this.docId + '.undoIndex');
        let cmd = this.model.get('documents.' + this.docId + '.history.' + (undoInd + 1)); // cmd: opName, opTarget, opAttr, elId, param

        if (cmd.opName == "set") {
            if (cmd.opTarget == "element" && cmd.elType == "node")
                this.changeModelNodeAttribute(cmd.opAttr, cmd.elId, cmd.param, null); //user is null to enable updating in the editor
            else if (cmd.opTarget == "element" && cmd.elType == "edge")
                this.changeModelEdgeAttribute(cmd.opAttr, cmd.elId, cmd.param, null);
            else if (cmd.opTarget == "element group") {
                this.changeModelElementGroupAttribute(cmd.opAttr, cmd.elId, cmd.param);

            }

        }
        else if (cmd.opName == "add" ||cmd.opName == "restore") {
            if (cmd.opTarget == "element")
                this.restoreModelElement(cmd.elType, cmd.elId, cmd.param);
            else if (cmd.opTarget == "compound")
                this.addModelCompound(cmd.elId, cmd.param.compoundAtts, cmd.param.childrenList, cmd.param.paramList);


        }
        else if (cmd.opName == "delete") {
            if (cmd.opTarget == "element" && cmd.elType == "node")
                this.deleteModelNode(cmd.elId);
            else if (cmd.opTarget == "element" && cmd.elType == "edge")
                this.deleteModelEdge(cmd.elId);
            else if (cmd.opTarget == "element group")
                this.deleteModelElementGroup(cmd.elId);
            else if (cmd.opTarget == "compound")
                this.removeModelCompound(cmd.elId, cmd.param.childrenList, cmd.param);

        }
        else if(cmd.opName === "update"){ //properties
            if(cmd.opTarget.indexOf('general') >= 0)
                this.updateGeneralProperties(cmd.param);
            else if(cmd.opTarget.indexOf('layout') >= 0)
                this.updateLayoutProperties(cmd.param);
            else if(cmd.opTarget.indexOf('grid') >= 0)
                this.updateGridProperties(cmd.param);

        }
        else if (cmd.opName == "init") {
            this.restoreModel(cmd.param);
        }
        else if (cmd.opName == "new") { //delete all
            this.newModel();
        }
        else if (cmd.opName == "merge") { //delete all
            this.restoreModel(cmd.param);
        }

        undoInd = undoInd < this.model.get('documents.' + this.docId + '.history').length - 1 ? undoInd + 1 : this.model.get('documents.' + this.docId + '.history').length - 1;
        this.model.set('documents.' + this.docId + '.undoIndex', undoInd);
    }

    getModelNode (id) {
        let nodePath = this.model.at('documents.' + this.docId + '.cy.nodes.' + id);
        return nodePath.get();
    }

    getModelNodesArr(){
        let nodes = this.model.get('documents.' + this.docId + '.cy.nodes');
        let nodeArr = [];
        for(var att in nodes){
            if(nodes.hasOwnProperty(att))
                nodeArr.push(nodes[att]);
        }

        return nodeArr;
    }

    getModelEdgesArr(){
        let edges = this.model.get('documents.' + this.docId + '.cy.edges');
        let edgeArr = [];
        for(var att in edges){
            if(edges.hasOwnProperty(att))
                edgeArr.push(edges[att]);
        }

        return edgeArr;
    }
    getModelEdge (id) {
        let edgePath = this.model.at('documents.' + this.docId + '.cy.edges.' + id);
        return edgePath.get();
    }

    selectModelNode (node, userId, user,  noHistUpdate) {

        let nodePath = this.model.at('documents.' + this.docId + '.cy.nodes.' + node.id());
        if (nodePath.get() == null)
            return "Node id not found";


        let userPath = this.model.at('documents.' + this.docId + '.users.' + userId);



        this.model.pass({user: user}).set('documents.' + this.docId + '.cy.nodes.' + node.id()+ '.highlightColor', userPath.get('colorCode'));


        return "success";

    }


    selectModelEdge (edge, userId, user,  noHistUpdate) {

        let edgePath = this.model.at('documents.' + this.docId + '.cy.edges.' + edge.id());
        if (edgePath.get() == null)
            return "Edge id not found";
        let userPath = this.model.at('documents.' + this.docId + '.users.' + userId);
        this.model.pass({user: user}).set('documents.' + this.docId + '.cy.edges.' + edge.id()+ '.highlightColor', userPath.get('colorCode'));




        return "success";

    }
    unselectModelNode (node,  user, noHistUpdate) {

        let nodePath = this.model.at('documents.' + this.docId + '.cy.nodes.' + node.id());

        if (nodePath.get() == null)
            return "Node id not found";

        this.model.pass({user: user}).set('documents.' + this.docId + '.cy.nodes.' + node.id() + '.highlightColor', null);

        return "success";

    }


    unselectModelEdge (edge,  user, noHistUpdate) {

        let edgePath = this.model.at('documents.' + this.docId + '.cy.edges.' + edge.id());
        if (edgePath.get() == null)
            return "Edge id not found";

        this.model.pass({user: user}).set('documents.' + this.docId + '.cy.edges.' + edge.id() + '.highlightColor', null);

        return "success";


    }

    /***
     *
     * @param nodeId
     * @param param {position:, data:}
     * @param user
     * @param noHistUpdate
     * @returns {*}
     */

    addModelNode (nodeId, param, user, noHistUpdate) {


        if (this.model.get("documents.' + this.docId + '.cy.nodes." + nodeId + '.id') != null)
            return "Node cannot be duplicated";

        this.model.pass({user: user}).set('documents.' + this.docId + '.cy.nodes.' + nodeId + '.data.id', nodeId);
        this.model.pass({user: user}).set('documents.' + this.docId + '.cy.nodes.' + nodeId + '.position', param.position);
        this.model.pass({user: user}).set('documents.' + this.docId + '.cy.nodes.' + nodeId + '.data', param.data);

        //adding the node in cytoscape
        this.model.pass({user: user}).set('documents.' + this.docId + '.cy.nodes.' + nodeId + '.addedLater', true);



        if (!noHistUpdate)
        //We don't want all the attributes of the param to be printed
            this.updateHistory({
                opName: 'add',
                opTarget: 'element',
                elType: 'node',
                elId: nodeId,
                param: param

            });


        return "success";

    }

    /***
     *
     * @param edgeId
     * @param param: {data:}
     * @param user
     * @param noHistUpdate
     * @returns {*}
     */
    addModelEdge (edgeId, param, user, noHistUpdate) {

        if (this.model.get("documents.' + this.docId + '.cy.edges." + edgeId + '.id') != null)
            return "Edge cannot be duplicated";

        this.model.pass({user: user}).set('documents.' + this.docId + '.cy.edges.' + edgeId + '.data.id', edgeId);
        this.model.pass({user: user}).set('documents.' + this.docId + '.cy.edges.' + edgeId + '.data', param.data);


        //adding the edge...other operations should be called after this
        this.model.pass({user: user}).set('documents.' + this.docId + '.cy.edges.' + edgeId + '.addedLater', true);


        if (!noHistUpdate)
            this.updateHistory({
                opName: 'add',
                opTarget: 'element',
                elType: 'edge',
                elId: edgeId,
                param: param

            });

        return "success";

    }

    /***
     *
     * @param compoundId : new compound's id
     * @param compoundAtts: new compounds id, size, sbgnclass, position
     * @param childrenList: in the format {id:, isNode} for do/undo
     * @param prevParentList: children's old parents
     * @param user
     * @param noHistUpdate
     */
    addModelCompound (compoundId, compoundAtts, elList, paramList, user, noHistUpdate) {


        let prevParentList = [];
        paramList.forEach(function(param){
            prevParentList.push(paramList.parent);
        });
        this.addModelNode(compoundId, compoundAtts, user, true);


        this.changeModelElementGroupAttribute("data", elList, paramList, user, true);



        if (!noHistUpdate)
            this.updateHistory({
                opName: 'add',
                opTarget: 'compound',
                elId: compoundId,
                param: {paramList: paramList, childrenList: elList, compoundAtts: compoundAtts},
                prevParam:  prevParentList //TODO
            });

    }

    //change children's parents to their old parents
    removeModelCompound (compoundId, childrenList, prevParentList, user, noHistUpdate) {
        let self = this;

        let nodePath = this.model.at('documents.' + this.docId + '.cy.nodes.' + compoundId);

        let compoundAtts = {
            id: compoundId,
            class: nodePath.get('data.class'),
            x: nodePath.get('position.x'),
            y: nodePath.get('position.y')

        };

        let paramList = [];
        childrenList.forEach(function(child){
            let data = self.model.get('documents.' + self.docId + '.cy.nodes.'+child.id + '.data');
            paramList.push(data);
        });

        //isolate the compound first, then delete
        this.changeModelElementGroupAttribute("data.parent", childrenList, prevParentList, user, true);
        this.deleteModelNode(compoundId, user, true);




        if (!noHistUpdate)
            this.updateHistory({
                opName: 'delete',
                opTarget: 'compound',
                elId: compoundId,
                prevParam: {childrenList: childrenList, compoundAtts: compoundAtts, paramList: paramList},
                param: prevParentList
            });

    }



    //attStr: attribute namein the model
    //historyData is for  sbgnStatesAndInfos only
    changeModelElementGroupAttribute (attStr, elList, paramList, user, noHistUpdate) { //historyData){
        let self = this;
        let prevParamList = [];

        if (!noHistUpdate) {

            elList.forEach(function (el) {

                let prevAttVal;
                if (el.isNode)
                    prevAttVal = self.model.get('documents.' + self.docId + '.cy.nodes.' + el.id + '.' + attStr);
                else
                    prevAttVal = self.model.get('documents.' + self.docId + '.cy.edges.' + el.id + '.' + attStr);


                prevParamList.push(prevAttVal);
            });


            this.updateHistory({
                opName: 'set',
                opTarget: 'element group',
                elId: elList,
                opAttr: attStr,
                param: paramList,
                prevParam: prevParamList
            });

        }

        let ind = 0;
        elList.forEach(function (el) {
            let currAttVal = paramList[ind++];

            if (el.isNode)
                self.changeModelNodeAttribute(attStr, el.id, currAttVal, user, true); //don't update individual histories
            else
                self.changeModelEdgeAttribute(attStr, el.id, currAttVal, user, true);

        });

        return "success";

    }

    getModelNodeAttribute(attStr, nodeId){
        let nodePath = this.model.at('documents.' + this.docId + '.cy.nodes.' + nodeId);

        return nodePath.get(attStr);
    }

    getModelEdgeAttribute(attStr, edgeId){
        let edgePath = this.model.at('documents.' + this.docId + '.cy.edges.' + edgeId);

        return edgePath.get(attStr);
    }
    //attStr: attribute namein the model
    //historyData is for  sbgnStatesAndInfos only
    changeModelNodeAttribute (attStr, nodeId, attVal, user, noHistUpdate) { //historyData){

        let status = "Node id not found";
        let nodePath = this.model.at('documents.' + this.docId + '.cy.nodes.' + nodeId);


        let prevAttVal = nodePath.get(attStr);


        if(attStr === "width") //as we read this directly from cy.data
            attStr = "borderWidth";


        nodePath.pass({user: user}).set(attStr, attVal);

        // let st = nodePath.get('data.statesandinfos');
        //
        // if(st)
        // console.log(st);
        //
        if (attStr == "expandCollapseStatus") {
            if (attVal == "expand")
                prevAttVal = "collapse";
            else //if null or collapse
                prevAttVal = "expand";
        }



        if (attStr != 'interactionCount') {
            this.model.increment('documents.' + this.docId + '.cy.nodes.' + nodeId + '.interactionCount', 1);

            if (!noHistUpdate) {

                this.updateHistory({
                    opName: 'set',
                    opTarget: 'element',
                    elType: 'node',
                    elId: nodeId,
                    opAttr: attStr,
                    param: attVal,
                    prevParam: prevAttVal
                });
            }
        }
        status = "success";


        return status;

    }


    changeModelEdgeAttribute (attStr, edgeId, attVal, user, noHistUpdate) {
        let status = "Edge id not found";
        let edgePath = this.model.at('documents.' + this.docId + '.cy.edges.' + edgeId);
        let prevAttVal = edgePath.get(attStr);
        edgePath.pass({user: user}).set(attStr, attVal);


        let sourceId = edgePath.get('source');
        let targetId = edgePath.get('target');
        if (sourceId)
            this.model.increment('documents.' + this.docId + '.cy.nodes.' + sourceId + '.interactionCount', 1);
        if (targetId)
            this.model.increment('documents.' + this.docId + '.cy.nodes.' + targetId + '.interactionCount', 1);


        if (!noHistUpdate) {

            this.updateHistory({
                opName: 'set',
                opTarget: 'element',
                elType: 'edge',
                elId: edgeId,
                opAttr: attStr,
                param: attVal,
                prevParam: prevAttVal
            });

        }

        status = "success";


        return status;
    }

    //willUpdateHistory: Depending on the parent command, history will be updated or not
    deleteModelNode (nodeId, user, noHistUpdate) {
        let nodePath = this.model.at('documents.' + this.docId + '.cy.nodes.' + nodeId);


        if (nodePath.get() == null)
            return "Node id not found";

        if (!noHistUpdate) {


            let prevParam = nodePath.get();


            this.updateHistory({
                opName: 'delete',
                opTarget: 'element',
                elType: 'node',
                elId: nodeId,
                prevParam: prevParam

            });

        }

        this.model.pass({user: user}).del(('documents.' + this.docId + '.cy.nodes.' + nodeId));


        return "success";

    }


    deleteModelEdge (edgeId, user, noHistUpdate) {

        let edgePath = this.model.at('documents.' + this.docId + '.cy.edges.' + edgeId);
        if (edgePath.get() == null)
            return "Edge id not found";


        if (!noHistUpdate) {

            let prevParam = edgePath.get();

            this.updateHistory({
                opName: 'delete',
                opTarget: 'element',
                elType: 'edge',
                elId: edgeId,
                prevParam: prevParam
            });

        }

        this.model.pass({user: user}).del(('documents.' + this.docId + '.cy.edges.' + edgeId));

        return "success";

    }


    deleteModelElementGroup (selectedEles, user, noHistUpdate) {
        let prevParamsNodes = [];
        let prevParamsEdges = [];
        let self = this;


        if(selectedEles.edges!= null){
            selectedEles.edges.forEach(function (edge) {
                let edgePath = self.model.at('documents.' + self.docId + '.cy.edges.' + edge.id);
                prevParamsEdges.push(edgePath.get());
            });


            selectedEles.edges.forEach(function (edge) {
                self.deleteModelEdge(edge.id, user, true); //will not update children history
            });
        }

        if(selectedEles.nodes!= null) {
            selectedEles.nodes.forEach(function (node) {
                let nodePath = self.model.at('documents.' + self.docId + '.cy.nodes.' + node.id);

                prevParamsNodes.push(nodePath.get());
            });


            selectedEles.nodes.forEach(function (node) {
                self.deleteModelNode(node.id, user, true); //will not update children history
            });
        }
        if (!noHistUpdate)
            this.updateHistory({
                opName: 'delete',
                opTarget: 'element group',
                elId: selectedEles,
                prevParam: {nodes: prevParamsNodes, edges: prevParamsEdges}
            });


    }

    restoreModelElementGroup (elList, param, user, noHistUpdate) {
        let self = this;
        //Restore nodes first


        for (let i = 0; i < elList.nodes.length; i++) {
            self.restoreModelNode(elList.nodes[i].id, param.nodes[i], user, noHistUpdate);
        }

        //restore edges later
        for (let i = 0; i < elList.edges.length; i++) {
            self.restoreModelEdge(elList.edges[i].id, param.edges[i], user, noHistUpdate);
        }

        //change parents after adding them all
        for (let i = 0; i < elList.nodes.length; i++) {
            self.changeModelNodeAttribute('parent', elList.nodes[i].id, param.nodes[i].parent, null, noHistUpdate);
        }



        if (!noHistUpdate)
            self.updateHistory({
                opName: 'restore',
                opTarget: 'element group',
                elId: elList,
                param: param

            });
    }
    /**
     *
     * Restore operations for global undo/redo
     */
    restoreModelNode (nodeId, param, user, noHistUpdate) {

        //param is the previous node data
        //history is updated as restore command
        this.addModelNode(nodeId, param, user, true);

        //No need to init -- data and position are updated in the next steps

        if (!noHistUpdate)
            this.updateHistory({opName: 'restore', opTarget: 'element', elType: 'node', elId: nodeId, param:param});
    }


    restoreModelEdge (edgeId, param, user, noHistUpdate) {
        //param is the previous edge data
        //history is updated as restore command
        this.addModelEdge(edgeId, param, user, true);
        //No need to init -- data and position are updated in the next steps


        if (!noHistUpdate)
            this.updateHistory({opName: 'restore', opTarget: 'element', elType: 'edge', elId: edgeId, param:param});
    }


    restoreModelElement (elType, elId, param, user, noHistUpdate) {

        if (elType == "node")
            this.restoreModelNode(elId, param, user, noHistUpdate);
        else
            this.restoreModelEdge(elId, param, user, noHistUpdate);


    }


    /**
     * This function is used to undo newModel and redo initModel
     * @param modelCy : nodes and edges to be restored
     * @param user
     * @param noHistUpdate
     */
    restoreModel (modelCy, user, noHistUpdate) {
        let prevParam = this.model.get('documents.' + this.docId + '.cy');
        this.model.set('documents.' + this.docId + '.cy', modelCy);

        // this.setSampleInd(-1, null, true); //to get a new container

        if (!noHistUpdate)
            this.updateHistory({opName: 'restore', prevParam: prevParam, param: modelCy, opTarget: 'model'});

    }

    //should be called before loading a new graph to prevent id confusion
    newModel (user, noHistUpdate) {

        let self = this;
        let prevModelCy = this.model.get('documents.' + this.docId + '.cy');


        if (!noHistUpdate)
            this.updateHistory({opName: 'new', prevParam: prevModelCy, opTarget: 'model'});

        let edges = this.model.get('documents.' + this.docId + '.cy.edges');
        let nodes = this.model.get('documents.' + this.docId + '.cy.nodes');


        for (let att in edges) {
            if (edges.hasOwnProperty(att)) {
                self.deleteModelEdge(edges[att].id, user, true);
            }
        }

        for (let att in nodes) {
            if (nodes.hasOwnProperty(att)) {
                self.deleteModelNode(nodes[att].id, user, true);
            }
        }


    }


    //should be called before loading a new graph to prevent id confusion
    deleteAll (nodes, edges, user, noHistUpdate) {

        let self = this;
        if (!noHistUpdate)
            this.updateHistory({opName: 'new', opTarget: 'model'});


        edges.forEach(function (edge) {
            self.deleteModelEdge(edge.id(), user, noHistUpdate);
        });

        nodes.forEach(function (node) {
            self.deleteModelNode(node.id(), user, noHistUpdate);
        });


    }

    //convert model to array
    getJsonFromModel () {
        let nodes = this.model.get('documents.' + this.docId + '.cy.nodes');

        if (nodes == null)
            return null;

        let edges = this.model.get('documents.' + this.docId + '.cy.edges');

        let jsonNodes = [];
        let jsonEdges = [];


        for (let att in nodes) {

            if (nodes.hasOwnProperty(att)) {
                let node = nodes[att];
                let jsonNode = {
                    data: node.data
                };

                jsonNodes.push(jsonNode);
            }
        }

        for (let att in edges) {
            if (edges.hasOwnProperty(att)) {
                let edge = edges[att];

                let jsonEdge = {
                    data: edge.data
                };

                jsonEdges.push(jsonEdge);
            }
        }

        return {nodes: jsonNodes, edges: jsonEdges};
    }

    /***
     *
     * @param node: Cytoscape node
     * @param user: to make sure we don't update the data of same client
     * @param noHistUpdate
     */
    initModelNode (node, user, noHistUpdate) {


        let nodePath = this.model.at('documents.' + this.docId + '.cy.nodes.' + node.id());

        if (!noHistUpdate)
            this.updateHistory({opName: 'init', opTarget: 'element', elType: 'node', elId: node.id()});


        nodePath.set('id', node.id());

        node._private.data.annotationsView = null;

        let interactionCount = nodePath.get('interactionCount');

        if (interactionCount == null) //this is not stored in cy
            this.changeModelNodeAttribute('interactionCount', node.id(), 0, user, true); //don't update history

        let data = nodePath.get('data');
        //bbox is a random data parameter to make sure all data parts are already in the model
        //if the only data parameters are id and class, it means it has just been added without initialization
        if (data != null && data.bbox!=null) //it means data has been added before
            node.data(data);

        else {
            //correct the labels from PC queries
            let nodeData = node.data();
            if(nodeData == null)
                nodeData = node._private.data;



            if(nodeData.statesandinfos) {

                for (let i = 0; i < nodeData.statesandinfos.length; i++) {

                    if (nodeData.statesandinfos[i].clazz === "state letiable") {
                        if (nodeData.statesandinfos[i].state.value === "opthr") {
                            nodeData.statesandinfos[i].state.value = "p";
                            nodeData.statesandinfos[i].state.letiable = "T" + nodeData.statesandinfos[i].state.letiable;
                        }
                        else if (nodeData.statesandinfos[i].state.value === "opser") {
                            nodeData.statesandinfos[i].state.value = "p";
                            nodeData.statesandinfos[i].state.letiable = "S" + nodeData.statesandinfos[i].state.letiable;
                        }
                        else if (nodeData.statesandinfos[i].state.value === "optyr") {
                            nodeData.statesandinfos[i].state.value = "p";
                            nodeData.statesandinfos[i].state.letiable = "Y" + nodeData.statesandinfos[i].state.letiable;
                        }
                    }

                }
                node._private.data.statesandinfos = nodeData.statesandinfos;
            }
            this.changeModelNodeAttribute('data', node.id(), nodeData, user, noHistUpdate);
        }

        //make this initially unselected
        //    nodePath.set('highlightColor', null);


        let pos = nodePath.get('position');

        if (pos != null)
            node.position(pos);

        else {
            let nodePosition = node.position();
            if(nodePosition == null)
                nodePosition = node._private.position;
            this.changeModelNodeAttribute('position', node.id(), nodePosition, user, noHistUpdate);
        }

        //Initializing css properties causes bypass problems!!

    }

    initModelEdge (edge, user, noHistUpdate) {
        let edgePath = this.model.at('documents.' + this.docId + '.cy.edges.' + edge.id());

        if (!noHistUpdate)
            this.updateHistory({opName: 'init', opTarget: 'element', elType: 'edge', elId: edge.id()});

        edgePath.set('id', edge.id());

        edge._private.data.annotationsView = null;

        //make this initially unselected
        //edgePath.set('highlightColor', null);

        let data = edgePath.get('data');
        //cardinality is a random data parameter to make sure all data parts are already in the model
        //if the only data parameters are id and class, it means it has just been added without initialization
        if (data != null && data.cardinality != null)
            edge.data(data);

        else {
            let edgeData = edge.data();
            if(edgeData == null)
                edgeData = edge._private.data;

            this.changeModelEdgeAttribute('data', edge.id(), edgeData, user, noHistUpdate);
        }

    }

    /***
     *
     * @param nodes: cy elements
     * @param edges: cy elements
     * @param appUtilities: to update properties
     * @param user
     * @param noHistUpdate
     */
    initModel ( nodes, edges, appUtilities, user, noHistUpdate) {

        let self = this;

        console.log("inited");

        nodes.forEach(function (node) {
            self.initModelNode(node, user, true);

        });

        edges.forEach(function (edge) {
            self.initModelEdge(edge, user, true);
        });


        let newModelCy = this.model.get('documents.' + this.docId + '.cy');



        if (!noHistUpdate) {
            this.updateHistory({opName: 'init', param: newModelCy, opTarget: 'model'});
        }

        console.log("Init model finished")
        //notifies other clients to update their cy graphs
        this.model.pass({user:"me"}).set('documents.' + this.docId + '.cy.initTime', new Date());

    }



    setRollbackPoint () {
        let modelCy = this.getModelCy();
        this.model.set('documents.' + this.docId + '.prevCy', modelCy);
    }

    getModelCy () {
        return this.model.get('documents.' + this.docId + '.cy');
    }

    //for undo/redo only
    mergeJsons (user, noHistUpdate) {
        let modelCy = this.model.get('documents.' + this.docId + '.cy');
        let prevModelCy = this.model.get('documents.' + this.docId + '.prevCy');

        if (!noHistUpdate) {

            this.updateHistory({opName: 'merge', prevParam: prevModelCy, param: modelCy, opTarget: 'model'});
        }

    }

    updateFactoidModel(factoidModel, user, noHistUpdate){
        this.model.pass({user:user}).set('documents.' + this.docId + '.factoid', factoidModel);

        if(!noHistUpdate){
            let prevFactoidModel = this.model.get('documents.' + this.docId + '.factoid');
            this.updateHistory({opName:'factoid',  prevParam: prevFactoidModel, param: factoidModel, opTarget:'model'});
        }

    }

    getFactoidModel(){
        return this.model.get('documents.' + this.docId + '.factoid');
    }


}

module.exports = ModelManager;

function getNewColor(){
    let oneColor = require('onecolor');

    let gR = 1.618033988749895; //golden ratio
    let h = Math.floor((Math.random() * gR * 360));//Math.floor((cInd * gR - Math.floor(cInd * gR))*360);
    let cHsl = [h, 70 + Math.random() * 30, 60 + Math.random() * 10];
    let strHsl = 'hsl('+cHsl[0]  +', '+ cHsl[1] + '%, ' + cHsl[2] +'%)';

    return oneColor(strHsl).hex();
}
