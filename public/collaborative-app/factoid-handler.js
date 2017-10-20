/**
 * Created by durupina on 11/14/16.
 */
var jsonMerger = require('./reach-functions/json-merger.js');

module.exports =  function(app) {

    var idxcardjson = require('./reach-functions/idxcardjson-to-json-converter.js');

    var socket = io();
    var idxCardView = require('./reach-functions/idxCard-info.js');
    var jsonGraphs;
    var nodeMap;
    var text= 'We introduce a new method. MDM2 phosphorylates TP53.  MDM2 deactivates RAF. A Sos-1-E3b1 complex directs Rac activation by entering into a tricomplex with Eps8.';
    var pmcID = "PMC2797771";


    return   {
        initialize: function(){

            $('#factoidBox')[0].value = text;

            var factoidModel = app.modelManager.getFactoidModel();

            if(factoidModel != null){

                jsonGraphs = factoidModel.jsonGraphs;
                nodeMap = factoidModel.nodeMap;
                this.updateTextBox(jsonGraphs);
            }

            this.listenToEvents();

        },

        updateTextBox: function(jsonGraphs){
            var textFromJsons = "";
            for(var i = 0; i < jsonGraphs.length; i++)
                textFromJsons+= jsonGraphs[i].sentence + '. ';

            text = textFromJsons;
            $('#factoidBox')[0].value = text = textFromJsons;
        },

        loadFactoidModel: function(inputStr){
            //parse each input sentence one by one

            var self = this;
            var jsonGraphs = [];

            var notyView = noty({layout: "bottom",text: "Sending REACH queries"});

            var p = new Promise(function (resolve) {
                socket.emit("REACHQuery", "indexcard", inputStr, function (data) {
                    var cards = JSON.parse(data).cards;

                    cards.forEach(function(card){
                        var jsonData = idxcardjson.createJson({cards: [card]});
                            jsonGraphs.push({sentence: card.evidence[0], json: jsonData, idxCard:card});
                    });

                    notyView.setText( "Merging graphs...");

                    nodeMap = self.mergeJsons(jsonGraphs, function(){
                        //save it to the model
                        app.modelManager.updateFactoidModel({jsonGraphs: jsonGraphs, nodeMap: nodeMap, text: text}, "me");
                    }); //mapping between sentences and node labels
                    notyView.close();

                 });
            });
        },


        //Merge an array of json objects to output a single json object.
        mergeJsons: function (jsonGraph, callback) {
            var idxCardNodeMap = {};
            var sentenceNodeMap = {};

            var jsonObj = jsonMerger.mergeJsons(jsonGraph, sentenceNodeMap, idxCardNodeMap);

            app.modelManager.newModel("me", true);

            chise.updateGraph(jsonObj, function(){

                app.modelManager.initModel(cy.nodes(), cy.edges(), appUtilities, "me");

                //Call layout after init
                $("#perform-layout").trigger('click');

                //Call merge notification after the layout
                setTimeout(function () {
                    app.modelManager.mergeJsons("me", true);

                    if (callback) callback();
                }, 1000);

            });

            return {sentences: sentenceNodeMap, idxCards: idxCardNodeMap};
        },

        highlightSentenceInText: function(nodeId, highlightColor){


            try {
                var el = $('#factoidBox');


                if (highlightColor == null) {
                    el.highlightTextarea('destroy');
                    return;
                }

                var sentences = nodeMap.sentences[nodeId];

                var idxCards = nodeMap.idxCards[nodeId];

                //TODO: open this!!!!!! qtip not working
                // try {
                //     cy.$(('#' + nodeId)).qtip({
                //         content: {
                //             text: function (event, api) {
                //
                //                 var info = (new idxCardView(idxCards)).render();
                //                 var html = $('#idxCard-container').html();
                //
                //
                //                 api.set('content.text', html);
                //
                //                 return html;
                //
                //
                //             }
                //         },
                //         show: {
                //             ready: true
                //         },
                //         position: {
                //             my: 'top center',
                //             at: 'top middle',
                //             adjust: {
                //                 cyViewport: true
                //             },
                //             effect: false
                //         },
                //         style: {
                //             classes: 'qtip-bootstrap',
                //             tip: {
                //                 width: 20,
                //                 height: 20
                //             }
                //         }
                //     });
                //
                // }
                // catch(e){
                //     console.log(e);
                // }


                if (sentences) {

                    var ranges = [];

                    for (var i = 0; i < sentences.length; i++) {
                        var startInd = el[0].value.indexOf(sentences[i]);
                        var endInd = startInd + sentences[i].length;
                        ranges.push([startInd, endInd]);
                    }
                    console.log(ranges);

                    el.highlightTextarea({
                        ranges: [{
                            color: highlightColor,//('#FFFF0'),
                            ranges: ranges
                        }]
                    });

                }
            }
            catch(e){
                console.log(e);
            }
        },

        setFactoidModel: function(factoidModel){
            nodeMap = factoidModel.nodeMap;
            jsonGraphs = factoidModel.jsonGraphs;
            text = factoidModel.text;

        },


        loadFactoidPMC: function() {

            var link = "https://www.ncbi.nlm.nih.gov/pmc/articles/" + $('#pmcBox').val() ;
            socket.emit("HTTPRequest", link,  function(result){
                //console.log(result);

                $('#factoidBox')[0].value = result;
            });
            // loadFactoidModel($(, menu);
        },

        loadFactoidFile: function(e){

            var extension = $("#factoid-file-input")[0].files[0].name.split('.').pop().toLowerCase();


            if(extension == "pdf") {

                var reader = new FileReader();
                reader.onload = function (e) {

                    socket.emit('pdfConvertRequest',this.result, function(pages){

                        //Combine pages
                        var txt  = "";
                        pages.forEach(function(page){

                            page.forEach(function(el){

                                txt += el + " ";
                            });
                            // txt += '\n';
                        });



                        //TODO txtData needs some kind of cleaning
                        $('#factoidBox')[0].value = txt;

                    });



                };
                reader.readAsArrayBuffer($("#factoid-file-input")[0].files[0]);



            }
            else{
                var reader = new FileReader();
                reader.onload = function (e) {

                    $('#factoidBox')[0].value =  this.result; //change text

                };
                reader.readAsText($("#factoid-file-input")[0].files[0]);
            }
        },

        listenToEvents: function(){
            var self = this;

            $('#factoid-text-submit-button').click(function () {
                self.loadFactoidModel($('#factoidBox').val());

            });

            $('#factoid-text-clear-button').click(function () {
                self.text = '';
                $('#factoidBox')[0].value = '';

            });


            $('#factoid-file-input').change(function (e) {
                self.loadFactoidFile(e);

            });

            $('#pmc-id-submit-button').click(function (e) {
                self.loadFactoidPMC();

            });

        }

    };
}



// if( typeof module !== 'undefined' && module.exports){ // expose as a nodejs module
//     module.exports = new FactoidInput();