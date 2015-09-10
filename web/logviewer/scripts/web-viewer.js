angular.module("nglog-websockeet-demo", ['ng-websocket-log-viewer'])

.controller("logController", ['$anchorScroll', '$location', '$scope', 'websocketLogConstants',
        function ($anchorScroll, $location, $scope, websocketLogConstants) {



    $scope.filter = function (expression) {
        $scope.$broadcast(websocketLogConstants.commands.filter, { expression: expression });
    };

    $scope.highlight = function (highlightText) {
        console.log("h1 called");
        $scope.$broadcast(websocketLogConstants.commands.highlight, { text: highlightText, id: 1, 'class': 'log-highlight' });
    };

    $scope.highlight1 = function (highlightText1) {
        console.log("h2 called");
        $scope.$broadcast(websocketLogConstants.commands.highlight, { text: highlightText1, id: 2, 'class': 'log-highlight1' });
    };

    $scope.highlight2 = function (highlightText2) {
        console.log("h3 called");
         $scope.$broadcast(websocketLogConstants.commands.highlight, { text: highlightText2, id: 3, 'class': 'log-highlight2' });
    };

    $scope.setLineCount = function (count) {
        $scope.$broadcast(websocketLogConstants.commands.lineCount, { count: count });
    };

    $scope.reloadlog = function () {
        var fileurl;
        function getQueryVariable(variable)
        {
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i=0;i<vars.length;i++) {
                var pair = vars[i].split("=");
                if(pair[0] == variable){return pair[1];}
            }
            return(false);
        }

        fileurl = "http://easydebug.eng.vmware.com" + getQueryVariable("file");
        console.log(fileurl);
        $scope.$broadcast(websocketLogConstants.commands.reloadlog, {url : fileurl} );

    };

    $scope.loadmore = function () {
         $scope.$broadcast(websocketLogConstants.commands.loadmore);
    };

    $scope.$on(websocketLogConstants.events.highlighted, function (event, args) {
        //console.log(args);
    });

        $scope.gotoAnchor = function(x) {
            console.log(x);
            var newHash = 'anchor' + x;
            if ($location.hash() !== newHash) {
                // set the $location.hash to `newHash` and
                // $anchorScroll will automatically scroll to it
                $location.hash('anchor' + x);
            } else {
                // call $anchorScroll() explicitly,
                // since $location.hash hasn't changed
                $anchorScroll();
            }
        };

    setTimeout(function () {
        $scope.setLineCount($scope.numberOfLines);
        $scope.$broadcast(websocketLogConstants.commands.highlight, { text: "ERROR", id: 2, 'class': 'log-highlight-error', silent: true });
        $scope.$broadcast(websocketLogConstants.commands.highlight, { text: "WARN", id: 3, 'class': 'log-highlight-warn', silent: true });
    }, 500);
}])

.directive('expandOnFocus', function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            var expandTo = attrs['expandOnFocus'];
            if (expandTo[expandTo.length] !== 'x')
                expandTo += "px";

            var original = null;
            elem.bind("focus", function () {
                original = elem[0].offsetWidth;
                elem.css("width", expandTo);
            });
            elem.bind("blur", function () {
                if(original)
                    elem.css("width", original+"px");
            });
        }
    };
})

;
