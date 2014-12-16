(function (angular, $) {
    var myApp = angular.module('myApp', ['ngSanitize', 'sudoSlider', 'ui.bootstrap'])
        .controller('BodyController', ["$scope", "sudoSlider", function ($scope, sudoSlider) {
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
                setTimeout(function () {
                    $scope.sliderApi.init();
                }, 0);
            };
        }]).controller('ImportExportController', ["$scope", function ($scope) {
            $scope.importString = "";
            $scope.doImport = function () {
                $scope.sliderApi.destroy();
                var imported = JSON.parse($scope.importString);
                $scope.importString = "";

                var options = imported.options;
                $.each($scope.optionDefinitions, function (index, optionDefinition) {
                    if (!options.hasOwnProperty(optionDefinition.name)) {
                        return;
                    }
                    var newValue = options[optionDefinition.name];
                    if (optionDefinition.type == "function") {
                        optionDefinition.stringValue = newValue;
                        try {
                            optionDefinition.value = eval("(" + newValue + ")");
                        } catch (ignored) {
                        }
                    } else if (optionDefinition.type == "array") {
                        optionDefinition.stringValue = "[" + newValue.toString() + "]";
                        optionDefinition.value = newValue;
                    } else {
                        optionDefinition.value = newValue;
                    }
                    if (optionDefinition.optional) {
                        optionDefinition.enabled = newValue !== false;
                    }
                });

                $scope.$parent.slides = imported.slides;

                $scope.$parent.style = imported.style;


                setTimeout(function () {
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