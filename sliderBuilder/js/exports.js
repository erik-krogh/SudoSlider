/// <reference path="lib/jquery.d.ts" />
/// <reference path="lib/angular.d.ts" />
/// <reference path="sudoSliderAngular.ts" />
/// <reference path="events.ts" />
(function (angular, $) {
    var eventBus = EventBus.getInstance();
    var myApp = angular.module('exports', ['ngSanitize', 'sudoSlider', 'ui.bootstrap', "sudoSlider"]).controller('ImportExportController', ["$scope", "$timeout", "sudoSlider", function ($scope, $timeout, sudoSlider) {
        $scope.style = "";
        $scope.optionDefinitions = [];
        $scope.slides = [];
        eventBus.register(SudoSliderUpdateOptionsEvent, function (event) {
            $scope.optionDefinitions = event.newDefinitions;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }, true, window);
        eventBus.register(SudoSliderSlidesUpdateEvent, function (event) {
            $scope.slides = event.newSlides;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }, true, window);
        eventBus.register(SliderBuilderStyleChangeEvent, function (event) {
            $scope.style = event.style;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }, true, window);
        var sliderApi = sudoSlider.globalSliderApi();
        $scope.importString = "";
        $scope.doImport = function () {
            sliderApi.destroy();
            var imported = JSON.parse($scope.importString);
            var options = imported.options;
            sudoSlider.insertValuesIntoOptionDefinitions($scope.optionDefinitions, options);
            $scope.slides = imported.slides;
            $scope.style = imported.style;
            eventBus.fireEvent(new ImportEvent($scope.slides, $scope.style, $scope.optionDefinitions));
            $timeout(function () {
                sliderApi.init();
            }, 0);
        };
        function getNonDefaultOptionValues() {
            var optionDefs = sudoSlider.filterAllDefaultValueOptionDefinitions($scope.optionDefinitions);
            var options = {};
            for (var i = 0; i < optionDefs.length; i++) {
                var def = optionDefs[i];
                if (def.type == "function") {
                    options[def.name] = def.stringValue;
                }
                else {
                    options[def.name] = def.value;
                }
            }
            return options;
        }
        $scope.getExportOutput = function () {
            return JSON.stringify({
                options: getNonDefaultOptionValues(),
                style: $scope.style + " ",
                slides: $.map($scope.slides, function (slide) {
                    return {
                        html: slide.html
                    };
                })
            });
        };
        $scope.getExportOptionsOutput = function (extraIndex) {
            if (extraIndex === void 0) { extraIndex = ""; }
            var optionDefs = sudoSlider.filterAllDefaultValueOptionDefinitions($scope.optionDefinitions);
            if (optionDefs.length == 0) {
                return "{}";
            }
            var result = "";
            var first = true;
            $.each(optionDefs, function (index, def) {
                if (first) {
                    first = false;
                }
                else {
                    result += ",\n";
                }
                result += "    " + extraIndex;
                if (def.type == "function" || def.type == "array") {
                    result += "\"" + def.name + "\":" + def.stringValue;
                }
                else {
                    var value = def.value;
                    if (def.type == "number") {
                        value = Number(value);
                    }
                    result += "\"" + def.name + "\":" + JSON.stringify(value);
                }
            });
            return "{\n" + result + "\n" + extraIndex + "}";
        };
        function indent(lines, prefix) {
            var result = "";
            for (var i = 0; i < lines.length; i++) {
                result += prefix + lines[i];
                if (i != lines.length - 1) {
                    result += "\n";
                }
            }
            return result;
        }
        $scope.indentedStyle = function () {
            var lines = $scope.style.split("\n");
            var prefix = "        ";
            return indent(lines, prefix);
        };
        $scope.getPrettySlides = function () {
            var prefix = "        ";
            var lines = "";
            for (var i = 0; i < $scope.slides.length; i++) {
                var slideObject = $scope.slides[i];
                var html = indent(slideObject.html.split("\n"), "    ");
                lines += "<div>\n" + html + "\n</div>";
                if (i != $scope.slides.length - 1) {
                    lines += "\n";
                }
            }
            return indent(lines.split("\n"), prefix);
        };
    }]);
}(angular, jQuery));
//# sourceMappingURL=exports.js.map