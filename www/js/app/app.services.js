angular.module('your_app_name.app.services', [])

    .service('AuthService', function ($rootScope, $auth, $config) {

        this.saveUser = function (user) {
            window.localStorage.your_app_name_user = JSON.stringify(user);
        };

        this.getLoggedUser = function () {
            return (window.localStorage.your_app_name_user) ?
                JSON.parse(window.localStorage.your_app_name_user) : null;
        };

        this.isAuthenticated = function () {
            return $auth.isAuthenticated();
        };

        this.authenticate = function (provider) {
            $auth
                .authenticate(provider)
                .then(this.successAuth)
                .catch(this.failedAuth);
        };

        this.logIn = function (user) {
            $auth
                .login(user, { url: $config.apiUrl + 'api/auth/signin' })
                .then(this.successAuth)
                .catch(this.failedAuth);

        };

        this.logOut = function () {
            $auth.logout({ url: $config.apiUrl + 'api/auth/signout' })
                .then(function () {
                    window.localStorage.your_app_name_user = JSON.stringify(null);
                    $rootScope.$emit('userLoggedOut');
                });

        };

        this.signUp = function (itm) {
            $auth
                .signup(itm, { url: $config.apiUrl + 'api/auth/signup' })
                .then(this.successAuth)
                .catch(this.failedAuth);
        };


        this.successAuth = function (data) {
            $rootScope.$emit('userLoggedIn', data.data);
        };

        this.failedAuth = function (err) {
            $rootScope.$emit('userFailedLogin', err.data);
        };

    })

    .service('ExchangesRateService', function ($rootScope, $http, $q, $config) {

        this.getExchangesRate = function (base) {
            var dfd = $q.defer();
            $http.get($config.apiUrl + 'api/exchangesrate/' + base).success(function (data) {
                // console.log(data);
                dfd.resolve(data);
            });
            return dfd.promise;
        };



        this.post = function (post) {
            var dfd = $q.defer();
            $http.post($config.apiUrl + 'api/exchanges', post)
                .success(function (res) {
                    dfd.resolve(res);
                })
                .error(function (err) {
                    dfd.reject(err);
                });
            return dfd.promise;
        };




    })

    .service('ExchangeService', function ($http, $q, $config, AuthService) {
        var user = AuthService.getLoggedUser();
        this.getExchanges = function () {
            var dfd = $q.defer();
            $http.get($config.apiUrl + 'api/exchanges').success(function (data) {
                dfd.resolve(data);
            }).error(function (err) {
                dfd.reject(err);
            })
            return dfd.promise;
        };

        this.getExchange = function (id) {
            var dfd = $q.defer();
            $http.get($config.apiUrl + 'api/exchanges/' + id).success(function (data) {
                dfd.resolve(data);
            }).error(function (err) {
                dfd.reject(err);
            })
            return dfd.promise;
        };

        this.createExchange = function (data) {
            var dfd = $q.defer();
            $http.post($config.apiUrl + 'api/exchanges', data).success(function (data) {
                dfd.resolve(data);
            }).error(function (err) {
                dfd.reject(err);
            })
            return dfd.promise;
        };



    })

    .service('googleMapService', function ($http, $q, $config) {
        this.getLocationByPlace = function (place_id) {
            var dfd = $q.defer();
            console.log(place_id);
            $http.get($config.mapApiUrl + '&placeid=' + place_id).success(function (data) {
                dfd.resolve(data);
            });
            return dfd.promise;
        }
    })

    .service('roomService', function ($http, $q) {
        var apiURL = 'http://localhost:3000/api';
        this.getrooms = function () {
            var dfd = $q.defer();
            var user = (window.localStorage.user) ? JSON.parse(window.localStorage.user) : null;
            $http.get(apiURL + '/chatrooms', user).success(function (data) {
                // window.localStorage.setItem("storage", JSON.stringify(data));
                alert(JSON.stringify(data));
                dfd.resolve(data);
            }).error(function (err) {
                dfd.reject(err);
            })
            return dfd.promise;
        };

        this.getRoom = function (roomId) {
            var dfd = $q.defer();
            $http.get(apiURL + '/chatrooms/' + roomId).success(function (database) {
                dfd.resolve(database);
            });
            return dfd.promise;
        };

        this.createRoom = function (data) {
            var dfd = $q.defer();
            $http.post(apiURL + '/chatrooms', data).success(function (data) {
                dfd.resolve(data);
            }).error(function (err) {
                dfd.reject(err);
            })
            return dfd.promise;
        };
    })

    .factory('Socket', function ($rootScope) {

        var url = 'http://localhost:3000/';
        var socket = io.connect(url);
        return {
            connect: function () {
                io.connect(url);
            },
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            },
            removeAllListeners: function (eventName, callback) {
                socket.removeAllListeners(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            }
        };
    })

    ;
