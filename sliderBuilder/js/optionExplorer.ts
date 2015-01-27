/// <reference path="lib/jquery.d.ts" />
/// <reference path="lib/angular.d.ts" />
/// <reference path="sudoSliderAngular.ts" />
/// <reference path="events.ts" />
(function (angular : ng.IAngularStatic, $ : JQueryStatic) {
    var eventBus = EventBus.getInstance();

    (function () {
        var windows : Window[] = [];

        eventBus.register(RegisterWindowEvent, function (event:RegisterWindowEvent) {
            var win = event.win;
            windows.push(win);
            $(win).on("beforeunload", function () {
                windows.splice(windows.indexOf(win), 1);
            });
        });

        $(window).on("beforeunload", function () {
            $.each(windows, function (index, win : Window) {
                win.close();
            });
        });
    })();

    var myApp = angular.module('myApp', ['ngSanitize', 'sudoSlider', 'ui.bootstrap', "sudoSlider"])
        .controller('BodyController', ["$scope", "sudoSlider", "$timeout", function ($scope, sudoSlider : SudoSliderFactory, $timeout) {
            $scope.sliderApi = sudoSlider.globalSliderApi();

            $scope.style = ".slide img{\n" +
            "    width:100%;\n" +
            "}";

            $scope.$watch("style", function (newStyle) {
                eventBus.fireEvent(new SliderBuilderStyleChangeEvent(newStyle));
            });

            $scope.optionDefinitions = sudoSlider.defaultOptionDefinitions();

            $scope.$watch("optionDefinitions", function (newValue) {
                eventBus.fireEvent(new SudoSliderUpdateOptionsEvent(newValue));
            }, true);

            $scope.slides = [
                {html: "<img src=\"../images/01.jpg\"/>"},
                {html: "<img src=\"../images/02.jpg\"/>"},
                {html: "<img src=\"../images/03.jpg\"/>"},
                {html: "<img src=\"../images/04.jpg\"/>"},
                {html: "<img src=\"../images/05.jpg\"/>"}
            ];

            $scope.$watch("slides", function (slides) {
                eventBus.fireEvent(new SudoSliderSlidesUpdateEvent(slides));
                $scope.sliderApi.destroy();
                $timeout(function () {
                    $scope.sliderApi.init();
                });
            }, true);

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

            $scope.showInlineSlider = true;

            $scope.setShowInlineSlider = function (value) {
                $scope.showInlineSlider = value;
            };

            eventBus.register(ImportEvent, function (event:ImportEvent) {
                $scope.slides = event.slides;
                $scope.style = event.style;
                $scope.optionDefinitions = event.definitions;
                $scope.$apply();
            });

        }]).controller('PopupController', ["$scope", "$timeout", "sudoSlider", function ($scope, $timeout, sudoSlider : SudoSliderFactory) {
            $scope.openSliderPopup = function () {
                var newWindow = window.open("popups/sliderPopup.html", "_blank", "width=1000, height=600");
                $scope.$parent.showInlineSlider = false;
            };

            $scope.openExportPopup = function () {
                var newWindow = window.open("popups/exportPopup.html", "_blank", "width=1000, height=600");
            };
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
        .filter('nonDefaultValues', ["sudoSlider", function (sudoSlider : SudoSliderFactory) {
            return function (optionDefinitions, filter) {
                if (!filter) {
                    return optionDefinitions;
                }
                return sudoSlider.filterAllDefaultValueOptionDefinitions(optionDefinitions);
            };
        }]);
}(angular, jQuery));

