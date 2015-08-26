/* ng-websocket-log-viewer 1.0.0
 * ------------------------------------
 * This is an AngularJS component to watch logs in real-time using (but not limited to) NLog.Contrib.Targets.WebSocketServer
 * Please visit: https://github.com/vtortola/NLog.Contrib.Targets.WebSocketServer
 */

angular.module("ng-websocket-log-viewer", [])

.factory('websocketLogConstants', function () {
    return {
        commands: {
            connect: 'websocket-log-viewer-connect',
            filter: 'websocket-log-viewer-filter',
            highlight: 'websocket-log-viewer-highlight',

            lineCount: 'websocket-log-viewer-line-count',
            reload: 'websocket-log-viewer-reload',
            onlyShow: 'websocket-log-viewer-only-show-sources'
        },
        events: {
            connected: 'websocket-log-viewer-connected',
            disconnected: 'websocket-log-viewer-disconnected',
            highlighted: 'websocket-log-viewer-highlight-match',

        }
    };
})

.factory('websocketLogEntryFormatterFactory', ['$sce', 'websocketLogConstants', function ($sce, websocketLogConstants) {
    return function ($scope) {
        var me = {};
        var highlighted = {};


        var highlightInLogEntry = function (entry) {
            for (var id in highlighted) {
                var item = highlighted[id];

                if (!item.text || !item.class)
                    continue;

                var isSomethingHighlighted = false;
                while (entry.HtmlLine.indexOf(item.text) != -1) {
                    var text = item.text[0];
                    text += "<span class='match-breaker'></span>";
                    text += item.text.substr(1, item.text.length - 1);
                    entry.HtmlLine = entry.HtmlLine.replace(item.text, "<span class='highlight " + item.class + "'>" + text + "</span>");
                    isSomethingHighlighted = !item.silent;
                }

                if (isSomethingHighlighted)
                    $scope.$emit(websocketLogConstants.events.highlighted, { text: item.text, 'class': item.class, highlighIid: item.id, lineId: entry.id, source: entry.source });
            }
        };


        me.highlight = function (param) {

            if (param.text && param.text.length >= 2) {
                highlighted[param.id] = param;
                for (var i = 0; i < $scope.loglines.length; i++) {
                    me.formatEntry($scope.loglines[i]);
                }
            }
            else if (highlighted[param.id]) {
                delete highlighted[param.id];
                for (var i = 0; i < $scope.loglines.length; i++) {
                    me.formatEntry($scope.loglines[i]);
                }
            }
        };

        me.formatEntry = function (entry) {
            entry.HtmlLine = entry.Line;
            highlightInLogEntry(entry);
            entry.HtmlLine = $sce.trustAsHtml(entry.HtmlLine);
        };


        return me;
    };
}])
    
.factory('websocketLogConnectionManagerFactory', ['websocketLogConstants', function () {
    return function (showMessage, $scope) {
        var me = {};

        me.filter = function (param) {

            $scope.loglines = [];
            for( var i = 0; i < $scope.logdata.length; i++) {
                if($scope.logdata[i].match(param['expression'])) {

                    showMessage($scope.logdata[i], i + 1);
                }

            }

        };

        return me;
    };
}])

.controller('websocketLogViewerController', ['$anchorScroll', '$location','$scope','$http', 'websocketLogConstants', 'websocketLogEntryFormatterFactory', 'websocketLogConnectionManagerFactory',
    function ($anchorScroll, $location, $scope, $http, websocketLogConstants, websocketLogEntryFormatterFactory, websocketLogConnectionManagerFactory) {

    $scope.loglines = [];
    $scope.width;
    var maxLines = 50;
    var lastTimespan = 0;

    var pushEntryIntoScope = function (entry) {

        websocketLogEntryFormatter.formatEntry(entry);
        $scope.loglines.push(entry);
        updateLogBoard();
    };

    var updateLogBoard = function () {
        $scope.$$phase || $scope.$apply();
    };

    var showMessage = function (line, i) {
        lastTimespan = lastTimespan + 1;
        pushEntryIntoScope({
            Timestamp: lastTimespan,
            Line: line,
            NO: i
        });
    };


    var websocketLogEntryFormatter = websocketLogEntryFormatterFactory($scope);
    var websocketLogConnectionManager = websocketLogConnectionManagerFactory(showMessage, $scope);

    $scope.$on(websocketLogConstants.commands.connect, function (event, args) {
        websocketLogConnectionManager.connect(args, 1);
    });

    $scope.$on(websocketLogConstants.commands.filter, function (event, args) {
        websocketLogConnectionManager.filter(args);
    });

    $scope.$on(websocketLogConstants.commands.highlight, function (event, args) {
        websocketLogEntryFormatter.highlight(args);
    });


    $scope.$on(websocketLogConstants.commands.lineCount, function (event, args) {
        var count = Number(args.count);
        if (!isNaN(count))
            maxLines = count;
    });

    $scope.$on(websocketLogConstants.commands.reloadlog, function (event) {
        console.log('reloadlog!!!!');
        $scope.logdata = [];
        $scope.loglines = [];
        $scope.documents = [];
        $http.get('http://127.0.0.1:8181/vmware-3.log')
            .then(function(result) {

                $scope.logdata = $scope.logdata.concat(result.data.toString().split('\n'));
                var i;
                for(i = 0; i < $scope.logdata.length; i ++) {
                    showMessage($scope.logdata[i], i+1);
                }
                //caculate the width of line number
                var w = 0;
                while(i != 0) {
                    i = Math.floor(i / 10);
                    w = w + 10;
                }
                $scope.width =  w + "px";
            });
    });



    $scope.$on(websocketLogConstants.commands.onlyShow, function (event, args) {
        // todo
    });



}])

.directive('websocketLogViewer', function () {
    return {
        restrict: 'E',
        replace: true,
    //    template: '<div class="log-viewer"><div class="log-viewer-entry" ng-repeat="logline in loglines"><span class="log-viewer-server-color" ng-style="{ backgroundColor: logline.color}"></span><span ng-bind-html="logline.HtmlLine"></span></div></div>',
        template: '<div class="log-viewer"><div class="log-viewer-entry" ng-repeat="logline in loglines">' +
        '<span class="anchor linenumber" style="width: {{width}}" id="anchor + {{logline.NO}}">{{logline.NO + "&nbsp;&nbsp;"}}</span>' +
        '<span ng-bind-html="logline.HtmlLine"></span></div></div>',
        controller: 'websocketLogViewerController'
    };
})

;