angular.module('autocomplete.directive', [])

  .directive('ionicAutocomplete',
    function ($ionicPopover) {
      var popoverTemplate =
      '<ion-popover-view style="margin-top:5px" ng-click="closePop()">' +
        '<ion-content>' +
        '<div style="text-align: right; margin-right: 15px; ">'+
        '<i class="icon-rigth ion-close" ng-click="closePop()"></i>'+
        '</div>'+
        '<div class="list">' +
        
        '<a href="" class="item" ng-repeat="item in items | filter:{base : inputSearch} as datas" ng-click="selectItem(item)">{{item.base}}</a>' +
        '</div>' +
        '</ion-content>' +
        '</ion-popover-view>'
      return {
        restrict: 'A',
        scope: {
          params: '=ionicAutocomplete',
          inputSearch: '=ngModel'
        },
        link: function ($scope, $element, $attrs) {
          var popoverShown = false
          var popover = null
          $scope.items = []
          // Add autocorrect="off" so the 'change' event is detected when user tap the keyboard
          $element.attr('autocorrect', 'off')

          popover = $ionicPopover.fromTemplate(popoverTemplate, {
            scope: $scope,
            backdropClickToClose: true
          })

          $element.on('keyup', function (e) {
            $scope.inputSearch = $scope.inputSearch ? $scope.inputSearch.toString() : ''
            if (!popoverShown && $scope.inputSearch) {
              $scope.items = $scope.params.items
              popover.show(e)
            } else {
              $scope.items = []
              $scope.params.onDataInvalid()
              popover.hide()
            }
          })

          $scope.selectItem = function (item) {
            $element.val(item.display)
            popover.hide()
            $scope.params.onSelect(item)
          }

          $scope.closePop = function (datas) {
            // if (datas < 1) {
              popover.hide()
            // }
          }
        }
      }
    }
)
