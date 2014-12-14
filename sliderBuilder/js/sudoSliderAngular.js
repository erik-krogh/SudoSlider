(function (angular, $) {
    angular.module('sudoSlider', []).directive('sudoSlider', ["sudoSlider", function (factory) {
        return {
            scope: {
                sliderApi: '=',
                sudoSlider: "="
            },
            link: function ($scope, element, attrs) {

                // factory.defaultOptionDefinitions();

                $scope.internalSliderApi = $scope.sliderApi || {};

                var options = {};

                $scope.$watch("sudoSlider", function (value) {
                    var options;
                    if ($.isArray(value)) {
                        options = {};
                        for (var i = 0; i < value.length; i++) {
                            var definition = value[i];
                            var definitionValue = definition.value;
                            if (definition.optional && !definition.enabled) {
                                definitionValue = false;
                            }
                            options[definition.name] = definitionValue;
                        }
                    } else {
                        options = value ? value : {};
                    }
                    slider.setOptions(options);
                }, true);

                var slider = $(element).sudoSlider(options);

                for (var prop in slider) {
                    if (slider.hasOwnProperty(prop)) {
                        $scope.internalSliderApi[prop] = slider[prop];
                    }
                }

                element.on('$destroy', function () {
                    slider.destroy();
                })
            }
        };
    }]).factory('sudoSlider', function () {
        return {
            defaultOptionDefinitions: getOptionDefinitions
        }
    });

    function getOptionDefinitions() {
        var optionDefinitions = [
            {
                name: "effect",
                type: "dropdown",
                choices: Object.keys($.fn.sudoSlider.effects)
            },
            {
                name: "speed",
                type: "number"
            },
            {
                name: "customLink",
                optional: true,
                enabled: false,
                type: "text"
            },
            {
                name: "controlsFadeSpeed",
                type: "number"
            },
            {
                name: "controlsFade",
                type: "boolean"
            },
            {
                name: "insertAfter",
                type: "boolean"
            },
            {
                name: "vertical",
                type: "boolean"
            },
            {
                name: "slideCount",
                type: "number"
            },
            {
                name: "moveCount",
                type: "number"
            },
            {
                name: "startSlide",
                type: "number"
            },
            {
                name: "responsive",
                type: "boolean"
            },
            {
                name: "ease",
                type: "text"
            },
            {
                name: "auto",
                type: "boolean"
            },
            {
                name: "CSSease",
                type: "text"
            },
            {
                name: "pause",
                type: "number"
            },
            {
                name: "resumePause",
                optional: true,
                enabled: false,
                type: "number"
            },
            {
                name: "continuous",
                type: "boolean"
            },
            {
                name: "prevNext",
                type: "boolean"
            },
            {
                name: "numeric",
                type: "boolean"
            },
            {
                name: "numericText",
                type: "array"
            },
            {
                name: "slices",
                type: "number"
            },
            {
                name: "boxCols",
                type: "number"
            },
            {
                name: "boxRows",
                type: "number"
            },
            {
                name: "initCallback",
                type: "function"
            },
            {
                name: "ajaxLoad",
                type: "function"
            },
            {
                name: "beforeAnimation",
                type: "function"
            },
            {
                name: "afterAnimation",
                type: "function"
            },
            {
                name: "history",
                type: "boolean"
            },
            {
                name: "autoHeight",
                type: "boolean"
            },
            {
                name: "autoWidth",
                type: "boolean"
            },
            {
                name: "updateBefore",
                type: "boolean"
            },
            {
                name: "ajax",
                optional: true,
                enabled: false,
                type: "array"
            },
            {
                name: "preloadAjax",
                optional: true,
                enabled: true,
                type: "number"
            },
            {
                name: "loadingText",
                type: "text"
            },
            {
                name: "prevHtml",
                type: "text"
            },
            {
                name: "nextHtml",
                type: "text"
            },
            {
                name: "controlsAttr",
                type: "text"
            },
            {
                name: "numericAttr",
                type: "text"
            },
            {
                name: "interruptible",
                type: "boolean"
            },
            {
                name: "useCSS",
                type: "boolean"
            },
            {
                name: "loadStart",
                type: "function"
            },
            {
                name: "loadFinish",
                type: "function"
            },
            {
                name: "touch",
                type: "boolean"
            },
            {
                name: "touchHandle",
                optional: true,
                enabled: false,
                type: "text"
            },
            {
                name: "destroyCallback",
                type: "function"
            },
            {
                name: "mouseTouch",
                type: "boolean"
            },
            {
                name: "allowScroll",
                type: "boolean"
            }
        ];

        var defaultOptions = $.fn.sudoSlider.getDefaultOptions();

        if (Object.keys(defaultOptions).length != optionDefinitions.length) {
            console.error("Mismatch between options (" + Object.keys(defaultOptions).length + ") and option definitions (" + optionDefinitions.length + ") length");
        }

        $.each(optionDefinitions, function (index, def) {
            if (!defaultOptions.hasOwnProperty(def.name)) {
                console.error("Could not find the option " + def.name + " in the SudoSlider options. ");
                return;
            }
            def.value = defaultOptions[def.name];
        });
        return optionDefinitions;
    }
})(angular, jQuery);