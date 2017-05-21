angular.module('your_app_name.app.controllers', [])


    .controller('AppCtrl', function ($rootScope, $scope, $state, AuthService) {

        //this will represent our logged user
        var user = AuthService.getLoggedUser();
        $scope.loggedUser = user;

        $rootScope.$on('userLoggedIn', function (e, data) {
            user = AuthService.getLoggedUser();
            $scope.loggedUser = user;
        });
        $scope.logOut = function () {
            AuthService.logOut();
        };

        $rootScope.$on('userLoggedOut', function (e) {

            $state.go('auth.welcome');
        });
    })


    .controller('ProfileCtrl', function ($scope, $stateParams, $ionicHistory, $state, $ionicScrollDelegate) {

        $scope.$on('$ionicView.afterEnter', function () {
            $ionicScrollDelegate.$getByHandle('profile-scroll').resize();
        });

        var userId = $stateParams.userId;

        $scope.myProfile = $scope.loggedUser._id == userId;
        $scope.posts = [];
        $scope.likes = [];
        $scope.user = {};
        /*
                PostService.getUserPosts(userId).then(function (data) {
                    $scope.posts = data;
                });
            
                PostService.getUserDetails(userId).then(function (data) {
                    $scope.user = data;
                });
            
                PostService.getUserLikes(userId).then(function (data) {
                    $scope.likes = data;
                });
            
                $scope.getUserLikes = function (userId) {
                    //we need to do this in order to prevent the back to change
                    $ionicHistory.currentView($ionicHistory.backView());
                    $ionicHistory.nextViewOptions({ disableAnimate: true });
            
                    $state.go('app.profile.likes', { userId: userId });
                };
            
                $scope.getUserPosts = function (userId) {
                    //we need to do this in order to prevent the back to change
                    $ionicHistory.currentView($ionicHistory.backView());
                    $ionicHistory.nextViewOptions({ disableAnimate: true });
            
                    $state.go('app.profile.posts', { userId: userId });
                };
        */
    })

    .controller('HomeCtrl', function ($scope, $rootScope, ExchangesRateService, $ionicModal, currencyFormatService, $timeout, AuthService, ExchangeService, googleMapService, $stateParams, $state, $cordovaGeolocation, $ionicLoading) {
        $scope.exchangesRate = [];
        $scope.dataExchange = {};
        var defaultCurrency = currencyFormatService.getCurrencies();
        $scope.currencys = [];
        for (var key in defaultCurrency) {
            $scope.currencys.push({
                base: key,
                fractionSize: defaultCurrency[key].fractionSize,
                name: defaultCurrency[key].name,
                symbol: defaultCurrency[key].symbol,
                uniqSymbol: defaultCurrency[key].uniqSymbol
            })
        }

        if ($stateParams.more) {
            $scope.cateMore = $stateParams.more;
        }
        $scope.gotoSeeAll = function () {
            $state.go('app.more');
        };
        $scope.onFromSelected = function (item) {
            $scope.dataExchange.currency_from = item.base;
            $scope.getLate();
        };
        $scope.onFromInvalid = function () {
            $scope.dataExchange.currency_to1 = null;
            $scope.dataExchange.amount_to = null;
        };

        $scope.chkCurrency = function () {
            $scope.dataExchange.currency_to1 = null;
            $scope.dataExchange.amount_to = null;
        };

        $scope.chkCurrencyTo = function () {
            $scope.dataExchange.amount_to = null;
        };


        $scope.onToSelected = function (item) {
            $scope.dataExchange.currency_to1 = item.base;
            $scope.getamount(item);
        };
        $scope.onToInvalid = function () {
            // alert('no select');
        };

        ExchangesRateService.getExchangesRate('THB').then(function (data) {
            $scope.base = data.base;
            $scope.exchangesRate = data.rates;
            $scope.exchangesRate.forEach(function (rate) {
                rate.desc = currencyFormatService.getByCode(rate.currency);
            })
        });

        $scope.doRefresh2 = function () {
            ExchangeService.getExchanges().then(function (res) {
                $scope.listExchanges = res;
                $scope.$broadcast('scroll.refreshComplete');
            }, function (err) {
                alert('err : ' + JSON.stringify(err));
                $scope.$broadcast('scroll.refreshComplete');
            });

        };

        $scope.getExchanges = function () {
            ExchangeService.getExchanges().then(function (res) {
                $scope.listExchanges = res;
            }, function (err) {
                alert('err : ' + JSON.stringify(err));
            });
        };


        $scope.doRefresh = function () {
            ExchangesRateService.getExchangesRate('THB').then(function (data) {
                $scope.exchangesRate = data.rates;
                $scope.exchangesRate.forEach(function (rate) {
                    rate.desc = currencyFormatService.getByCode(rate.currency);
                })
            });
            $scope.$broadcast('scroll.refreshComplete');
        };

        $ionicModal.fromTemplateUrl('views/app/home/home-post.html', {
            scope: $scope,
        }).then(function (homelist) {
            $scope.homelist = homelist;
        });

        $scope.showList = function () {
            $scope.dataExchange = {};
            $scope.homelist.show();
        };

        $scope.closeList = function () {
            $scope.homelist.hide();
        };

        $scope.getLate = function () {
            ExchangesRateService.getExchangesRate($scope.dataExchange.currency_from)
                .then(function (success) {
                    var defaultCurrency = success.rates;
                    $scope.exchangeto = [];
                    if (defaultCurrency) {
                        defaultCurrency.forEach(function (current) {
                            $scope.exchangeto.push({
                                base: current.currency,
                                value: current.value
                            })
                        });
                    }
                })
        }
        $scope.getamount = function (ex) {
            if (ex) $scope.dataExchange.rate = ex.value;

            $scope.dataExchange.amount_to = $scope.dataExchange.amount_from / $scope.dataExchange.rate;
            if (ex) {
                $scope.dataExchange.currency_to = ex.base;
            }

        }


        $scope.gotoMap = function () {

            if (!$scope.location) {

                $ionicModal.fromTemplateUrl('views/app/home/home-post-location.html', {
                    scope: $scope,
                }).then(function (location) {
                    $scope.location = location;
                    $scope.location.show();
                    $scope.initialize();
                });
            } else {
                $scope.location.show();
            }


        };

        $scope.closeMap = function () {
            $scope.location.hide();
        };

        $scope.post = function () {
            $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">Loading...</p>' })

            // $scope.dataExchange.location = $scope.dataExchange.location || {};
            // if ($rootScope.place) {
            //     $scope.dataExchange.location.name = $rootScope.place.name;
            //     $scope.dataExchange.location.address = $rootScope.place.formatted_address;
            //     $scope.dataExchange.location.lat = $rootScope.place.geometry.location.lat();
            //     $scope.dataExchange.location.lng = $rootScope.place.geometry.location.lng();
            // }
            $scope.dataExchange.user = AuthService.getLoggedUser();

            //console.log($scope.dataExchange);
            ExchangesRateService.post($scope.dataExchange)
                .then(function (success) {
                    ExchangeService.getExchanges().then(function (res) {
                        $scope.listExchanges = res;
                        $scope.dataExchange = {};
                        $scope.place = null;
                        $scope.homelist.hide();
                        $scope.getExchanges();
                        $ionicLoading.hide();
                    }, function (err) {
                        $ionicLoading.hide();
                        alert('err : ' + JSON.stringify(err));
                    });

                }, function (err) {
                    $ionicLoading.hide();
                    alert(err.message);
                })
        }


        $scope.initialize = function () {

            $timeout(function (argument) {
                var mapOptions = {};
                if (!$rootScope.place) {
                    mapOptions = {
                        center: { lat: 13.9351306, lng: 100.7381782 },
                        zoom: 13,
                        disableDefaultUI: true, // To remove default UI from the map view
                        scrollwheel: false
                    };
                } else {
                    mapOptions = {
                        center: { lat: $rootScope.place.geometry.location.lat(), lng: $rootScope.place.geometry.location.lng() },
                        zoom: 17,
                        disableDefaultUI: true, // To remove default UI from the map view
                        scrollwheel: false
                    };
                }

                $scope.disableTap = function () {
                    // var container = document.getElementsByClassName('pac-container');
                    // angular.element(container).attr('data-tap-disabled', 'true');
                    // var backdrop = document.getElementsByClassName('backdrop');
                    // angular.element(backdrop).attr('data-tap-disabled', 'true');
                    // angular.element(container).on("click", function() {
                    //     document.getElementById('pac-input').blur();
                    // });

                    var input = event.target;
                    // Get the predictions element
                    var container = document.getElementsByClassName('pac-container');
                    container = angular.element(container);
                    // Apply css to ensure the container overlays the other elements, and
                    // events occur on the element not behind it
                    container.css('z-index', '5000');
                    container.css('pointer-events', 'auto');
                    // Disable ionic data tap
                    container.attr('data-tap-disabled', 'true');
                    // Leave the input field if a prediction is chosen
                    container.on('click', function () {
                        input.blur();
                    });
                };

                var map = new google.maps.Map(document.getElementById('map'),
                    mapOptions);

                // =========== bind map ============
                if ($rootScope.place) {
                    // var marker = new google.maps.Marker({
                    //     position: { lat: $rootScope.place.geometry.location.lat(), lng: $rootScope.place.geometry.location.lng() },
                    //     map: map
                    // });
                    var infoWindow = new google.maps.InfoWindow();

                    infoWindow.setOptions({
                        content: '<div><strong>' + $rootScope.place.name + '</strong><br>' + $rootScope.place.formatted_address + '</div>',
                        position: $rootScope.place.geometry.location,
                    });
                    infoWindow.open(map);
                    // google.maps.event.addListener(marker, 'click', function() {
                    //     infoWindow.open(map, this);
                    // });
                }
                // =========== bind map ============

                var input = /** @type {HTMLInputElement} */ (
                    document.getElementById('pac-input'));

                // Create the autocomplete helper, and associate it with
                // an HTML text input box.
                var autocomplete = new google.maps.places.Autocomplete(input);
                autocomplete.bindTo('bounds', map);

                map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

                var infowindow = new google.maps.InfoWindow();
                var marker = new google.maps.Marker({
                    map: map
                });

                // Get the full place details when the user selects a place from the
                // list of suggestions.

                google.maps.event.addListener(autocomplete, 'place_changed', function () {
                    infowindow.close();
                    var place = autocomplete.getPlace();
                    var lati = place.geometry.location.lat();
                    var lngi = place.geometry.location.lng();
                    if (!place.geometry) {
                        return;
                    }

                    if (place.geometry.viewport) {
                        map.fitBounds(place.geometry.viewport);
                    } else {
                        map.setCenter(place.geometry.location);
                        map.setZoom(17);
                    }

                    // Set the position of the marker using the place ID and location.
                    marker.setPlace( /** @type {!google.maps.Place} */({
                        placeId: place.place_id,
                        location: place.geometry.location
                    }));
                    marker.setVisible(true);
                    // + '<br>' + lati + ',' + lngi 
                    infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
                        place.formatted_address + '</div>');
                    infowindow.open(map, marker);
                    $timeout(function (argument) {
                        $scope.location.hide();
                    }, 2000);

                    // ==== set data ====
                    console.log(place);
                    $rootScope.place = place;
                });
            }, 500);
        }
        $scope.locationChanged = function (location) {

            googleMapService.getLocationByPlace(location.place_id)
                .then(function (data) {
                    console.log(data);
                    $scope.dataExchange.location = data.result.geometry.location;
                    $scope.dataExchange.location.name = location.description;
                    $scope.dataExchange.location.address = location.description;
                });
        };
        $scope.getExchanges();

        $scope.getMapMore = function () {
            $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">Loading...</p>' })

            $scope.markers = [];
            setTimeout(function () {

                var options = { timeout: 10000, enableHighAccuracy: true };
                $cordovaGeolocation.getCurrentPosition(options).then(function (position) {

                    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                    var mapOptions = {
                        center: latLng,
                        zoom: 10,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    };

                    $scope.map = new google.maps.Map(document.getElementById("mapMore"), mapOptions);


                    google.maps.event.addListenerOnce($scope.map, 'idle', function () {


                        var marker = new google.maps.Marker({
                            map: $scope.map,
                            animation: google.maps.Animation.DROP,
                            icon: 'img/me.png',
                            position: latLng
                        });
                        $scope.markers.push(marker);

                        var nlistExchanges = [];

                        for (var i = $scope.listExchanges.length - 1; i >= 0; i--) {
                            if ($scope.listExchanges[i].currency_from === $stateParams.more || $stateParams.more === "") {
                                if ($scope.listExchanges[i].location) {
                                    var nlatnLng = new google.maps.LatLng($scope.listExchanges[i].location.lat, $scope.listExchanges[i].location.lng);
                                    var marker = new google.maps.Marker({
                                        map: $scope.map,
                                        animation: google.maps.Animation.DROP,
                                        position: nlatnLng
                                    });
                                    $scope.markers.push(marker);
                                }
                            }
                        };
                        $ionicLoading.hide();


                    });
                }, function (error) {
                    $ionicLoading.hide();
                    console.log("Could not get location");
                });
            }, 100);
        }
        $scope.locationChanged = function (location) {
            googleMapService.getLocationByPlace(location.place_id)
                .then(function (data) {
                    console.log(data);
                    $scope.dataExchange.location = data.result.geometry.location;
                    $scope.dataExchange.location.name = location.description;
                    $scope.dataExchange.location.address = location.description;
                });
        };

        $scope.getSymbolByCode = function (currency) {
            if (currency) {
                if (currencyFormatService.getByCode(currency).symbol.grapheme !== "undefined") {
                    return currencyFormatService.getByCode(currency).symbol.grapheme;
                }
            }
        };
        $scope.getExchanges();



    })

    .controller('SettingsCtrl', function ($rootScope, $scope, $state, $ionicModal, AuthService, $ionicLoading) {

        $ionicModal.fromTemplateUrl('views/app/legal/terms-of-service.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.terms_of_service_modal = modal;
        });

        $ionicModal.fromTemplateUrl('views/app/legal/privacy-policy.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.privacy_policy_modal = modal;
        });

        $scope.showTerms = function () {
            $scope.terms_of_service_modal.show();
        };

        $scope.showPrivacyPolicy = function () {
            $scope.privacy_policy_modal.show();
        };

        $rootScope.$on('userLoggedOut', function (e) {

            $state.go('auth.welcome');
        });

        $scope.logOut = function () {
            AuthService.logOut();
        };

    })


    .controller('ExchangeCtrl', function ($scope, $stateParams, ExchangeService, $cordovaGeolocation, currencyFormatService, $ionicLoading) {
        var exchangeId = $stateParams.exchangeId;
        $scope.exchange = {};
        $scope.map = null;
        $scope.getSymbolByCode = function (currency) {
            if (currency) {
                if (currencyFormatService.getByCode(currency).symbol.grapheme !== "undefined") {
                    return currencyFormatService.getByCode(currency).symbol.grapheme;
                }
            }
        };
        ExchangeService.getExchange(exchangeId).then(function (res) {
            $scope.exchange = res;

            var options = { timeout: 10000, enableHighAccuracy: true };

            $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
                $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">Loading...</p>' })


                var latLng = null;
                if (!$scope.exchange.location) {
                    latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                } else {
                    latLng = new google.maps.LatLng($scope.exchange.location.lat, $scope.exchange.location.lng);
                }
                var mapOptions = {
                    center: latLng,
                    zoom: 15,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                $scope.map = new google.maps.Map(document.getElementById("mapDetail"), mapOptions);


                if ($scope.exchange.location) {
                    google.maps.event.addListenerOnce($scope.map, 'idle', function () {

                        var marker = new google.maps.Marker({
                            map: $scope.map,
                            animation: google.maps.Animation.DROP,
                            position: latLng
                        });

                    });
                }
                $ionicLoading.hide();

            }, function (error) {
                $ionicLoading.hide();
                console.log("Could not get location");
            });

        }, function (err) {
            $ionicLoading.hide();
            alert(JSON.stringify(err));
        });

        $scope.phoneCall = function () {
            window.location = 'tel:' + $scope.exchange.tel;
        };

        $scope.openGMap = function() {
            alert($scope.exchange.location.lat + ',' + $scope.exchange.location.lng)
//             if ionic.Platform.isIOS()
//     window.open("http://maps.apple.com/?q=#{text}&ll=#{lat},#{long}&near=#{lat},#{long}", '_system', 'location=yes')  
//   else
//     window.open("geo:#{lat},#{long}?q=#{text}", '_system', 'location=yes')
            window.location = 'geo:' + $scope.exchange.location.lat + ',' + $scope.exchange.location.lng;
            //window.open("http://maps.apple.com/?ll=#{$scope.exchange.location.lat},#{$scope.exchange.location.lng}&near=#{$scope.exchange.location.lat},#{$scope.exchange.location.lng}", '_system', 'location=yes')
        };

    })

    ;
