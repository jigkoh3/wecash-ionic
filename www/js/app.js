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


    .run(function ($ionicPlatform, $rootScope, $ionicHistory, $timeout, $ionicConfig, $translate) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            var push = new Ionic.Push({
                'debug': true
            });

            push.register(function (token) {
                console.log('My Device token:', token.token);
                // prompt('My Device token:', token.token);
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
                    // alert('language: ' + language.value + '\n');
                    window.localStorage.language = language.value;
                    var tran = window.localStorage.getItem("language");
                    if (tran) {
                        $translate.use(tran);

                    }
                },
                function () { alert('Error getting language\n'); }
            );



        });
        // $ionicPlatform.on("resume", function (event, $translate) {
        //      navigator.globalization.getPreferredLanguage(
        //         function (language) {
        //             alert('language: ' + language.value + '\n');
        //             window.localStorage.language = language.value;
        //         },
        //         function () { alert('Error getting language\n'); }
        //     );

        //     var tran = window.localStorage.getItem("language");
        //     if (tran) {
        //         $translate.use(tran);


        //     }
        // });

        // This fixes transitions for transparent background views
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            if (toState.name.indexOf('auth.welcome') > -1) {
                // set transitions to android to avoid weird visual effect in the walkthrough transitions
                $timeout(function () {
                    $ionicConfig.views.transition('android');
                    $ionicConfig.views.swipeBackEnabled(false);
                    console.log('setting transition to android and disabling swipe back');
                }, 0);
            }
        });
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            if (toState.name.indexOf('app.home.list') > -1) {
                // Restore platform default transition. We are just hardcoding android transitions to auth views.
                $ionicConfig.views.transition('platform');
                // If it's ios, then enable swipe back again
                if (ionic.Platform.isIOS()) {
                    $ionicConfig.views.swipeBackEnabled(true);
                }
                console.log('enabling swipe back and restoring transition to platform default', $ionicConfig.views.transition());
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
                url: '/app',
                abstract: true,
                templateUrl: 'views/app/side-menu.html',
                controller: 'AppCtrl'
            })

            .state('app.home', {
                url: '/home',
                abstract: true,
                views: {
                    'menuContent': {
                        templateUrl: 'views/app/home.html',
                        controller: 'HomeCtrl'
                    }
                }
            })

            .state('app.home.list', {
                url: '/',
                views: {
                    'home-list': {
                        templateUrl: 'views/app/home/home-list.html',
                        controller: 'HomeCtrl'
                    }
                }
            })

            .state('app.home.post', {
                url: '/post',
                views: {
                    'home-post': {
                        templateUrl: 'views/app/home/home-post.html',
                        controller: 'HomeCtrl'
                    }
                }
            })



            .state('app.home.rate', {
                url: '/rate',
                views: {
                    'home-rate': {
                        templateUrl: 'views/app/home/home-rate.html',
                        controller: 'HomeCtrl'
                    }
                }
            })

            .state('app.home.chatlist', {
                url: '/chatList',
                views: {
                    'home-chat': {
                        templateUrl: 'views/app/chat-list/chat-list.html',
                        controller: 'ChatListCtrl'
                    }
                }
            })

            .state('app.home.more', {
                url: '/homeMore',
                views: {
                    'home-more': {
                        templateUrl: 'views/app/home/home-more.html',
                        controller: 'HomeCtrl'
                    }
                }
            })

            .state('app.detail', {
                url: '/detail/:exchangeId',
                views: {
                    'menuContent': {
                        templateUrl: 'views/app/home/detail.html',
                        controller: 'ExchangeCtrl'
                    }
                }
            })
            .state('app.chat', {
                url: '/chat/:chatId',
                views: {
                    'menuContent': {
                        templateUrl: 'views/app/chat/chatroom.html',
                        controller: 'ChatCtrl'
                    }
                }
            })

            .state('app.more', {
                url: '/more/:more',
                views: {
                    'menuContent': {
                        templateUrl: 'views/app/home/more.html',
                        controller: 'HomeCtrl'
                    }
                }
            })


            .state('home-post-location', {
                url: '/home-post-location',
                views: {
                    'menuContent': {
                        templateUrl: 'views/app/home/home-post-location.html',
                        controller: 'HomeCtrl'
                    }
                }
            })

            .state('app.all', {
                url: '/all',
                views: {
                    'menuContent': {
                        templateUrl: 'views/app/home/all.html',
                        controller: 'HomeCtrl'
                    }
                }
            })


            .state('app.profile', {
                abstract: true,
                url: '/profile/:userId',
                views: {
                    'menuContent': {
                        templateUrl: 'views/app/profile/profile.html',
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
                url: '/mepost',
                views: {
                    'menuContent': {
                        templateUrl: 'views/app/home/me-post.html',
                        controller: 'HomeCtrl'
                    }
                }
            })

            .state('app.settings', {
                url: '/settings',
                views: {
                    'menuContent': {
                        templateUrl: 'views/app/profile/settings.html',
                        controller: 'SettingsCtrl'
                    }
                }
            })


            //AUTH ROUTES
            .state('auth', {
                url: '/auth',
                templateUrl: 'views/auth/auth.html',
                controller: 'AuthCtrl',
                abstract: true
            })

            .state('auth.welcome', {
                url: '/welcome',
                templateUrl: 'views/auth/welcome.html',
                controller: 'WelcomeCtrl',
                resolve: {
                    show_hidden_actions: function () {
                        return false;
                    }
                }
            })

            .state('auth.login', {
                url: '/login',
                templateUrl: 'views/auth/login.html',
                controller: 'LogInCtrl'
            })

            .state('auth.signup', {
                url: '/signup',
                templateUrl: 'views/auth/signup.html',
                controller: 'SignUpCtrl'
            })

            .state('auth.forgot-password', {
                url: '/forgot-password',
                templateUrl: 'views/auth/forgot-password.html',
                controller: 'ForgotPasswordCtrl'
            })

            ;

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/auth/welcome');
        // $urlRouterProvider.otherwise('/app/feed');

        $translateProvider
            .translations('zh-CN', {
                'Home': '家',
                'Chat': '聊',
                'New Post': '新話題',
                'Rate': '率',
                'Me': '我',
                'See All': '所有',
                'More': '其他',
                'Chat List': '聊名單',
                'Add': '提高',
                'From': '從',
                'Amount': '數',
                'To': '至',
                'Phone No.': '電話號碼。',
                'Schedule': '時間表',
                'Exchange Rate': '匯率',
                'Search': '搜索',
                'Currency': '貨幣',
                'Australian Dollar': '澳元',
                'Bulgarian Lev': '保加利亞列弗',
                'Brazilian Real': '巴西雷亞爾',
                'Canadian Dollar': '加拿大元',
                'Swiss Franc': '瑞士法郎',
                'Yuan Renminbi': '人民幣',
                'Czech Koruna': '捷克克朗',
                'Danish Krone': '丹麥克朗',
                'Pound Sterling': '英鎊',
                'Hong Kong Dollar': '港元',
                'Croatian Kuna': '克羅地亞庫納',
                'Forint': '福林',
                'Rupiah': '印尼盾',
                'New Israeli Sheqel': '新以色列謝克爾',
                'Indian Rupee': '印度盧比',
                'Yen': '日元',
                'Won': '韓元',
                'Mexican Peso': '墨西哥比索',
                'Malaysian Ringgit': '馬來西亞令吉',
                'Norwegian Krone': '挪威克朗',
                'New Zealand Dollar': '新西蘭元',
                'Philippine Peso': '菲律賓比索',
                'Zloty': '茲羅提',
                'New Romanian Leu': '新羅馬尼亞列伊',
                'Russian Ruble': '俄羅斯盧布',
                'Swedish Krona': '瑞典克朗',
                'Singapore Dollar': '新加坡元',
                'Turkish Lira': '土耳其里拉',
                'US Dollar': '美元',
                'Rand': '蘭德',
                'Euro': '歐元',
                'By Signing up you agree to the': '通過 報名 你同意',
                'Terms of Service': '服務條款',
                'and': '和',
                'Privacy Policy': '隱私政策',
                'Facebook': ' 脸书',
                'Sign Up': '註冊',
                'Sign Out': '注销',
                'Login': '登錄',
                'Logout': '登出',
                'loading...': '載入中...',
                'Payment': '付款',
                'Credits & Referral': '積分 & 推薦',
                'Account': '帳戶',
                'Help': '帮助',
                'Settings': '設置',
                'Posts': '帖子',
                'Booking': '预订',
                'Mobile': '移动',
                'Profile': '轮廓'

            })
            .translations('th-TH', {
                'Home': 'หน้าหลัก',
                'Chat': 'พูดคุย',
                'New Post': 'โพสต์ใหม่',
                'Rate': 'อัตรา',
                'Me': 'ฉัน',
                'See All': 'ทั้งหมด',
                'More': 'เพิ่มเติม',
                'Chat List': 'รายการพูดคุย',
                'Add': 'เพิ่ม',
                'From': 'จาก',
                'Amount': 'จำนวน',
                'To': 'ไปยัง',
                'Phone No.': 'เบอร์โทรศัพท์',
                'Schedule': 'ตารางเวลา',
                'Exchange Rate': 'อัตราแลกเปลี่ยน',
                'Search': 'ค้นหา',
                'Currency': 'เงินตรา',
                'Australian Dollar': 'ดอลลาร์ออสเตรเลีย',
                'Bulgarian Lev': 'บัลแกเรียเลฟ',
                'Brazilian Real': 'บราซิลเรียล',
                'Canadian Dollar': 'ดอลลาร์แคนาดา',
                'Swiss Franc': 'ฟรังก์สวิส',
                'Yuan Renminbi': 'หยวน',
                'Czech Koruna': 'สาธารณรัฐเช็ก',
                'Danish Krone': 'โครนเดนมาร์ก',
                'Pound Sterling': 'ปอนด์สเตอร์ลิง',
                'Hong Kong Dollar': 'ดอลลาร์ฮ่องกง',
                'Croatian Kuna': 'โครเอเชีย',
                'Forint': 'โฟรินท์',
                'Rupiah': 'รูเปียห์',
                'New Israeli Sheqel': 'อิสราเอล ใหม่',
                'Indian Rupee': 'รูปีอินเดีย',
                'Yen': 'เยน',
                'Won': 'วอน',
                'Mexican Peso': 'เปโซเม็กซิกัน',
                'Malaysian Ringgit': 'ริงกิตมาเลเซีย',
                'Norwegian Krone': 'โครนนอร์เวย์',
                'New Zealand Dollar': 'ดอลลาร์นิวซีแลนด์',
                'Philippine Peso': 'เปโซ ฟิลิปปินส์',
                'Zloty': 'โปแลนด์',
                'New Romanian Leu': 'โรมาเนีย ใหม่',
                'Russian Ruble': 'รูเบิลรัสเซีย',
                'Swedish Krona': 'โครนสวีเดน',
                'Singapore Dollar': 'ดอลลาร์สิงคโปร์',
                'Turkish Lira': 'ลีร่าตุรกี',
                'US Dollar': 'ดอลลาร์สหรัฐ',
                'Rand': 'แรนด์',
                'Euro': 'ยูโร',
                'By Signing up you agree to the': 'เมื่อสมัครใช้งานคุณยอมรับข้อกำหนด',
                'Terms of Service': 'การให้บริการ ',
                'and': 'และ',
                'Privacy Policy': 'นโยบายความเป็นส่วนตัว',
                'Facebook': 'เฟซบุ๊ก',
                'Sign Up': 'ลงชื่อ',
                'Sign Out': 'ออกจากระบบ',
                'Login': 'เข้าสู่ระบบ',
                'Logout': 'ออกจากระบบ',
                'loading...': 'กำลังโหลด...',
                'Payment': 'การชำระเงิน',
                'Credits & Referral': 'เครดิตและการแนะนำ',
                'Account': 'บัญชี',
                'Help': 'ช่วยเหลือ',
                'Settings': 'ตั้งค่า',
                'Posts': 'โพสต์',
                'Booking': 'ดูการจอง',
                'Mobile': 'โทรศัพท์มือถือ',
                'Profile': 'ข้อมูลส่วนตัว'

            });

        $translateProvider.preferredLanguage('en');

    })


    ;
