(function (angular, $) {
    var myApp = angular.module('myApp', ['ngSanitize', 'sudoSlider'])
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

            $scope.importString = "";
            $scope.doImport = function () {
                console.log("import called");
                $scope.sliderApi.destroy();
                var imported = JSON.parse($scope.importString);

                var options = imported.options;
                $.each($scope.optionDefinitions, function (index, optionDefinition) {
                    if (!options.hasOwnProperty(optionDefinition.name)) {
                        return;
                    }
                    var newValue = options[optionDefinition.name];
                    if (optionDefinition.type == "function") {
                        optionDefinition.functionValue = newValue;
                        try {
                            optionDefinition.value = eval("(" + newValue + ")");
                        } catch (ignored) {
                        }
                    } else {
                        optionDefinition.value = newValue;
                    }
                    if (optionDefinition.optional) {
                        optionDefinition.enabled = newValue !== false;
                    }
                });

                $scope.slides = imported.slides;

                $scope.style = imported.style;


                setTimeout(function () {
                    $scope.sliderApi.init();
                }, 0);
            };

            $scope.getExportOutput = function () {
                console.log("Export called");
                var result = {};
                var optionDefs = filterAllDefaultValueOptionDefinitions($scope.optionDefinitions);
                result.options = {};
                for (var i = 0; i < optionDefs.length; i++) {
                    var def = optionDefs[i];
                    if (def.type == "function") {
                        result.options[def.name] = def.functionValue;
                    } else {
                        result.options[def.name] = def.value;
                    }
                }

                result.slides = [];
                for (var i = 0; i < $scope.slides.length; i++) {
                    result.slides.push({
                        html: $scope.slides[i].html
                    });
                }
                result.style = $scope.style;

                return JSON.stringify(result);
            };

        }]).controller('OptionController', ["$scope", function ($scope) {
            $scope.setOptionFunction = function (value) {
                try {
                    var func = eval("(" + value + ")");
                    $scope.definition.value = func;
                } catch (ignored) {
                }
            };

            $scope.setArrayValue = function (value) {
                try {
                    var array = jQuery.parseJSON(value);
                    $scope.definition.value = array;
                } catch (ignored) {
                }
            };

            if ($scope.definition.type == "function") {
                $scope.definition.functionValue = $scope.definition.value.toString();
            }

            if ($scope.definition.type == "array") {
                $scope.definition.arrayValue = $scope.definition.value.toString();
            }


            $scope.clazz = function () {
                var definition = $scope.definition;
                var clazz = "";
                if (definition.optional && !definition.enabled) {
                    clazz += "disabled ";
                }
                if (definition.type == "number" && Number(definition.value) != definition.value) {
                    clazz += "invalid ";
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