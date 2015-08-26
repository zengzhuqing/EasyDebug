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
            loadmore: 'websocket-log-viewer-loadmore'
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

           // $scope.loglines = [];
            for( var i = 0; i < $scope.loglines.length; i++) {
                if($scope.loglines[i]['Line'].match(param['expression'])) {
                    $scope.loglines[i]['show'] = true;
                    //showMessage($scope.logdata[i], i + 1);
                } else {
                    $scope.loglines[i]['show'] = false;
                }
            }
        };
        return me;
    };
}])

.controller('websocketLogViewerController', ['$anchorScroll', '$location','$scope','$http', 'websocketLogConstants', 'websocketLogEntryFormatterFactory', 'websocketLogConnectionManagerFactory',
    function ( $anchorScroll, $location, $scope, $http, websocketLogConstants, websocketLogEntryFormatterFactory, websocketLogConnectionManagerFactory) {

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
            NO: i,
            show:true
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

    $scope.$on(websocketLogConstants.commands.reloadlog, function (event, args) {
        console.log(args);
        $scope.logdata = [];
        $scope.loglines = [];
        $scope.documents = [];
      //  console.log($routeParams);
        $http.get(args['url'])
            .then(function(result) {
                //console.log(result.data);
                console.log("donwload finish");
                $scope.logdata = result.data.split('\n');
                console.log("split finish");

                var i = $scope.logdata.length;
                var w = 0;
                while(i != 0) {
                    i = Math.floor(i / 10);
                    w = w + 10;
                }
                $scope.width =  w + "px";



                for(i = 0; i < 4000; i ++) {
                    showMessage($scope.logdata[i], i+1);
                }
                console.log("all finished");
                //caculate the width of line number

            });
    });

    $scope.$on(websocketLogConstants.commands.loadmore, function () {

        function sleep(milliseconds) {
            var start = new Date().getTime();
            for (var i = 0; i < 1e7; i++) {
                if ((new Date().getTime() - start) > milliseconds){
                    break;
                }
            }
        }


        console.log("load more!!!!");
        var i;
        console.log($scope.logdata.length);
        for(i = 4000; i < $scope.logdata.length; i ++) {
            console.log(i);
            showMessage($scope.logdata[i], i+1);
            if( i % 2000 ==0 ) {
                sleep(1000)
            }

        }

    });

}])

.directive('websocketLogViewer', function () {
    return {
        restrict: 'E',
        replace: true,
    //    template: '<div class="log-viewer"><div class="log-viewer-entry" ng-repeat="logline in loglines"><span class="log-viewer-server-color" ng-style="{ backgroundColor: logline.color}"></span><span ng-bind-html="logline.HtmlLine"></span></div></div>',
        template: '<div  class="log-viewer"><div class="log-viewer-entry" ng-repeat="logline in loglines" ng-show="logline.show">' +
        '<span class="anchor linenumber" style="width: {{width}}" id="anchor{{logline.NO}}">{{logline.NO + "&nbsp;&nbsp;"}}</span>' +
        '<span ng-bind-html="logline.HtmlLine"></span></div></div>',
        controller: 'websocketLogViewerController'
    };
})

;