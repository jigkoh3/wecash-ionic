angular.module('underscore', [])
    .factory('_', function () {
        return window._; // assumes underscore has already been loaded on the page
    });

angular.module('your_app_name', [
    'ionic',
    'satellizer',
    'ngCordova',
    'your_app_name.common.directives',
    'your_app_name.app.controllers',
    'your_app_name.auth.controllers',
    'your_app_name.app.services',
    // 'your_app_name.views',//disable templateCache view
    'underscore',
    'angularMoment',
    'ngIOS9UIWebViewPatch',
    'ion-floating-menu',
    'currencyFormat',
    'angular.filter',
    'ion-place-tools',
    'autocomplete.directive',
    'btford.socket-io',
    'pascalprecht.translate'
])

    .constant('$config', {
        apiUrl: 'https://wecash.herokuapp.com/', // your restful API example http://localhost:3000/ 'https://wecashapp.herokuapp.com/',https://wecash.herokuapp.com/
        redirectUri: 'http://localhost:8100/', // oauth callback url of ionic app example http://localhost:8100/
        facebook: {
            clientId: '274815989655164' // your client id from facebook console example 
        },
        mapApiUrl: 'https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyDBfasMDDKue3Vpu26BlELAjB_AIny8LsM'
    })
    // Enable native scrolls for Android platform only,
    // as you see, we're disabling jsScrolling to achieve this.
    .config(function ($ionicConfigProvider) {
        if (ionic.Platform.isAndroid()) {
            $ionicConfigProvider.scrolling.jsScrolling(false);
            $ionicConfigProvider.platform.android.tabs.position('bottom');
        }

    })


    .run(function ($ionicPlatform, $rootScope, $ionicHistory, $timeout, $ionicConfig) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            var push = new Ionic.Push({
                "debug": true
            });

            push.register(function (token) {
                console.log("My Device token:", token.token);
                // prompt("My Device token:", token.token);
                window.localStorage.token = JSON.stringify(token.token);
                push.saveToken(token);  // persist the token in the Ionic Platform
            });

            var devicePlatform = ionic.Platform.platform();
            window.localStorage.wecashplatform = devicePlatform;

            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
            window.plugins.sim.getSimInfo(successCallback, errorCallback);

            function successCallback(result) {
                console.log(result);
            }

            function errorCallback(error) {
                console.log(error);
            }

            // Android only: check permission 
            function hasReadPermission() {
                window.plugins.sim.hasReadPermission(successCallback, errorCallback);
            }

            // Android only: request permission 
            function requestReadPermission() {
                window.plugins.sim.requestReadPermission(successCallback, errorCallback);
            }

            navigator.globalization.getPreferredLanguage(
                function (language) {
                    alert('language: ' + language.value + '\n');
                    window.localStorage.language = language.value;
                },
                function () { alert('Error getting language\n'); }
            );
        });

        // This fixes transitions for transparent background views
        $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
            if (toState.name.indexOf('auth.welcome') > -1) {
                // set transitions to android to avoid weird visual effect in the walkthrough transitions
                $timeout(function () {
                    $ionicConfig.views.transition('android');
                    $ionicConfig.views.swipeBackEnabled(false);
                    console.log("setting transition to android and disabling swipe back");
                }, 0);
            }
        });
        $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
            if (toState.name.indexOf('app.home.list') > -1) {
                // Restore platform default transition. We are just hardcoding android transitions to auth views.
                $ionicConfig.views.transition('platform');
                // If it's ios, then enable swipe back again
                if (ionic.Platform.isIOS()) {
                    $ionicConfig.views.swipeBackEnabled(true);
                }
                console.log("enabling swipe back and restoring transition to platform default", $ionicConfig.views.transition());
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider, $config, $authProvider, $translateProvider) {

        var commonConfig = {
            popupOptions: {
                location: 'no',
                toolbar: 'yes',
                width: window.screen.width,
                height: window.screen.height
            }
        };

        if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
            commonConfig.redirectUri = $config.redirectUri;
        }
        $authProvider.facebook(angular.extend({}, commonConfig, {
            clientId: $config.facebook.clientId,
            url: $config.apiUrl + 'api/auth/facebook'
        }));


        $stateProvider

            //SIDE MENU ROUTES
            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "views/app/side-menu.html",
                controller: 'AppCtrl'
            })

            .state('app.home', {
                url: "/home",
                abstract: true,
                views: {
                    'menuContent': {
                        templateUrl: "views/app/home.html",
                        controller: 'HomeCtrl'
                    }
                }
            })

            .state('app.home.list', {
                url: "/",
                views: {
                    'home-list': {
                        templateUrl: "views/app/home/home-list.html",
                        controller: 'HomeCtrl'
                    }
                }
            })

            .state('app.home.post', {
                url: "/post",
                views: {
                    'home-post': {
                        templateUrl: "views/app/home/home-post.html",
                        controller: 'HomeCtrl'
                    }
                }
            })



            .state('app.home.rate', {
                url: "/rate",
                views: {
                    'home-rate': {
                        templateUrl: "views/app/home/home-rate.html",
                        controller: 'HomeCtrl'
                    }
                }
            })

            .state('app.home.chatlist', {
                url: "/chatList",
                views: {
                    'home-chat': {
                        templateUrl: "views/app/chat-list/chat-list.html",
                        controller: 'ChatListCtrl'
                    }
                }
            })

            .state('app.home.more', {
                url: "/homeMore",
                views: {
                    'home-more': {
                        templateUrl: "views/app/home/home-more.html",
                        controller: 'HomeCtrl'
                    }
                }
            })

            .state('app.detail', {
                url: "/detail/:exchangeId",
                views: {
                    'menuContent': {
                        templateUrl: "views/app/home/detail.html",
                        controller: 'ExchangeCtrl'
                    }
                }
            })
            .state('app.chat', {
                url: "/chat/:chatId",
                views: {
                    'menuContent': {
                        templateUrl: "views/app/chat/chatroom.html",
                        controller: 'ChatCtrl'
                    }
                }
            })

            .state('app.more', {
                url: "/more/:more",
                views: {
                    'menuContent': {
                        templateUrl: "views/app/home/more.html",
                        controller: 'HomeCtrl'
                    }
                }
            })


            .state('home-post-location', {
                url: "/home-post-location",
                views: {
                    'menuContent': {
                        templateUrl: "views/app/home/home-post-location.html",
                        controller: 'HomeCtrl'
                    }
                }
            })

            .state('app.all', {
                url: "/all",
                views: {
                    'menuContent': {
                        templateUrl: "views/app/home/all.html",
                        controller: 'HomeCtrl'
                    }
                }
            })


            .state('app.profile', {
                abstract: true,
                url: '/profile/:userId',
                views: {
                    'menuContent': {
                        templateUrl: "views/app/profile/profile.html",
                        controller: 'ProfileCtrl'
                    }
                }
            })

            .state('app.profile.posts', {
                url: '/posts',
                views: {
                    'profileContent': {
                        templateUrl: 'views/app/profile/profile.posts.html'
                    }
                }
            })

            .state('app.profile.likes', {
                url: '/likes',
                views: {
                    'profileContent': {
                        templateUrl: 'views/app/profile/profile.likes.html'
                    }
                }
            })

            .state('app.mepost', {
                url: "/mepost",
                views: {
                    'menuContent': {
                        templateUrl: "views/app/home/me-post.html",
                        controller: 'HomeCtrl'
                    }
                }
            })

            .state('app.settings', {
                url: "/settings",
                views: {
                    'menuContent': {
                        templateUrl: "views/app/profile/settings.html",
                        controller: 'SettingsCtrl'
                    }
                }
            })


            //AUTH ROUTES
            .state('auth', {
                url: "/auth",
                templateUrl: "views/auth/auth.html",
                controller: "AuthCtrl",
                abstract: true
            })

            .state('auth.welcome', {
                url: '/welcome',
                templateUrl: "views/auth/welcome.html",
                controller: 'WelcomeCtrl',
                resolve: {
                    show_hidden_actions: function () {
                        return false;
                    }
                }
            })

            .state('auth.login', {
                url: '/login',
                templateUrl: "views/auth/login.html",
                controller: 'LogInCtrl'
            })

            .state('auth.signup', {
                url: '/signup',
                templateUrl: "views/auth/signup.html",
                controller: 'SignUpCtrl'
            })

            .state('auth.forgot-password', {
                url: '/forgot-password',
                templateUrl: "views/auth/forgot-password.html",
                controller: 'ForgotPasswordCtrl'
            })

            ;

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/auth/welcome');
        // $urlRouterProvider.otherwise('/app/feed');

        $translateProvider
            .translations('en-US', {
                'home': {
                    "titlehome": "Home",
                    "tabhome": "Home",
                    "tabchat": "Chat",
                    "tabnewpost": "New Post",
                    "tabrate": "Rate",
                    "tabme": "Me"
                },
                'home-list':{
                    "seeall":"See All",
                    "more":"More"                   
                },
                'chat-list':{
                    "chatlist":"Chat List"
                },
                'home-post':{
                    "add":"Add",
                    "from":"From",
                    "fromamount":"Amount",
                    "to":"To",
                    "toamount":"Amount",
                    "phone":"Phone No.",
                    "schedule":"Schedule",                    
                },
                'home-rate':{
                    "exchangerate":"Exchange Rate",
                    "search":"Search",
                    "currency":"Currency",
                    "rate":"Rate"
                },
                'legal-notice':{
                    "text1":"By Signing up you agree to the",
                    "text2":"Terms of Service",
                    "text3":"and",
                    "text4":"Privacy Policy"
                },
                'welcome':{
                    "facebook":" Facebook",
                    "signup":"Sign Up",
                    "login":"Log In",
                },
                "Loading":"Loading..."

            })
            .translations('zh-CN', {
                'home': {
                    "titlehome": "家",
                    "tabhome": "家",
                    "tabchat": "聊",
                    "tabnewpost": "新話題",
                    "tabrate": "率",
                    "tabme": "我"
                },
                'home-list':{
                    "seeall":"所有",
                    "more":"其他"                   
                },
                'chat-list':{
                    "chatlist":"聊名單"
                },
                'home-post':{
                    "add":"提高",
                    "from":"從",
                    "fromamount":"數",
                    "to":"至",
                    "toamount":"數",
                    "phone":"電話號碼。",
                    "schedule":"時間表",                    
                },
                'home-rate':{
                    "exchangerate":"匯率",
                    "search":"搜索",
                    "currency":"貨幣",
                    "rate":"率"
                },
                'legal-notice':{
                    "text1":"通過 報名 你同意",
                    "text2":"服務條款",
                    "text3":"和",
                    "text4":"隱私政策"
                },
                'welcome':{
                    "facebook":" 脸书",
                    "signup":"註冊",
                    "login":"登錄",
                },
                "loading":"載入中..."
            })
            .translations('th-TH', {
                "titlehome": "หน้าหลัก",
                "tabhome": "หน้าหลัก",
                "barchat": "พูดคุย"
            });

        $translateProvider.preferredLanguage('en');

    })


    ;
