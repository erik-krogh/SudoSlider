/// <reference path="lib/jquery.d.ts" />
/// <reference path="lib/angular.d.ts" />
/// <reference path="events.ts" />
(function (angular, $) {
    angular.module('sudoSlider', []).directive('sudoSlider', ["sudoSlider", "$timeout", function (factory, $timeout) {
        return {
            scope: {
                sliderApi: '=?',
                sudoSlider: "=?"
            },
            link: function ($scope, element, attrs) {
                var slider;
                $scope.sliderApi = $scope.sliderApi || {};
                EventBus.getInstance().register(SudoSliderApiEvent, function (event) {
                    return event.callback($scope.sliderApi);
                }, false, window);
                var updateDefinitions = function (newDefinitions) {
                    var options;
                    if ($.isArray(newDefinitions)) {
                        options = {};
                        for (var i = 0; i < newDefinitions.length; i++) {
                            var definition = newDefinitions[i];
                            var definitionValue = definition.value;
                            if (definition.optional && !definition.enabled) {
                                definitionValue = false;
                            }
                            options[definition.name] = definitionValue;
                        }
                    }
                    else {
                        options = newDefinitions ? newDefinitions : {};
                    }
                    slider.destroy();
                    slider.setOptions(options);
                    // When i destroy it myself, i init it myself.
                    slider.init();
                };
                $scope.$watch("sudoSlider", updateDefinitions, true);
                $timeout(function () {
                    EventBus.getInstance().register(SudoSliderUpdateOptionsEvent, function (event) {
                        updateDefinitions(event.newDefinitions);
                    }, true, window);
                });
                slider = $(element).sudoSlider();
                $scope.slider = slider;
                for (var prop in slider) {
                    if (slider.hasOwnProperty(prop)) {
                        $scope.sliderApi[prop] = slider[prop];
                    }
                }
                element.on('$destroy', function () {
                    slider.destroy();
                });
            }
        };
    }]).controller('SudoSliderSlidesController', ["$scope", "$timeout", "sudoSlider", function ($scope, $timeout, sudoSlider) {
        $scope.slides = [
            { html: "<img src=\"../images/01.jpg\"/>" },
            { html: "<img src=\"../images/02.jpg\"/>" },
            { html: "<img src=\"../images/03.jpg\"/>" },
            { html: "<img src=\"../images/04.jpg\"/>" },
            { html: "<img src=\"../images/05.jpg\"/>" }
        ];
        EventBus.getInstance().register(SudoSliderSlidesUpdateEvent, function (event) {
            $scope.slides = event.newSlides;
            // We risk that the last event is fired immediately.
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }, true, window);
    }]).factory('sudoSlider', function () {
        return {
            defaultOptionDefinitions: getOptionDefinitions,
            defaultOptionValues: $.fn.sudoSlider.getDefaultOptions,
            insertValuesIntoOptionDefinitions: insertValuesIntoOptionDefinitions,
            getDemoDefinitions: getDemoDefinitions
        };
    });
    function insertValuesIntoOptionDefinitions(optionDefinitions, options) {
        $.each(optionDefinitions, function (index, optionDefinition) {
            if (!options.hasOwnProperty(optionDefinition.name)) {
                return;
            }
            var newValue = options[optionDefinition.name];
            if (optionDefinition.type == "function") {
                if ($.isFunction(newValue)) {
                    optionDefinition.stringValue = newValue.toString();
                    optionDefinition.value = newValue;
                }
                else {
                    optionDefinition.stringValue = newValue;
                    try {
                        optionDefinition.value = eval("(" + newValue + ")");
                    }
                    catch (ignored) {
                    }
                }
            }
            else if (optionDefinition.type == "array") {
                if ($.isArray(newValue)) {
                    optionDefinition.stringValue = "[" + newValue.toString() + "]";
                    optionDefinition.value = newValue;
                }
                else {
                    optionDefinition.stringValue = newValue;
                    optionDefinition.value = JSON.parse(newValue);
                }
            }
            else {
                optionDefinition.value = newValue;
            }
            if (optionDefinition.optional) {
                optionDefinition.enabled = newValue !== false;
            }
        });
    }
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
    function getDemoDefinitions() {
        return [
            {
                name: "continous",
                options: {
                    continuous: true
                }
            },
            {
                name: "numeric",
                options: {
                    numeric: true
                }
            },
            {
                name: "captions",
                options: {
                    effect: "fade",
                    continuous: true,
                    initCallback: function () {
                        var storage = {};
                        $(this).data("captions", storage);
                        var that = this;
                        storage.captions = $();
                        storage.css = {
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            width: "100%",
                            height: "25px",
                            textAlign: "center",
                            color: "black",
                            background: "rgba(255,255,255,0.7)",
                            filter: "progid:DXImageTransform.Microsoft.gradient(startColorstr=#a3ffffff,endColorstr=#a3ffffff)",
                            zoom: 1
                        };
                        storage.imageText = [
                            'Just another beautiful sunset',
                            'Mountains in the Alps',
                            'Road and mountains in the Alps',
                            'Behind another beautiful sunset',
                            'A goat in norway'
                        ];
                        storage.insertCaption = function (t) {
                            var slide = that.getSlide(t);
                            var imageText = storage.imageText[t - 1] || "I don't know what to say about this one.";
                            var caption = $('<div>' + imageText + '</div>').css(storage.css).appendTo(slide);
                            storage.captions = storage.captions.add(caption);
                            if (slide.css("position") == "static") {
                                slide.css("position", "relative");
                            }
                        };
                        var ajaxOption = this.getOption("ajax") || [];
                        for (var i = 0; i < this.getValue("totalslides"); i++) {
                            if (!ajaxOption[i]) {
                                storage.insertCaption(i + 1);
                            }
                        }
                    },
                    destroyCallback: function () {
                        var storage = $(this).data("captions");
                        if (!storage) {
                            return;
                        }
                        storage.captions.remove();
                        storage.captions = $();
                    },
                    ajaxLoad: function (t, img, that) {
                        var storage = $(that).data("captions");
                        storage.insertCaption(t);
                    },
                    beforeAnimation: function (t, that) {
                        var storage = $(that).data("captions");
                        $(this).children().filter(storage.captions).hide();
                    },
                    afterAnimation: function (t, that) {
                        var storage = $(that).data("captions");
                        $(this).children().filter(storage.captions).slideDown(400);
                    }
                }
            }
        ];
    }
})(angular, jQuery);
//# sourceMappingURL=sudoSliderAngular.js.map