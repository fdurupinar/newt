QUnit = require('qunitjs');
module.exports = function(app){
    QUnit.module( "Chat messages between users" );

    //Test if messages are added to the list and sorted correctly
    function sendMessageTest(ms, callback) {
        QUnit.test('sendMessage', function (assert) {
            assert.expect(2);
            var done1 = assert.async();
            var done2 = assert.async();

            app.model.set('_page.newComment', "test1");
            $('#send-message').trigger('click');
            setTimeout(function () {
                var pageList = app.model.get('_page.list');
                assert.equal(pageList[pageList.length - 1].comment, "test1");
                done1();

                app.model.set('_page.newComment', "test2");
                $('#send-message').trigger('click');
                setTimeout(function () {
                    pageList = app.model.get('_page.list');
                    assert.equal(pageList[pageList.length - 1].comment, "test2");
                    done2();

                }, ms);
                if(callback) callback();
            }, ms);
        });
    }

    //Test if userId, userName are correct
    function messageContentTest() {
        QUnit.test('messageContent', function (assert) {
            var messages = app.model.get('_page.list');
            var msg1 = messages[0];
            var userId = app.model.get('_session.userId');
            assert.equal(userId, msg1.userId);
            var userName = app.model.get('_page.doc.users.' + userId + '.name');
            assert.equal(userName, msg1.userName);
        });
    }
    sendMessageTest(1000, messageContentTest);

};