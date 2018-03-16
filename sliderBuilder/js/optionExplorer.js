/// <reference path="lib/jquery.d.ts" />
/// <reference path="lib/angular.d.ts" />
/// <reference path="sudoSliderAngular.ts" />
/// <reference path="events.ts" />
(function (angular, $) {
    var eventBus = EventBus.getInstance();
    (function () {
        var windows = [];
        eventBus.register(RegisterWindowEvent, function (event) {
            var win = event.win;
            windows.push(win);
            $(win).on("beforeunload", function () {
                windows.splice(windows.indexOf(win), 1);
            });
        });
        $(window).on("beforeunload", function () {
            $.each(windows, function (index, win) {
                win.close();
            });
        });
    })();
    var modules = ['ngSanitize', 'sudoSlider', "sudoSlider"];
    var optionalModules = ["ui.bootstrap", "ui.materialize", "ngMaterial"]; // I experiment with multiple front-ends.
    optionalModules.forEach(function (mod) {
        try {
            angular.module(mod);
            modules.push(mod);
        }
        catch (e) {
        }
    });
    var myApp = angular.module('myApp', modules).controller('BodyController', ["$scope", "sudoSlider", "$timeout", function ($scope, sudoSlider, $timeout) {
        $scope.sliderApi = sudoSlider.globalSliderApi();
        $scope.style = ".slide img{\n" + "    width:100%;\n" + "}";
        $scope.optionFilter = { filter: "" };
        $scope.$watch("style", function (newStyle) {
            eventBus.fireEvent(new SliderBuilderStyleChangeEvent(newStyle));
        });
        $scope.optionDefinitions = sudoSlider.defaultOptionDefinitions();
        $scope.$watch("optionDefinitions", function (newValue) {
            eventBus.fireEvent(new SudoSliderUpdateOptionsEvent(newValue));
        }, true);
        $scope.slides = [
            { html: "<img src=\"../images/01.jpg\"/>" },
            { html: "<img src=\"../images/02.jpg\"/>" },
            { html: "<img src=\"../images/03.jpg\"/>" },
            { html: "<img src=\"../images/04.jpg\"/>" },
            { html: "<img src=\"../images/05.jpg\"/>" }
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
            $scope.slides.push({ html: "<img src=\"../images/01.jpg\"/>" });
            $timeout(function () {
                $scope.sliderApi.init();
            }, 0);
        };
        $scope.showInlineSlider = true;
        $scope.setShowInlineSlider = function (value) {
            $scope.showInlineSlider = value;
        };
        eventBus.register(ImportEvent, function (event) {
            $scope.slides = event.slides;
            $scope.style = event.style;
            $scope.optionDefinitions = event.definitions;
            $scope.$apply();
        });
    }]).controller('PopupController', ["$scope", "$timeout", "sudoSlider", function ($scope, $timeout, sudoSlider) {
        $scope.openSliderPopup = function () {
            window.open("popups/sliderPopup.html", "_blank", "width=1000, height=600, scrollbars=yes, resizeable=yes");
            $scope.$parent.showInlineSlider = false;
        };
        $scope.openExportPopup = function () {
            window.open("popups/exportPopup.html", "_blank", "width=1000, height=600, scrollbars=yes, resizeable=yes");
        };
    }]).controller('OptionController', ["$scope", function ($scope) {
        $scope.setOptionFunction = function (value) {
            try {
                var func = eval("(" + value + ")");
                $scope.definition.value = func;
            }
            catch (ignored) {
            }
        };
        $scope.setstringValue = function (value) {
            try {
                var array = jQuery.parseJSON(value);
                $scope.definition.value = array;
            }
            catch (ignored) {
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
    }]).controller('DemoLoaderController', ["$scope", "sudoSlider", function ($scope, sudoSlider) {
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
            if ($scope.showInlineSlider) {
                $("html, body").animate({ scrollTop: 0 }, "slow");
            }
        };
    }]).filter('nonDefaultValues', ["sudoSlider", function (sudoSlider) {
        return function (optionDefinitions, filter) {
            if (!filter) {
                return optionDefinitions;
            }
            return sudoSlider.filterAllDefaultValueOptionDefinitions(optionDefinitions);
        };
    }]);
}(angular, jQuery));
//# sourceMappingURL=optionExplorer.js.map