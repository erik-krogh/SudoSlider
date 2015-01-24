/// <reference path="lib/jquery.d.ts" />
/// <reference path="lib/angular.d.ts" />
/// <reference path="sudoSliderAngular.ts" />
/// <reference path="events.ts" />



// TODO: Export in pop-up window thinghy. http://stackoverflow.com/questions/1258563/how-can-i-access-the-dom-tree-of-child-window
// TODO: Slider in pop-up window, consider having an event-bus for message passing.
(function (angular : ng.IAngularStatic, $ : JQueryStatic) {
    var myApp = angular.module('myApp', ['ngSanitize', 'sudoSlider', 'ui.bootstrap'])
        .controller('BodyController', ["$scope", "sudoSlider", "$timeout", function ($scope, sudoSlider : SudoSliderFactory, $timeout) {
            $scope.sliderApi = {};

            $scope.style = ".slide img{\n" +
            "    width:100%;\n" +
            "}";

            $scope.optionDefinitions = sudoSlider.defaultOptionDefinitions();

            $scope.slides = [
                {html: "<img src=\"../images/01.jpg\"/>"},
                {html: "<img src=\"../images/02.jpg\"/>"},
                {html: "<img src=\"../images/03.jpg\"/>"},
                {html: "<img src=\"../images/04.jpg\"/>"},
                {html: "<img src=\"../images/05.jpg\"/>"}
            ];

            $scope.removeSlide = function (index) {
                $scope.sliderApi.removeSlide(index + 1);
                $scope.slides.splice(index, 1);
            };

            $scope.addSlide = function () {
                $scope.sliderApi.destroy();
                $scope.slides.push({html: "<img src=\"../images/01.jpg\"/>"});
                $timeout(function () {
                    $scope.sliderApi.init();
                }, 0);
            };

            $scope.$watch("slides", function () {
                $scope.sliderApi.destroy();
                $timeout(function () {
                    $scope.sliderApi.init();
                });
            }, true);
        }]).controller('ImportExportController', ["$scope", "$timeout", "sudoSlider", function ($scope, $timeout, sudoSlider : SudoSliderFactory) {
            $scope.importString = "";
            $scope.doImport = function () {
                $scope.sliderApi.destroy();
                var imported = JSON.parse($scope.importString);
                $scope.importString = "";

                var options = imported.options;
                sudoSlider.insertValuesIntoOptionDefinitions($scope.optionDefinitions, options);

                $scope.$parent.slides = imported.slides;

                $scope.$parent.style = imported.style;

                $timeout(function () {
                    $scope.sliderApi.init();
                }, 0);
            };

            function getNonDefaultOptionValues() {
                var optionDefs = filterAllDefaultValueOptionDefinitions($scope.optionDefinitions);
                var options = {};

                for (var i = 0; i < optionDefs.length; i++) {
                    var def = optionDefs[i];
                    if (def.type == "function") {
                        options[def.name] = def.stringValue;
                    } else {
                        options[def.name] = def.value;
                    }
                }
                return options;
            }

            $scope.getExportOutput = function () {
                return JSON.stringify({
                    options: getNonDefaultOptionValues(),
                    style : $scope.style,
                    slides : $.map($scope.slides, function (slide) {
                        return {
                            html: slide.html
                        }
                    })
                });
            };

            $scope.getExportOptionsOutput = function () {
                var optionDefs = filterAllDefaultValueOptionDefinitions($scope.optionDefinitions);
                var result = "";
                var first = true;
                $.each(optionDefs, function (index, def) {
                    if (first) {
                        first = false;
                    } else {
                        result += ","
                    }
                    if (def.type == "function" || def.type == "array") {
                        result += "\"" + def.name + "\":" + def.stringValue
                    } else {
                        var value = def.value;
                        if (def.type == "number") {
                            value = Number(value);
                        }
                        result += "\"" + def.name + "\":" + JSON.stringify(value)
                    }
                });

                return "{" + result + "}";
            }

        }]).controller('OptionController', ["$scope", function ($scope) {
            $scope.setOptionFunction = function (value) {
                try {
                    var func = eval("(" + value + ")");
                    $scope.definition.value = func;
                } catch (ignored) {
                }
            };

            $scope.setstringValue = function (value) {
                try {
                    var array = jQuery.parseJSON(value);
                    $scope.definition.value = array;
                } catch (ignored) {
                }
            };

            if ($scope.definition.type == "function" || $scope.definition.type == "array") {
                $scope.definition.stringValue = $scope.definition.value.toString();
            }

            $scope.clazz = function () {
                var definition = $scope.definition;
                var clazz = "";
                if (definition.optional && !definition.enabled) {
                    clazz += "disabled ";
                }
                if (definition.type == "number" && Number(definition.value) != definition.value) {
                    clazz += "has-error ";
                }
                return clazz;
            };
        }]).controller('DemoLoaderController', ["$scope", "sudoSlider", function ($scope, sudoSlider : SudoSliderFactory) {
            $scope.currentDemo = null;

            $scope.demoDefiniftions = sudoSlider.getDemoDefinitions();

            $scope.selectDemo = function (demo) {
                $scope.currentDemo = demo;
                sudoSlider.insertValuesIntoOptionDefinitions($scope.optionDefinitions, sudoSlider.defaultOptionValues());
                if (demo.options) {
                    sudoSlider.insertValuesIntoOptionDefinitions($scope.optionDefinitions, demo.options);
                }
                if (demo.slides) {
                    $scope.$parent.slides = demo.slides;
                }
                if (demo.style) {
                    $scope.$parent.style = demo.style;
                }
            };
        }])
        .filter('nonDefaultValues', function () {
            return function (optionDefinitions, filter) {
                if (!filter) {
                    return optionDefinitions;
                }
                return filterAllDefaultValueOptionDefinitions(optionDefinitions);
            };
        });

    var defaultOptions = jQuery.fn.sudoSlider.getDefaultOptions();

    function filterAllDefaultValueOptionDefinitions(optionDefinitions) {
        var result = [];
        jQuery.each(optionDefinitions, function (index, optionDefinition) {
            var defaultValue = defaultOptions[optionDefinition.name];
            var currentValue = optionDefinition.value;
            if (defaultValue.toString() !== currentValue.toString()) {
                result.push(optionDefinition);
            }
        });
        return result;
    }
}(angular, jQuery));

